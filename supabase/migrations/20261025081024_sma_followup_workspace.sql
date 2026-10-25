-- SMA-only workflow data. Existing leads and other applications are preserved.
alter table public.sma_leads add column priority text not null default 'normal' check (priority in ('normal','high'));
create table public.sma_followups (
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.sma_leads(id),
 title text not null check (length(title) between 1 and 180), due_at timestamptz not null,
 status text not null default 'open' check (status in ('open','completed')),
 created_by text not null, created_at timestamptz not null default now(), completed_at timestamptz
);
create index sma_followups_open_due on public.sma_followups(due_at,id) where status='open';
create index sma_followups_lead on public.sma_followups(lead_id,created_at desc);
create table public.sma_lead_activity (
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.sma_leads(id),
 kind text not null check (kind in ('note','call','email','meeting','stage','task')),
 body text not null check (length(body) between 1 and 4000), actor text not null, created_at timestamptz not null default now()
);
create index sma_lead_activity_timeline on public.sma_lead_activity(lead_id,created_at desc,id);
create index sma_leads_live_stage on public.sma_leads(stage,created_at desc,id) where not is_test;
alter table public.sma_followups enable row level security;
alter table public.sma_lead_activity enable row level security;
revoke all on public.sma_followups,public.sma_lead_activity from public,anon,authenticated;
grant select on public.sma_followups,public.sma_lead_activity to authenticated;
grant all on public.sma_followups,public.sma_lead_activity to service_role;
create policy sma_followups_editor_read on public.sma_followups for select to authenticated using ((select sma_private.is_editor()));
create policy sma_activity_editor_read on public.sma_lead_activity for select to authenticated using ((select sma_private.is_editor()));

-- Invoker RPCs are callable only by the server role, after the Edge Function verifies membership.
create function public.sma_crm_write(p_action text,p_data jsonb,p_actor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare l public.sma_leads; t public.sma_followups; old_stage text;
begin
 if p_action='complete-task' then
  update public.sma_followups set status='completed',completed_at=now() where id=(p_data->>'id')::uuid and status='open' returning * into t;
  if not found then return jsonb_build_object('error','Task is already complete or unavailable.'); end if;
  insert into public.sma_lead_activity(lead_id,kind,body,actor) values(t.lead_id,'task','Completed: '||t.title,p_actor);
  return to_jsonb(t);
 end if;
 select * into l from public.sma_leads where id=(p_data->>'id')::uuid for update;
 if not found then return jsonb_build_object('error','Lead not found.'); end if;
 if p_action='lead-update' then
  old_stage=l.stage;
  update public.sma_leads set stage=p_data->>'stage',notes=p_data->>'notes',priority=coalesce(p_data->>'priority','normal'),updated_at=now() where id=l.id;
  if old_stage<>p_data->>'stage' then
   insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'stage',old_stage||' → '||(p_data->>'stage'),p_actor);
  end if;
  if l.notes is distinct from p_data->>'notes' or l.priority is distinct from coalesce(p_data->>'priority','normal') then
   insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'note','Updated private summary or priority.',p_actor);
  end if;
 elsif p_action='add-task' then
  insert into public.sma_followups(lead_id,title,due_at,created_by) values(l.id,p_data->>'title',(p_data->>'due_at')::timestamptz,p_actor) returning * into t;
  insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'task','Scheduled: '||t.title,p_actor);
 elsif p_action='add-activity' then
  insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,p_data->>'kind',p_data->>'body',p_actor);
  update public.sma_leads set updated_at=now() where id=l.id;
 else raise exception 'Unknown CRM action'; end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.sma_crm_write(text,jsonb,text) from public,anon,authenticated;
grant execute on function public.sma_crm_write(text,jsonb,text) to service_role;

create function public.sma_lead_search(p_query text default '',p_stage text default '',p_interest text default '',p_offset int default 0) returns jsonb
language sql stable security invoker set search_path='' as $$
 with matched as (
  select l.* from public.sma_leads l where not l.is_test
  and (p_stage='' or l.stage=p_stage) and (p_interest='' or l.interest=p_interest)
  and (p_query='' or strpos(lower(l.name||' '||l.email||' '||l.business),lower(p_query))>0)
 ), page as (
  select m.*, (select min(due_at) from public.sma_followups f where f.lead_id=m.id and f.status='open') next_due,
  (select count(*) from public.sma_followups f where f.lead_id=m.id and f.status='open') open_tasks
  from matched m order by (m.priority='high') desc,m.created_at desc,m.id limit 50 offset greatest(p_offset,0)
 ) select jsonb_build_object('total',(select count(*) from matched),'rows',coalesce((select jsonb_agg(page) from page),'[]'::jsonb));
$$;
revoke all on function public.sma_lead_search(text,text,text,int) from public,anon,authenticated;
grant execute on function public.sma_lead_search(text,text,text,int) to service_role;

create function public.sma_work_queue() returns jsonb language sql stable security invoker set search_path='' as $$
 with tasks as (select f.*,l.name,l.business,l.interest,l.stage from public.sma_followups f join public.sma_leads l on l.id=f.lead_id where not l.is_test and f.status='open'),
 rows as (select * from tasks order by due_at,id limit 100),
 stages as (select stage,count(*) total from public.sma_leads where not is_test group by stage)
 select jsonb_build_object('overdue',(select count(*) from tasks where due_at<now()),
 'next24h',(select count(*) from tasks where due_at>=now() and due_at<now()+interval '24 hours'),
 'unassigned',(select count(*) from public.sma_leads l where not is_test and stage not in ('won','closed') and not exists(select 1 from public.sma_followups f where f.lead_id=l.id and f.status='open')),
 'stale',(select count(*) from public.sma_leads where not is_test and stage not in ('won','closed') and updated_at<now()-interval '7 days'),
 'pipeline',coalesce((select jsonb_agg(stages) from stages),'[]'::jsonb),'tasks',coalesce((select jsonb_agg(rows) from rows),'[]'::jsonb));
$$;
revoke all on function public.sma_work_queue() from public,anon,authenticated;
grant execute on function public.sma_work_queue() to service_role;

create function public.sma_insights(p_days int default 30,p_device text default '') returns jsonb language sql stable security invoker set search_path='' as $$
 with bounds as (select now()-make_interval(days=>least(greatest(p_days,1),90)) start_at,now()-make_interval(days=>2*least(greatest(p_days,1),90)) prev_at),
 filtered as (select e.* from public.sma_events e,bounds b where not e.is_test and e.created_at>=b.prev_at and (p_device='' or e.device=p_device)),
 current_events as (select f.* from filtered f,bounds b where f.created_at>=b.start_at),
 previous_events as (select f.* from filtered f,bounds b where f.created_at<b.start_at),
 daily as (select d.day::date as "day",count(e.id) views from generate_series((select start_at::date from bounds),current_date,interval '1 day') d(day) left join current_events e on e.created_at::date=d.day::date and e.event='page_view' group by d.day order by d.day),
 pages as (select path,count(*) views,count(distinct session_id) sessions from current_events where event='page_view' group by path order by views desc limit 50),
 sources as (select coalesce(nullif(referrer_host,''),'Direct / unknown') source,count(*) views from current_events where event='page_view' group by 1 order by 2 desc limit 15),
 clicks as (select event,count(*) total from current_events where event<>'page_view' group by event order by total desc),
 devices as (select device,count(*) views from current_events where event='page_view' group by device)
 select jsonb_build_object('views',(select count(*) from current_events where event='page_view'),
 'sessions',(select count(distinct session_id) from current_events where event='page_view'),
 'bookingClicks',(select count(*) from current_events where event='booking_opened'),
 'leads',(select count(*) from public.sma_leads,bounds b where not is_test and created_at>=b.start_at),
 'previous',jsonb_build_object('views',(select count(*) from previous_events where event='page_view'),'sessions',(select count(distinct session_id) from previous_events where event='page_view'),'bookingClicks',(select count(*) from previous_events where event='booking_opened'),'leads',(select count(*) from public.sma_leads,bounds b where not is_test and created_at>=b.prev_at and created_at<b.start_at)),
 'bookingRate',coalesce((select round(100.0*count(distinct session_id) filter(where event='booking_opened')/nullif(count(distinct session_id) filter(where event='page_view'),0),1) from current_events where session_id in(select session_id from current_events where event='page_view')),0),
 'daily',coalesce((select jsonb_agg(daily) from daily),'[]'::jsonb),'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),'clicks',coalesce((select jsonb_agg(clicks) from clicks),'[]'::jsonb),'devices',coalesce((select jsonb_agg(devices) from devices),'[]'::jsonb),'generatedAt',now());
$$;
revoke all on function public.sma_insights(int,text) from public,anon,authenticated;
grant execute on function public.sma_insights(int,text) to service_role;
