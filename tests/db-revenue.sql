begin;
do $$
declare v_id uuid; before_data jsonb; after_data jsonb;
begin
 before_data:=public.sma_revenue(30);
 insert into public.sma_leads(name,email,interest,source) values('Opportunity verification','sma-opportunity-test@example.com','VedaKosa','referral') returning id into v_id;
 if (public.sma_revenue(30)->>'unvalued')::int<>(before_data->>'unvalued')::int+1 then raise exception 'Unknown opportunity value was not preserved'; end if;
 perform public.sma_crm_write('lead-update',jsonb_build_object('id',v_id,'stage','qualified','notes','','deal_value',1200.50,'win_probability',60,'expected_close','2027-01-15'),'verification');
 after_data:=public.sma_revenue(30);
 if (after_data->>'totalLeads')::int<>(before_data->>'totalLeads')::int+1 or (after_data->>'openValue')::numeric<>(before_data->>'openValue')::numeric+1200.50 or (after_data->>'weightedValue')::numeric<>(before_data->>'weightedValue')::numeric+720.30 then raise exception 'Opportunity totals or weighted forecast incorrect'; end if;
 if (public.sma_lead_search('sma-opportunity-test@example.com','','',0)->'rows'->0->>'deal_value')::numeric<>1200.50 then raise exception 'Value missing from lead search'; end if;
 perform public.sma_crm_write('lead-update',jsonb_build_object('id',v_id,'stage','won','notes',''),'verification');
 if (select closed_at from public.sma_leads where id=v_id) is null then raise exception 'Won date not recorded'; end if;
 after_data:=public.sma_revenue(30);
 if (after_data->>'wonValue')::numeric<>(before_data->>'wonValue')::numeric+1200.50 or (after_data->>'openValue')::numeric<>(before_data->>'openValue')::numeric then raise exception 'Won value counted incorrectly'; end if;
 perform public.sma_crm_write('lead-update',jsonb_build_object('id',v_id,'stage','contacted','notes',''),'verification');
 if (select closed_at from public.sma_leads where id=v_id) is not null then raise exception 'Reopened opportunity kept a closed date'; end if;
 if not exists(select 1 from public.sma_lead_activity where lead_id=v_id and body like 'Opportunity updated:%') then raise exception 'Value change missing from timeline'; end if;
 if has_function_privilege('authenticated','public.sma_revenue(int)','execute') then raise exception 'Direct revenue RPC exposed'; end if;
end $$;
insert into public.sma_members(email,role) values('sma-test-viewer@example.com','viewer');
select set_config('request.jwt.claims','{"email":"sma-test-viewer@example.com","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.sma_leads) or exists(select 1 from public.sma_lead_activity) then raise exception 'Report viewer can read private CRM records'; end if;
 if has_table_privilege('authenticated','public.sma_reporting_config','select') then raise exception 'Direct config access granted'; end if;
 if not has_table_privilege('authenticated','public.sma_report_snapshots','select') then raise exception 'Report reads unavailable'; end if;
end $$;
reset role;
select 'Revenue, weighted forecast, close tracking, search values, activity and viewer boundaries passed. All synthetic records rolled back.' as result;
rollback;
