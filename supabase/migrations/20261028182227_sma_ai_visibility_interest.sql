-- Expand SMA's existing service choice; keep all roles and row policies intact.
begin;
alter table public.sma_leads drop constraint sma_leads_interest_check;
alter table public.sma_leads add constraint sma_leads_interest_check
  check (interest in ('AI Voice Agents','VedaKosa','AI Visibility','Existing client support','Not sure yet'));
commit;
