-- User explicitly approved owner/editor/viewer scopes in this conversation.
-- Only new SMA resources are affected; existing application tables are unchanged.
create function sma_private.is_editor() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sma_members where email=lower(auth.jwt()->>'email') and role in ('owner','editor'));
$$;
create function sma_private.is_owner() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sma_members where email=lower(auth.jwt()->>'email') and role='owner');
$$;
revoke all on function sma_private.is_editor() from public,anon;
revoke all on function sma_private.is_owner() from public,anon;
grant execute on function sma_private.is_editor() to authenticated;
grant execute on function sma_private.is_owner() to authenticated;
alter policy sma_member_read on public.sma_members using (sma_private.is_owner());
do $$ declare t text; begin
 foreach t in array array['sma_leads','sma_content_drafts','sma_content_versions','sma_media','sma_audit'] loop
  execute format('alter policy sma_member_read on public.%I using (sma_private.is_editor())',t);
 end loop;
end $$;
