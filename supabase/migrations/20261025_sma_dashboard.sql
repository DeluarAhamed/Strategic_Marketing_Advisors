-- SMA data is namespaced. No existing application tables or auth settings are changed.
create table public.sma_members (
  email text primary key check (email=lower(email)),
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now()
);
-- Bootstrap the approved owner separately through an authorized admin connection.
-- Personal owner emails do not belong in the public repository.

create function public.sma_is_member() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sma_members where email=lower(auth.jwt()->>'email'));
$$;
revoke all on function public.sma_is_member() from public;
grant execute on function public.sma_is_member() to authenticated;

create table public.sma_events (
  id uuid primary key,
  created_at timestamptz not null default now(),
  event text not null check(event in ('page_view','booking_opened','voice_panel_opened','resource_clicked','phone_clicked','lead_submitted')),
  path text not null check(length(path)<=200),
  session_id uuid not null,
  referrer_host text not null default '',
  device text not null check(device in ('mobile','tablet','desktop')),
  target text not null default '' check(length(target)<=200),
  is_test boolean not null default false
);
create index sma_events_date on public.sma_events(created_at desc);
create index sma_events_path_date on public.sma_events(path,created_at desc);
create table public.sma_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  business text not null default '',
  interest text not null check(interest in ('AI Voice Agents','VedaKosa','Existing client support','Not sure yet')),
  message text not null default '',
  stage text not null default 'new' check(stage in ('new','contacted','qualified','booked','won','closed')),
  notes text not null default '',
  source text not null default 'website',
  consent_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_test boolean not null default false
);
create index sma_leads_date on public.sma_leads(created_at desc);
create table public.sma_content_drafts (
  path text primary key check(path ~ '^/[a-z0-9/-]*$'),
  kind text not null check(kind in ('page','article')),
  content jsonb not null,
  revision int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);
create table public.sma_published_content (
  path text primary key,
  kind text not null check(kind in ('page','article')),
  content jsonb not null,
  revision int not null,
  published_at timestamptz not null default now()
);
create table public.sma_content_versions (
  id bigint generated always as identity primary key,
  path text not null,
  content jsonb not null,
  revision int not null,
  published_by text not null,
  created_at timestamptz not null default now()
);
create table public.sma_media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  alt text not null default '',
  created_at timestamptz not null default now(),
  created_by text not null
);
create table public.sma_audit (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target text not null default '',
  created_at timestamptz not null default now()
);
create table public.sma_rate_limits (
  bucket text not null,
  key_hash text not null,
  window_start timestamptz not null,
  attempts int not null,
  primary key(bucket,key_hash,window_start)
);
create function public.sma_rate_allowed(p_bucket text,p_key text,p_limit int,p_seconds int) returns boolean
language plpgsql security definer set search_path='' as $$
declare stamp timestamptz; n int;
begin
 stamp := to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
 insert into public.sma_rate_limits values(p_bucket,p_key,stamp,1)
 on conflict(bucket,key_hash,window_start) do update set attempts=public.sma_rate_limits.attempts+1 returning attempts into n;
 delete from public.sma_rate_limits where window_start<now()-interval '2 days';
 return n<=p_limit;
end; $$;
revoke all on function public.sma_rate_allowed(text,text,int,int) from public,anon,authenticated;
grant execute on function public.sma_rate_allowed(text,text,int,int) to service_role;

create function public.sma_publish(p_path text,p_revision int,p_actor text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare draft public.sma_content_drafts;
begin
 select * into draft from public.sma_content_drafts where path=p_path for update;
 if not found then raise exception 'Draft not found'; end if;
 if draft.revision<>p_revision then raise exception 'Draft changed. Reload before publishing.'; end if;
 insert into public.sma_published_content(path,kind,content,revision) values(draft.path,draft.kind,draft.content,draft.revision)
 on conflict(path) do update set content=excluded.content,kind=excluded.kind,revision=excluded.revision,published_at=now();
 insert into public.sma_content_versions(path,content,revision,published_by) values(draft.path,draft.content,draft.revision,p_actor);
 insert into public.sma_audit(actor,action,target) values(p_actor,'publish',draft.path);
 return jsonb_build_object('path',draft.path,'revision',draft.revision);
end; $$;
revoke all on function public.sma_publish(text,int,text) from public,anon,authenticated;
grant execute on function public.sma_publish(text,int,text) to service_role;

do $$ declare t text; begin
 foreach t in array array['sma_members','sma_events','sma_leads','sma_content_drafts','sma_published_content','sma_content_versions','sma_media','sma_audit','sma_rate_limits'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  if t<>'sma_rate_limits' then execute format('create policy sma_member_read on public.%I for select to authenticated using (public.sma_is_member())',t); end if;
 end loop;
end $$;
grant select on public.sma_published_content to anon;
create policy sma_public_published_read on public.sma_published_content for select to anon using (true);
-- All writes go through the authenticated/validated Edge Function. No browser service key.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('sma-media','sma-media',true,2097152,array['image/jpeg','image/png','image/webp']);
