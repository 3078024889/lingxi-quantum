begin;

-- Nutrition data stays server-owned. Public clients use bounded SECURITY DEFINER RPCs only.
alter table if exists public.nutrition_sources enable row level security;
alter table if exists public.nutrition_foods enable row level security;
alter table if exists public.nutrition_aliases enable row level security;
alter table if exists public.nutrition_nutrients enable row level security;
alter table if exists public.nutrition_portions enable row level security;

drop policy if exists nutrition_sources_public_read on public.nutrition_sources;
drop policy if exists nutrition_foods_public_read on public.nutrition_foods;
drop policy if exists nutrition_aliases_public_read on public.nutrition_aliases;
drop policy if exists nutrition_nutrients_public_read on public.nutrition_nutrients;
drop policy if exists nutrition_portions_public_read on public.nutrition_portions;

revoke all on public.nutrition_sources,public.nutrition_foods,public.nutrition_aliases,public.nutrition_nutrients,public.nutrition_portions from anon,authenticated;

create index if not exists nutrition_foods_brand_trgm on public.nutrition_foods using gin(lower(coalesce(brand_name,'')) gin_trgm_ops);
create index if not exists nutrition_aliases_lang_priority on public.nutrition_aliases(lang,priority,food_id);

create or replace function public.search_food_nutrition_v3(p_queries text[],p_limit integer default 12)
returns table(
 food_id bigint,code text,name_zh text,name_en text,category text,data_type text,brand_name text,
 kcal_per_100g numeric,protein_g_per_100g numeric,carbs_g_per_100g numeric,fat_g_per_100g numeric,
 fiber_g_per_100g numeric,sugar_g_per_100g numeric,added_sugar_g_per_100g numeric,sodium_mg_per_100g numeric,
 nutrient_count bigint,source_key text,source_food_id text,score numeric
)
language sql stable security definer
set search_path=public
set statement_timeout='2500ms'
as $$
 with q as(
  select distinct lower(trim(x)) v from unnest(coalesce(p_queries,array[]::text[])) x
  where length(trim(x)) between 1 and 120 limit 16
 ), candidates as(
  select f.id,max(greatest(
   similarity(lower(f.description_en),q.v),similarity(lower(coalesce(f.name_zh,'')),q.v),
   similarity(lower(coalesce(f.brand_name,'')),q.v),coalesce(similarity(lower(a.alias),q.v),0),
   case when lower(f.description_en)=q.v then 1.00 when lower(f.description_en) like '%'||q.v||'%' then .82 else 0 end,
   case when lower(coalesce(f.name_zh,''))=q.v then 1.10 when lower(coalesce(f.name_zh,'')) like '%'||q.v||'%' then .98 else 0 end,
   case when lower(coalesce(a.alias,''))=q.v then 1.20 when lower(coalesce(a.alias,'')) like '%'||q.v||'%' then 1.02 else 0 end
  ) + coalesce((120-a.priority)::numeric/10000,0))::numeric score
  from q join public.nutrition_foods f on (
   lower(f.description_en) % q.v or lower(coalesce(f.name_zh,'')) % q.v or lower(coalesce(f.brand_name,'')) % q.v
   or lower(f.description_en) like '%'||q.v||'%' or lower(coalesce(f.name_zh,'')) like '%'||q.v||'%'
  ) left join public.nutrition_aliases a on a.food_id=f.id and (lower(a.alias) % q.v or lower(a.alias) like '%'||q.v||'%')
  group by f.id order by score desc,f.id limit greatest(1,least(coalesce(p_limit,12),30))
 ), piv as(
  select n.food_id,
   max(n.amount_per_100g) filter(where nutrient_code='energy_kcal') kcal,
   max(n.amount_per_100g) filter(where nutrient_code='protein_g') protein,
   max(n.amount_per_100g) filter(where nutrient_code='carbs_g') carbs,
   max(n.amount_per_100g) filter(where nutrient_code='fat_g') fat,
   max(n.amount_per_100g) filter(where nutrient_code='fiber_g') fiber,
   max(n.amount_per_100g) filter(where nutrient_code='sugar_g') sugar,
   max(n.amount_per_100g) filter(where nutrient_code='added_sugar_g') added_sugar,
   max(n.amount_per_100g) filter(where nutrient_code='sodium_mg') sodium,count(*) cnt
  from public.nutrition_nutrients n join candidates c on c.id=n.food_id group by n.food_id
 )
 select f.id,f.source_key||':'||f.source_food_id,f.name_zh,f.description_en,f.category,f.data_type,f.brand_name,
        p.kcal,p.protein,p.carbs,p.fat,p.fiber,p.sugar,p.added_sugar,p.sodium,coalesce(p.cnt,0),f.source_key,f.source_food_id,c.score
 from candidates c join public.nutrition_foods f on f.id=c.id left join piv p on p.food_id=f.id
 order by c.score desc,f.id;
$$;

create or replace function public.search_food_nutrition_v2(p_query text,p_limit integer default 12)
returns table(
 food_id bigint,code text,name_zh text,name_en text,category text,data_type text,brand_name text,
 kcal_per_100g numeric,protein_g_per_100g numeric,carbs_g_per_100g numeric,fat_g_per_100g numeric,
 fiber_g_per_100g numeric,sugar_g_per_100g numeric,sodium_mg_per_100g numeric,
 nutrient_count bigint,source_key text,source_food_id text,score numeric
)
language sql stable security definer set search_path=public set statement_timeout='2500ms'
as $$
 select food_id,code,name_zh,name_en,category,data_type,brand_name,kcal_per_100g,protein_g_per_100g,carbs_g_per_100g,fat_g_per_100g,
        fiber_g_per_100g,sugar_g_per_100g,sodium_mg_per_100g,nutrient_count,source_key,source_food_id,score
 from public.search_food_nutrition_v3(array[p_query],p_limit);
$$;

grant execute on function public.search_food_nutrition_v3(text[],integer) to anon,authenticated,service_role;
grant execute on function public.search_food_nutrition_v2(text,integer) to anon,authenticated,service_role;
-- calculate_food_nutrition_v2 remains authenticated-only from V15.90.

commit;
