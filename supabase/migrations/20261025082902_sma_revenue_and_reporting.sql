alter table public.sma_leads
 add column deal_value numeric(14,2) check (deal_value>=0 and deal_value<=999999999999.99),
 add column win_probability int not null default 20 check (win_probability between 0 and 100),
 add column expected_close date,
 add column closed_at timestamptz;
-- An unset value means unknown, rather than assigning invented revenue to existing leads.
create table public.sma_reporting_config (
 id boolean primary key default true check (id), ga4_property text not null default '',
 search_property text not null default '', semrush_domain text not null default '',updated_at timestamptz not null default now()
);
insert into public.sma_reporting_config(id) values(true);
create table public.sma_report_snapshots (
 source text not null check (source in ('ga4','search-console','semrush','site-audit')),
 period_days int not null check (period_days in (0,7,30,90)), data jsonb not null,
 synced_at timestamptz not null default now(),primary key(source,period_days)
);
alter table public.sma_reporting_config enable row level security;
alter table public.sma_report_snapshots enable row level security;
revoke all on public.sma_reporting_config,public.sma_report_snapshots from public,anon,authenticated;
grant select on public.sma_report_snapshots to authenticated;
grant all on public.sma_reporting_config,public.sma_report_snapshots to service_role;
create policy sma_reports_member_read on public.sma_report_snapshots for select to authenticated using ((select sma_private.is_member()));
-- Config is server-managed, never exposes credentials and is owner-only in the Edge API.
create policy sma_config_no_direct_access on public.sma_reporting_config for all to authenticated using(false) with check(false);

create function sma_private.record_close_date() returns trigger language plpgsql set search_path='' as $$
begin
 if new.stage in ('won','closed') and old.stage is distinct from new.stage then new.closed_at=now();
 elsif new.stage not in ('won','closed') then new.closed_at=null; end if;
 return new;
end $$;
revoke all on function sma_private.record_close_date() from public,anon,authenticated;
create trigger sma_record_lead_close before update of stage on public.sma_leads for each row execute function sma_private.record_close_date();

create function public.sma_revenue(p_days int default 30) returns jsonb language sql stable security invoker set search_path='' as $$
 with live as (select * from public.sma_leads where not is_test),
 by_stage as (select stage,count(*) leads,count(deal_value) valued,sum(coalesce(deal_value,0)) value,
 sum(case when stage='won' then coalesce(deal_value,0) when stage='closed' then 0 else coalesce(deal_value,0)*win_probability/100 end) weighted from live group by stage),
 services as (select interest,count(*) leads,sum(coalesce(deal_value,0)) value from live group by interest),
 sources as (select source,count(*) leads,sum(coalesce(deal_value,0)) value from live group by source),
 monthly as (select to_char(expected_close,'YYYY-MM') as "month",count(*) leads,sum(coalesce(deal_value,0)) value,sum(coalesce(deal_value,0)*win_probability/100) weighted from live where stage not in ('won','closed') and expected_close is not null group by 1 order by 1),
 recent as (select created_at::date as "day",count(*) leads from live where created_at>=now()-make_interval(days=>least(greatest(p_days,1),90)) group by 1 order by 1)
 select jsonb_build_object('currency','USD','totalLeads',(select count(*) from live),
 'newLeads',(select count(*) from live where created_at>=now()-make_interval(days=>least(greatest(p_days,1),90))),
 'openLeads',(select count(*) from live where stage not in ('won','closed')),
 'openValue',coalesce((select sum(deal_value) from live where stage not in ('won','closed')),0),
 'weightedValue',coalesce((select sum(deal_value*win_probability/100) from live where stage not in ('won','closed')),0),
 'wonValue',coalesce((select sum(deal_value) from live where stage='won'),0),
 'wonPeriodValue',coalesce((select sum(deal_value) from live where stage='won' and closed_at>=now()-make_interval(days=>least(greatest(p_days,1),90))),0),
 'unvalued',(select count(*) from live where deal_value is null),
 'winRate',(select round(100.0*count(*) filter(where stage='won')/nullif(count(*) filter(where stage in ('won','closed')),0),1) from live),
 'stages',coalesce((select jsonb_agg(by_stage) from by_stage),'[]'::jsonb),
 'services',coalesce((select jsonb_agg(services) from services),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
 'forecast',coalesce((select jsonb_agg(monthly) from monthly),'[]'::jsonb),
 'dailyLeads',coalesce((select jsonb_agg(recent) from recent),'[]'::jsonb));
$$;
revoke all on function public.sma_revenue(int) from public,anon,authenticated;
grant execute on function public.sma_revenue(int) to service_role;

create or replace function public.sma_crm_write(p_action text,p_data jsonb,p_actor text) returns jsonb
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
  update public.sma_leads set stage=p_data->>'stage',notes=p_data->>'notes',priority=coalesce(p_data->>'priority','normal'),deal_value=case when p_data ? 'deal_value' then (p_data->>'deal_value')::numeric else l.deal_value end,win_probability=coalesce((p_data->>'win_probability')::int,l.win_probability),expected_close=case when p_data ? 'expected_close' then (p_data->>'expected_close')::date else l.expected_close end,updated_at=now() where id=l.id;
  if old_stage<>p_data->>'stage' then
   insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'stage',old_stage||' → '||(p_data->>'stage'),p_actor);
  end if;
  if l.notes is distinct from p_data->>'notes' or l.priority is distinct from coalesce(p_data->>'priority','normal') then
   insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'note','Updated private summary or priority.',p_actor);
  end if;
  if p_data ? 'deal_value' and (l.deal_value is distinct from (p_data->>'deal_value')::numeric or l.win_probability is distinct from (p_data->>'win_probability')::int or l.expected_close is distinct from (p_data->>'expected_close')::date) then
   insert into public.sma_lead_activity(lead_id,kind,body,actor) values(l.id,'note','Opportunity updated: USD '||coalesce(p_data->>'deal_value','not estimated')||'; likelihood '||(p_data->>'win_probability')||'%; expected close '||coalesce(p_data->>'expected_close','not set')||'.',p_actor);
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

