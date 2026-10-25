-- Permission hardening only for the SMA resources created in this task.
-- No event retention, historical-data deletion or unrelated application changes.
create schema sma_private;
revoke all on schema sma_private from public,anon;
grant usage on schema sma_private to authenticated;
create function sma_private.is_member() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sma_members where email=lower(auth.jwt()->>'email'));
$$;
revoke all on function sma_private.is_member() from public,anon;
grant execute on function sma_private.is_member() to authenticated;
do $$ declare t text; begin
 foreach t in array array['sma_members','sma_events','sma_leads','sma_content_drafts','sma_published_content','sma_content_versions','sma_media','sma_audit'] loop
  execute format('alter policy sma_member_read on public.%I using (sma_private.is_member())',t);
 end loop;
end $$;
revoke all on function public.sma_is_member() from public,anon,authenticated;
revoke all on function sma_private.is_member() from anon;
create policy sma_rate_deny_browser on public.sma_rate_limits for select to authenticated using (false);
