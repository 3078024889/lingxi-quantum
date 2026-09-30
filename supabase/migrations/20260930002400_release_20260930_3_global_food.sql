insert into public.lingxifield_announcements(id,version_label,platform,title_zh,body_zh,title_en,body_en,is_active,published_at)
select gen_random_uuid(),'4.8.0','miniapp','灵犀场 4.8.0｜全球食物识别体系升级',
'卡路里识别升级为全球食物身份体系：按国家与区域理解食物名称和地方叫法，补强中国、东亚、东南亚及全球常见食物；图片识别继续采用多候选确认，不把模型猜测直接当成确定答案；营养结果保留数据来源，缺少可可靠使用的数据时明确提示，不编造数值。',
'LINGXIFIELD 4.8.0 | Global Food Intelligence',
'Country/region-aware food identity, broader cultural aliases, candidate confirmation and provenance-aware nutrition resolution.',
true,now() where not exists(select 1 from public.lingxifield_announcements where version_label='4.8.0' and platform='miniapp');