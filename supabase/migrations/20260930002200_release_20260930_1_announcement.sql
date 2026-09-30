insert into public.lingxifield_announcements
(id,version_label,platform,title_zh,body_zh,title_en,body_en,is_active,published_at,expires_at)
select gen_random_uuid(),'4.7.0','miniapp',
'灵犀场 4.7.0｜体验全面升级',
'本次更新进一步完善 SASI 创作与实用工具体验：优化首页与工具页面的视觉层级和间距；补全版本信息与更新公告；提升 PDF、图片、视频、临时邮箱、阅后即焚、卡路里识别等入口的一致性；继续加强运行稳定性与结果交付体验。进入灵犀场，选择你要完成的事，一键创造，一念即达。',
'LINGXIFIELD 4.7.0 | Experience upgrade',
'This release further improves SASI creation and practical tools, refines visual hierarchy and spacing, completes release information and announcements, and strengthens consistency and reliability.',
true,now(),null
where not exists(select 1 from public.lingxifield_announcements where version_label='4.7.0' and platform='miniapp');
