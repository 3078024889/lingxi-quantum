begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('lingxifield-support','lingxifield-support',false,5242880,array['image/png','image/jpeg','image/webp','image/gif'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
commit;
