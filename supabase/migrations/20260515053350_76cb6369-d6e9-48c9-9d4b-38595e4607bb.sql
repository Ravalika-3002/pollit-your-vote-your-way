
-- Enums
create type poll_type as enum ('single', 'multiple');
create type poll_visibility as enum ('public', 'private');
create type poll_results_visibility as enum ('always', 'after_vote');
create type poll_status as enum ('draft', 'open', 'closed');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Polls
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  poll_type poll_type not null default 'single',
  visibility poll_visibility not null default 'public',
  results_visibility poll_results_visibility not null default 'always',
  status poll_status not null default 'draft',
  end_at timestamptz,
  share_token text unique not null default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index polls_creator_idx on public.polls(creator_id);
create index polls_status_idx on public.polls(status);
create index polls_visibility_idx on public.polls(visibility);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index poll_options_poll_idx on public.poll_options(poll_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_at timestamptz not null default now(),
  unique (poll_id, invited_user_id)
);
create index invitations_user_idx on public.invitations(invited_user_id);
create index invitations_poll_idx on public.invitations(poll_id);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
create index votes_poll_idx on public.votes(poll_id);
create index votes_user_idx on public.votes(user_id);

create table public.vote_options (
  vote_id uuid not null references public.votes(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  primary key (vote_id, option_id)
);
create index vote_options_option_idx on public.vote_options(option_id);

-- Security definer helpers
create or replace function public.is_poll_creator(_poll_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.polls where id = _poll_id and creator_id = _user_id);
$$;

create or replace function public.is_invited(_poll_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.invitations where poll_id = _poll_id and invited_user_id = _user_id);
$$;

create or replace function public.can_view_poll(_poll_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.polls p
    where p.id = _poll_id
    and (
      p.creator_id = _user_id
      or (p.status <> 'draft' and p.visibility = 'public')
      or (p.status <> 'draft' and p.visibility = 'private' and exists (
        select 1 from public.invitations i where i.poll_id = p.id and i.invited_user_id = _user_id
      ))
    )
  );
$$;

create or replace function public.has_voted(_poll_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.votes where poll_id = _poll_id and user_id = _user_id);
$$;

-- RLS: polls
alter table public.polls enable row level security;
create policy "view polls per access" on public.polls for select to authenticated
  using (public.can_view_poll(id, auth.uid()));
create policy "creator inserts polls" on public.polls for insert to authenticated
  with check (auth.uid() = creator_id);
create policy "creator updates polls (not closed)" on public.polls for update to authenticated
  using (auth.uid() = creator_id and status <> 'closed')
  with check (auth.uid() = creator_id);
create policy "creator deletes drafts" on public.polls for delete to authenticated
  using (auth.uid() = creator_id and status = 'draft');

-- RLS: poll_options
alter table public.poll_options enable row level security;
create policy "view options per poll access" on public.poll_options for select to authenticated
  using (public.can_view_poll(poll_id, auth.uid()));
create policy "creator manages options when not closed" on public.poll_options for all to authenticated
  using (
    public.is_poll_creator(poll_id, auth.uid())
    and not exists (select 1 from public.polls where id = poll_id and status = 'closed')
  )
  with check (
    public.is_poll_creator(poll_id, auth.uid())
    and not exists (select 1 from public.polls where id = poll_id and status = 'closed')
  );

-- RLS: invitations
alter table public.invitations enable row level security;
create policy "creator views invitations" on public.invitations for select to authenticated
  using (public.is_poll_creator(poll_id, auth.uid()) or invited_user_id = auth.uid());
create policy "creator manages invitations" on public.invitations for insert to authenticated
  with check (public.is_poll_creator(poll_id, auth.uid()) and invited_by = auth.uid());
create policy "creator deletes invitations" on public.invitations for delete to authenticated
  using (public.is_poll_creator(poll_id, auth.uid()));

-- RLS: votes
alter table public.votes enable row level security;
create policy "view votes when poll viewable" on public.votes for select to authenticated
  using (public.can_view_poll(poll_id, auth.uid()));
create policy "user inserts own vote on open viewable poll" on public.votes for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.polls where id = poll_id and status = 'open')
    and public.can_view_poll(poll_id, auth.uid())
  );
create policy "user deletes own vote on open poll" on public.votes for delete to authenticated
  using (
    auth.uid() = user_id
    and exists (select 1 from public.polls where id = poll_id and status = 'open')
  );

-- RLS: vote_options
alter table public.vote_options enable row level security;
create policy "view vote_options when poll viewable" on public.vote_options for select to authenticated
  using (exists (
    select 1 from public.votes v where v.id = vote_id and public.can_view_poll(v.poll_id, auth.uid())
  ));
create policy "user inserts own vote_options" on public.vote_options for insert to authenticated
  with check (exists (
    select 1 from public.votes v
    join public.polls p on p.id = v.poll_id
    where v.id = vote_id and v.user_id = auth.uid() and p.status = 'open'
  ));
create policy "user deletes own vote_options" on public.vote_options for delete to authenticated
  using (exists (
    select 1 from public.votes v
    join public.polls p on p.id = v.poll_id
    where v.id = vote_id and v.user_id = auth.uid() and p.status = 'open'
  ));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger polls_updated_at before update on public.polls
  for each row execute function public.set_updated_at();
