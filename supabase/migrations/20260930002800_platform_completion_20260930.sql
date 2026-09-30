begin;
create table if not exists public.lingxifield_creations(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null default 'creation',
 title text not null,
 status text not null default 'saved' check(status in('saved','archived')),
 result_url text,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.lingxifield_creations enable row level security;
revoke all on public.lingxifield_creations from anon;
grant select,insert,update,delete on public.lingxifield_creations to authenticated;
drop policy if exists "creations_owner_select" on public.lingxifield_creations;
create policy "creations_owner_select" on public.lingxifield_creations for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists "creations_owner_insert" on public.lingxifield_creations;
create policy "creations_owner_insert" on public.lingxifield_creations for insert to authenticated with check(owner_id=(select auth.uid()));
drop policy if exists "creations_owner_update" on public.lingxifield_creations;
create policy "creations_owner_update" on public.lingxifield_creations for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists "creations_owner_delete" on public.lingxifield_creations;
create policy "creations_owner_delete" on public.lingxifield_creations for delete to authenticated using(owner_id=(select auth.uid()));
create index if not exists lingxifield_creations_owner_created_idx on public.lingxifield_creations(owner_id,created_at desc);

insert into public.lingxifield_announcements(platform,version_label,title_zh,body_zh,title_en,body_en,is_active,published_at)
select 'all','4.8.7','灵犀场 4.8.7｜全球发现与创作生态升级',
'全球 SEO/GEO 与九语言发现层继续完善；新增“我的创作”、公开模板发现与支持中心底座。私人作品不会自动公开，模板进入公开发现前必须由用户主动提交并通过审核。',
'LINGXIFIELD 4.8.7 | Global discovery and creation ecosystem',
'Global discovery, nine-language entry points, My Creations, approved public templates and support status foundations. Private creations are never published automatically.',
true,now()
where not exists(select 1 from public.lingxifield_announcements where platform='all' and version_label='4.8.7');
commit;
