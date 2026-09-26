begin;

create extension if not exists pg_trgm;

create table if not exists public.nutrition_sources(
  source_key text primary key,
  label text not null,
  license text not null,
  source_url text not null,
  dataset_version text,
  imported_at timestamptz not null default now(),
  row_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.nutrition_foods(
  id bigserial primary key,
  source_key text not null references public.nutrition_sources(source_key) on delete restrict,
  source_food_id text not null,
  description_en text not null,
  name_zh text,
  category text,
  data_type text,
  brand_owner text,
  brand_name text,
  ingredients text,
  publication_date date,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(source_key,source_food_id)
);

create table if not exists public.nutrition_aliases(
  id bigserial primary key,
  food_id bigint not null references public.nutrition_foods(id) on delete cascade,
  alias text not null,
  lang text not null default 'und',
  alias_kind text not null default 'search',
  priority integer not null default 100,
  unique(food_id,alias,lang)
);

create table if not exists public.nutrition_nutrients(
  id bigserial primary key,
  food_id bigint not null references public.nutrition_foods(id) on delete cascade,
  nutrient_code text not null,
  amount_per_100g numeric,
  unit text not null,
  source_nutrient_id text,
  source_nutrient_name text,
  data_points integer,
  min_value numeric,
  max_value numeric,
  median_value numeric,
  metadata jsonb not null default '{}'::jsonb,
  unique(food_id,nutrient_code)
);

create table if not exists public.nutrition_portions(
  id bigserial primary key,
  food_id bigint not null references public.nutrition_foods(id) on delete cascade,
  amount numeric not null default 1,
  measure text,
  description text,
  gram_weight numeric not null check(gram_weight>0),
  sequence_no integer,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists nutrition_foods_description_trgm on public.nutrition_foods using gin(lower(description_en) gin_trgm_ops);
create index if not exists nutrition_foods_name_zh_trgm on public.nutrition_foods using gin(lower(coalesce(name_zh,'')) gin_trgm_ops);
create index if not exists nutrition_aliases_alias_trgm on public.nutrition_aliases using gin(lower(alias) gin_trgm_ops);
create index if not exists nutrition_nutrients_food_code on public.nutrition_nutrients(food_id,nutrient_code);
create index if not exists nutrition_portions_food on public.nutrition_portions(food_id);

alter table public.nutrition_sources enable row level security;
alter table public.nutrition_foods enable row level security;
alter table public.nutrition_aliases enable row level security;
alter table public.nutrition_nutrients enable row level security;
alter table public.nutrition_portions enable row level security;

drop policy if exists nutrition_sources_public_read on public.nutrition_sources;
create policy nutrition_sources_public_read on public.nutrition_sources for select using(true);
drop policy if exists nutrition_foods_public_read on public.nutrition_foods;
create policy nutrition_foods_public_read on public.nutrition_foods for select using(true);
drop policy if exists nutrition_aliases_public_read on public.nutrition_aliases;
create policy nutrition_aliases_public_read on public.nutrition_aliases for select using(true);
drop policy if exists nutrition_nutrients_public_read on public.nutrition_nutrients;
create policy nutrition_nutrients_public_read on public.nutrition_nutrients for select using(true);
drop policy if exists nutrition_portions_public_read on public.nutrition_portions;
create policy nutrition_portions_public_read on public.nutrition_portions for select using(true);

insert into public.nutrition_sources(source_key,label,license,source_url,dataset_version,metadata)
values('usda-fdc','USDA FoodData Central','CC0 / Public Domain','https://fdc.nal.usda.gov',null,jsonb_build_object('primary',true))
on conflict(source_key) do update set label=excluded.label,license=excluded.license,source_url=excluded.source_url;

create or replace function public.search_food_nutrition_v2(p_query text,p_limit integer default 12)
returns table(
 food_id bigint,code text,name_zh text,name_en text,category text,data_type text,brand_name text,
 kcal_per_100g numeric,protein_g_per_100g numeric,carbs_g_per_100g numeric,fat_g_per_100g numeric,
 fiber_g_per_100g numeric,sugar_g_per_100g numeric,sodium_mg_per_100g numeric,
 nutrient_count bigint,source_key text,source_food_id text,score numeric
)
language sql stable security definer set search_path=public
as $$
 with q as(select lower(trim(coalesce(p_query,''))) v),
 candidates as(
   select f.id,
          greatest(
            similarity(lower(f.description_en),(select v from q)),
            similarity(lower(coalesce(f.name_zh,'')),(select v from q)),
            coalesce(max(similarity(lower(a.alias),(select v from q))),0),
            case when lower(f.description_en) like '%'||(select v from q)||'%' then .80 else 0 end,
            case when lower(coalesce(f.name_zh,'')) like '%'||(select v from q)||'%' then .90 else 0 end,
            coalesce(max(case when lower(a.alias)=(select v from q) then 1.0 else 0 end),0)
          )::numeric score
   from public.nutrition_foods f
   left join public.nutrition_aliases a on a.food_id=f.id
   where length((select v from q))>0 and (
     lower(f.description_en) % (select v from q) or lower(coalesce(f.name_zh,'')) % (select v from q)
     or lower(f.description_en) like '%'||(select v from q)||'%' or lower(coalesce(f.name_zh,'')) like '%'||(select v from q)||'%'
     or lower(coalesce(a.alias,'')) % (select v from q) or lower(coalesce(a.alias,'')) like '%'||(select v from q)||'%'
   )
   group by f.id
   order by score desc,f.id
   limit greatest(1,least(coalesce(p_limit,12),50))
 ), piv as(
   select n.food_id,
    max(n.amount_per_100g) filter(where n.nutrient_code='energy_kcal') kcal,
    max(n.amount_per_100g) filter(where n.nutrient_code='protein_g') protein,
    max(n.amount_per_100g) filter(where n.nutrient_code='carbs_g') carbs,
    max(n.amount_per_100g) filter(where n.nutrient_code='fat_g') fat,
    max(n.amount_per_100g) filter(where n.nutrient_code='fiber_g') fiber,
    max(n.amount_per_100g) filter(where n.nutrient_code='sugar_g') sugar,
    max(n.amount_per_100g) filter(where n.nutrient_code='sodium_mg') sodium,
    count(*) cnt
   from public.nutrition_nutrients n join candidates c on c.id=n.food_id group by n.food_id
 )
 select f.id, f.source_key||':'||f.source_food_id, f.name_zh, f.description_en, f.category,f.data_type,f.brand_name,
        p.kcal,p.protein,p.carbs,p.fat,p.fiber,p.sugar,p.sodium,coalesce(p.cnt,0),f.source_key,f.source_food_id,c.score
 from candidates c join public.nutrition_foods f on f.id=c.id left join piv p on p.food_id=f.id
 order by c.score desc,f.id;
$$;

create or replace function public.calculate_food_nutrition_v2(p_items jsonb)
returns jsonb
language plpgsql stable security definer set search_path=public
as $$
declare out_items jsonb:='[]'::jsonb; totals jsonb:='{}'::jsonb; rec record; nrec record; factor numeric; item_nutrients jsonb; total_grams numeric:=0;
begin
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>50 then raise exception 'INVALID_FOOD_ITEMS'; end if;
 for rec in
   select f.*, (x->>'grams')::numeric grams
   from jsonb_array_elements(p_items) x
   join public.nutrition_foods f on f.id=(x->>'food_id')::bigint
 loop
   if rec.grams<=0 or rec.grams>10000 then raise exception 'INVALID_FOOD_ITEMS'; end if;
   factor:=rec.grams/100.0; item_nutrients:='{}'::jsonb; total_grams:=total_grams+rec.grams;
   for nrec in select nutrient_code,amount_per_100g,unit from public.nutrition_nutrients where food_id=rec.id and amount_per_100g is not null loop
     item_nutrients:=item_nutrients||jsonb_build_object(nrec.nutrient_code,jsonb_build_object('value',round(nrec.amount_per_100g*factor,4),'unit',nrec.unit));
     totals:=jsonb_set(totals,array[nrec.nutrient_code],jsonb_build_object('value',round(coalesce((totals->nrec.nutrient_code->>'value')::numeric,0)+(nrec.amount_per_100g*factor),4),'unit',nrec.unit),true);
   end loop;
   out_items:=out_items||jsonb_build_array(jsonb_build_object(
     'food_id',rec.id,'code',rec.source_key||':'||rec.source_food_id,'name_zh',rec.name_zh,'name_en',rec.description_en,
     'grams',rec.grams,'source_key',rec.source_key,'source_food_id',rec.source_food_id,'nutrients',item_nutrients,
     'kcal',coalesce((item_nutrients->'energy_kcal'->>'value')::numeric,0),
     'protein_g',coalesce((item_nutrients->'protein_g'->>'value')::numeric,0),
     'carbs_g',coalesce((item_nutrients->'carbs_g'->>'value')::numeric,0),
     'fat_g',coalesce((item_nutrients->'fat_g'->>'value')::numeric,0)
   ));
 end loop;
 if jsonb_array_length(out_items)<>jsonb_array_length(p_items) then raise exception 'FOOD_NOT_FOUND'; end if;
 return jsonb_build_object('items',out_items,'total',jsonb_build_object(
   'grams',round(total_grams,2),'nutrients',totals,
   'kcal',coalesce((totals->'energy_kcal'->>'value')::numeric,0),
   'protein_g',coalesce((totals->'protein_g'->>'value')::numeric,0),
   'carbs_g',coalesce((totals->'carbs_g'->>'value')::numeric,0),
   'fat_g',coalesce((totals->'fat_g'->>'value')::numeric,0)
 ),'source_note','Food composition values vary by variety, brand and preparation. Missing nutrients are null, never assumed to be zero.');
end $$;

grant execute on function public.search_food_nutrition_v2(text,integer) to anon,authenticated,service_role;
grant execute on function public.calculate_food_nutrition_v2(jsonb) to authenticated,service_role;

commit;
