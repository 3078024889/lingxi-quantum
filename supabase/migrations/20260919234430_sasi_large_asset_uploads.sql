alter table public.sasi_assets drop constraint if exists sasi_assets_declared_size_check;
alter table public.sasi_assets add constraint sasi_assets_declared_size_check check (declared_size between 0 and 2147483648);
alter table public.sasi_assets drop constraint if exists sasi_assets_verified_size_check;
alter table public.sasi_assets add constraint sasi_assets_verified_size_check check (verified_size between 0 and 2147483648);
