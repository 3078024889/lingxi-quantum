/** Source-linked human founders / original authors. These are never corporate legal persons.
 * 'founder' applies to a company; 'project_creator' to the software project;
 * 'lead_author' to the credited work, not a corporation founder.
 * Multi-founder records may be representative where the linked publication isn't exhaustive.
 */
export type FounderRole='founder'|'project_creator'|'lead_author';
export type FounderEvidence={en:string;zh:string;role:FounderRole;source:string};
export const PUBLISHER_FOUNDERS={
 "openai":{en:"Sam Altman · Greg Brockman · Ilya Sutskever",zh:"萨姆·奥特曼 · 格雷格·布罗克曼 · 伊利亚·苏茨克维",role:"founder",source:"https://openai.com/index/introducing-openai/"},
 "anthropic":{en:"Dario Amodei · Daniela Amodei",zh:"达里奥·阿莫代伊 · 丹妮拉·阿莫代伊",role:"founder",source:"https://www.anthropic.com/company/leadership"},
 "google":{en:"Larry Page · Sergey Brin",zh:"拉里·佩奇 · 谢尔盖·布林",role:"founder",source:"https://about.google/company-info/our-story/"},
 "alibaba":{en:"Jack Ma · 17 other co-founders",zh:"马云等18位创始成员",role:"founder",source:"https://www.alibabagroup.com/en-US/about-alibaba"},
 "bytedance":{en:"Yiming Zhang · Rubo Liang",zh:"张一鸣 · 梁汝波",role:"founder",source:"https://www.bytedance.com/about"},
 "kuaishou":{en:"Su Hua · Cheng Yixiao",zh:"宿华 · 程一笑",role:"founder",source:"https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-announces-management-roles-adjustment-su-hua-continue"},
 "luma":{en:"Amit Jain · Alex Yu · Alberto Taiuti",zh:"阿米特·贾恩 · 亚历克斯·余 · 阿尔贝托·塔尤蒂",role:"founder",source:"https://dealroom.co/companies/luma-ai/"},
 "runway":{en:"Cristóbal Valenzuela · Anastasis Germanidis · Alejandro Matamala-Ortiz",zh:"克里斯托瓦尔·巴伦苏埃拉 · 阿纳斯塔西斯·杰尔马尼迪斯 · 亚历杭德罗·马塔马拉",role:"founder",source:"https://salesforceventures.com/perspectives/welcome-runway/"},
 "elevenlabs":{en:"Mati Staniszewski · Piotr Dąbkowski",zh:"马蒂·斯坦尼谢夫斯基 · 彼得·栋布科夫斯基",role:"founder",source:"https://elevenlabs.io/press"},
 "suno":{en:"Mikey Shulman · Georg Kucsko · Martin Camacho · Keenan Freyberg",zh:"米奇·舒尔曼 · 乔治·库奇科 · 马丁·卡马乔 · 基南·弗赖伯格",role:"founder",source:"https://www.usv.com/portfolio/company/suno"},
 "replit":{en:"Amjad Masad · Haya Odeh",zh:"阿姆贾德·马萨德 · 哈娅·奥德",role:"founder",source:"https://replit.com/blog/live-from-hq-agent4-launch-pt2"},
 "comfy":{en:"Yannik Marek (Comfyanonymous)",zh:"扬尼克·马雷克（Comfyanonymous）",role:"project_creator",source:"https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open"},
 "huggingface":{en:"Clément Delangue (co-founder)",zh:"克莱芒·德朗格（联合创始人）",role:"founder",source:"https://huggingface.co/blog/clem/arcee-hf"},
 "deepseek":{en:"Liang Wenfeng",zh:"梁文锋",role:"founder",source:"https://www.reuters.com/technology/deepseek-founder-liang-wenfeng-puts-focus-chinese-innovation-2025-01-28/"},
 "xai":{en:"Elon Musk",zh:"埃隆·马斯克",role:"founder",source:"https://x.ai/company"},
 "perplexity":{en:"Aravind Srinivas (co-founder)",zh:"阿拉温德·斯里尼瓦斯（联合创始人）",role:"founder",source:"https://www.perplexity.ai/es-MX/hub/blog/the-knowledge-talk"},
 "n8n":{en:"Jan Oberhauser",zh:"扬·奥伯豪泽",role:"founder",source:"https://n8n.io/press/"},
 "langchain":{en:"Harrison Chase (co-founder)",zh:"哈里森·蔡斯（联合创始人）",role:"founder",source:"https://www.langchain.com/blog/join-langchain-at-google-cloud-next-2026"},
 "llamaindex":{en:"Jerry Liu · Simon Suo",zh:"刘杰瑞（Jerry Liu）· Simon Suo",role:"founder",source:"https://www.prnewswire.com/news-releases/llamaindex-secures-19-million-series-a-to-power-enterprise-grade-knowledge-agents-302390936.html"},
 "lovable":{en:"Anton Osika · Fabian Hedin",zh:"安东·奥西卡 · 法比安·赫丁",role:"founder",source:"https://time.com/collection/time100-most-influential-companies/2026/lovable/"},
 "midjourney":{en:"David Holz",zh:"大卫·霍尔茨",role:"founder",source:"https://www.societyforscience.org/alumni/notable/david-holz/"},
 "dify":{en:"Luyu Zhang",zh:"张路宇（Luyu Zhang）",role:"founder",source:"https://www.dify.ai/ko/blog/dify-raises-30m-tomorrow-s-organizations-will-be-built-by-people-and-agents"},
 "ollama":{en:"Jeff Morgan · Michael Chiang",zh:"杰夫·摩根 · 迈克尔·蒋",role:"founder",source:"https://techcrunch.com/2026/07/09/popular-open-source-ai-developer-tool-ollama-raises-65m-grows-to-nearly-9m-users/"},
 "openwebui":{en:"Tim J. Baek",zh:"蒂姆·贝克（Tim J. Baek）",role:"project_creator",source:"https://github.com/open-webui/docs/blob/main/docs/team.mdx"},
 "ggml":{en:"Georgi Gerganov",zh:"格奥尔基·格尔加诺夫",role:"project_creator",source:"https://github.com/ggml-org/llama.cpp/wiki"},
 "vllm":{en:"Woosuk Kwon and original paper contributors",zh:"Woosuk Kwon 等原始论文作者",role:"lead_author",source:"https://github.com/vllm-project/vllm"},
 "automatic1111":{en:"AUTOMATIC1111 (public developer handle)",zh:"AUTOMATIC1111（开发者公开账号）",role:"project_creator",source:"https://github.com/AUTOMATIC1111/stable-diffusion-webui"},
 "fasterwhisper":{en:"Guillaume Klein",zh:"纪尧姆·克莱因（Guillaume Klein）",role:"lead_author",source:"https://github.com/SYSTRAN/faster-whisper/blob/master/setup.py"},
} as const satisfies Record<string,FounderEvidence>;
export function founderForPublisher(key:string):FounderEvidence|null{
 return PUBLISHER_FOUNDERS[key as keyof typeof PUBLISHER_FOUNDERS]||null;
}
