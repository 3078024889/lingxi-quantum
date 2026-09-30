begin;
update public.lingxifield_announcements set is_active=false where platform='web' and is_active=true;
insert into public.lingxifield_announcements(platform,version_label,title_zh,body_zh,title_en,body_en,is_active,published_at)
select 'web','2026.09.30.12','灵犀场工具体验更新',
'完善卡路里识别与 AI 证件照体验；继续优化 PDF、图片、视频、文字与隐私类实用工具；完善我的创作、模板发现、问题反馈、多语言与整体页面体验。',
'LINGXIFIELD Tools Experience Update',
'Improved food calorie recognition, ID photo, practical tools, creations, templates, feedback, multilingual and overall site experience.',
true,now()
where not exists(select 1 from public.lingxifield_announcements where platform='web' and version_label='2026.09.30.12');
commit;
