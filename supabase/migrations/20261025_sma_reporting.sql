create function public.sma_overview(p_days int) returns jsonb
language sql stable security definer set search_path='' as $$
 with recent as (select * from public.sma_events where created_at>=now()-make_interval(days=>least(greatest(p_days,1),90)) and not is_test),
 pages as (select path,count(*) views,count(distinct session_id) sessions from recent where event='page_view' group by path order by views desc limit 30),
 days as (select created_at::date as "day",count(*) views from recent where event='page_view' group by 1 order by 1),
 clicks as (select event,count(*) total from recent where event<>'page_view' group by event order by total desc),
 sources as (select coalesce(nullif(referrer_host,''),'Direct / unknown') source,count(*) views from recent where event='page_view' group by 1 order by 2 desc limit 10),
 devices as (select device,count(*) views from recent where event='page_view' group by device),
 leads as (select stage,count(*) total from public.sma_leads where not is_test and created_at>=now()-make_interval(days=>least(greatest(p_days,1),90)) group by stage)
 select jsonb_build_object(
  'views',(select count(*) from recent where event='page_view'),
  'sessions',(select count(distinct session_id) from recent where event='page_view'),
  'bookingClicks',(select count(*) from recent where event='booking_opened'),
  'leads',(select count(*) from public.sma_leads where not is_test and created_at>=now()-make_interval(days=>least(greatest(p_days,1),90))),
  'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),
  'daily',coalesce((select jsonb_agg(days) from days),'[]'::jsonb),
  'clicks',coalesce((select jsonb_agg(clicks) from clicks),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
  'devices',coalesce((select jsonb_agg(devices) from devices),'[]'::jsonb),
  'pipeline',coalesce((select jsonb_agg(leads) from leads),'[]'::jsonb),
  'calendarSync',false,'voiceTrainingConnected',false);
$$;
revoke all on function public.sma_overview(int) from public,anon,authenticated;
grant execute on function public.sma_overview(int) to service_role;
