-- Run in a transaction against the SMA schema; every synthetic record is rolled back.
begin;
do $$
declare v_lead_id uuid; session_key uuid:=gen_random_uuid(); result jsonb; task_id uuid;
begin
 insert into public.sma_leads(name,email,interest,source,is_test) values('SMA workflow verification','sma-workflow-check@example.com','AI Voice Agents','verification',false) returning id into v_lead_id;
 perform public.sma_crm_write('add-task',jsonb_build_object('id',v_lead_id,'title','Verify follow-up','due_at',now()-interval '1 hour'),'verification');
 select id into task_id from public.sma_followups where sma_followups.lead_id=v_lead_id;
 -- Qualify and preserve notes atomically with history.
 perform public.sma_crm_write('lead-update',jsonb_build_object('id',v_lead_id,'stage','qualified','priority','high','notes','Synthetic verification'),'verification');
 perform public.sma_crm_write('add-activity',jsonb_build_object('id',v_lead_id,'kind','call','body','Synthetic call outcome'),'verification');
 result:=public.sma_lead_search('sma-workflow-check@example.com','qualified','AI Voice Agents',0);
 if (result->>'total')::int<>1 or result->'rows'->0->>'priority'<>'high' or (result->'rows'->0->>'open_tasks')::int<>1 then raise exception 'Lead search failed'; end if;
 if (public.sma_work_queue()->>'overdue')::int<1 then raise exception 'Overdue queue failed'; end if;
 perform public.sma_crm_write('complete-task',jsonb_build_object('id',task_id),'verification');
 result:=public.sma_crm_write('complete-task',jsonb_build_object('id',task_id),'verification');
 if not result ? 'error' then raise exception 'Duplicate completion accepted'; end if;
 if (select count(*) from public.sma_lead_activity a where a.lead_id=v_lead_id and kind='stage')<>1 then raise exception 'Stage history missing'; end if;
 if (select count(*) from public.sma_lead_activity a where a.lead_id=v_lead_id and body='Completed: Verify follow-up')<>1 then raise exception 'Completion history duplicated'; end if;
 insert into public.sma_events(id,event,path,session_id,device,is_test) values(gen_random_uuid(),'page_view','/verification',session_key,'tablet',false),(gen_random_uuid(),'booking_opened','/verification',session_key,'tablet',false),(gen_random_uuid(),'booking_opened','/verification',session_key,'tablet',false);
 result:=public.sma_insights(7,'tablet');
 if (result->>'bookingRate')::numeric>100 or (result->>'bookingRate')::numeric<=0 then raise exception 'Session booking rate failed'; end if;
end $$;
set local role authenticated;
do $$ begin
 if exists(select 1 from public.sma_followups) or exists(select 1 from public.sma_lead_activity) then raise exception 'Unapproved user can read CRM'; end if;
 if has_function_privilege('authenticated','public.sma_crm_write(text,jsonb,text)','execute') or has_function_privilege('anon','public.sma_work_queue()','execute') then raise exception 'Private RPC exposed'; end if;
end $$;
reset role;
select 'Workflow, analytics, atomic history and unauthorized access checks passed; test records rolled back.' as result;
rollback;
