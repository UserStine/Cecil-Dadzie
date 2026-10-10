-- Run in Supabase SQL Editor before seeding the portfolio.
create table if not exists public.portfolio_content (
  id integer primary key check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.portfolio_content enable row level security;
-- No RLS policies: public clients cannot query or modify this table.
-- Next.js server routes use the secret service-role key only after authorisation.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
-- Public read, but no browser write policies. Admin uploads use server-side service role.
