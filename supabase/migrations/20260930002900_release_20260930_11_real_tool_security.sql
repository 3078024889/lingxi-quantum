begin;
insert into public.lingxifield_announcements(platform,version_label,title_zh,body_zh,title_en,body_en,is_active,published_at)
select 'all','4.8.8','灵犀场 4.8.8｜真实工具与安全验收升级',
'工具验收继续从页面可用升级为真实输入与真实结果证据；PDF、文本、Food、AI证件照进入统一毕业矩阵。隐私作品、账户、支付与私有 SASI 默认不参与公开索引。',
'LINGXIFIELD 4.8.8 | Real tool and security acceptance',
'Tool acceptance now separates page availability from verified real-result evidence. Private creations, account, payment and private SASI surfaces remain outside public indexing.',
true,now()
where not exists(select 1 from public.lingxifield_announcements where platform='all' and version_label='4.8.8');
commit;
