/**
 * Curated publisher capability catalogue, not a ranking nor an independent test.
 * Each user-facing capability names a concrete task, deliverable, boundary and first-party source.
 * Data is editorially reviewed; new submissions require approval before public promotion.
 */
export type ProductCapability={
  name:string; outcome:string; example:string; boundary:string; source:string;
};
export type CapabilityProfile={
  headline:string;
  differentiator:string;
  audience:string;
  checkedAt:string;
  capabilities:readonly ProductCapability[];
  firstSteps:readonly [string,string,string];
};
const day='2026-10-30';
const cap=(name:string,outcome:string,example:string,boundary:string,source:string):ProductCapability=>({name,outcome,example,boundary,source});
const profile=(headline:string,differentiator:string,audience:string,capabilities:ProductCapability[],firstSteps:[string,string,string]):CapabilityProfile=>({
 headline,differentiator,audience,checkedAt:day,capabilities,firstSteps
});
export const CAPABILITY_PROFILES:Readonly<Record<string,CapabilityProfile>>={
 chatgpt:profile('把资料、创作、研究与代码任务放到一段连续对话里完成','同一个产品内结合文件理解、图片编辑、数据分析、搜索及多步骤研究；各工具受套餐影响','写作者、学生、研究者、办公人员、开发者',[
  cap('文档与音频理解','上传文档或音频，提取摘要、关键数字与问题','阅读一份 PDF：列出结论、待核实事实和对应段落','文件大小、格式和音频可用范围随套餐变化','https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt'),
  cap('网页搜索与引用','检索新信息并展示可查看的来源','比较近期行业公告及每项关键依据','引用不等于事实自动正确，仍需复核','https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview'),
  cap('多步骤深度研究','跨多个来源组织结构化研究报告','制作产品竞争分析：观点、证据、分歧和结论','研究工具及用量受账号方案约束','https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview'),
  cap('图片生成与修改','描述画面、生成图像并通过文字修改','把海报换成夜景并保留主要元素','生成质量、次数与商用条款需单独确认','https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview'),
  cap('表格与数据分析','整理上传的表格、进行计算与绘图','从 CSV 找出异常月份并绘制趋势','结果应审查公式、样本和来源数据','https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview'),
  cap('写作、代码与多轮协作','按要求起草、修改内容和调试代码','将产品需求整理成可执行的网页原型说明','代码输出需要运行测试；不同模式工具权限不同','https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview')
 ],['进入 ChatGPT 官网并选择适用的免费或付费方案','用自然语言描述任务，也可以上传支持的文件','检查输出、追问修改，再导出或复制可用结果']),
 claude:profile('复杂资料处理、编程与可编辑成果','强调长内容协作、文档/幻灯片等可编辑产物和代码工作流程','知识工作者、程序员、研究员',[
  cap('长文资料理解','上传文章与文档，进行问题解答、比较及归纳','对比两份合同差异并标注关键条款','文件和项目使用条件受套餐及支持地区限制','https://support.claude.com/en/articles/8241126-upload-files-to-claude'),
  cap('可编辑 Artifacts','把对话结果变成文档、设计、幻灯片或交互作品','从市场需求直接制作可编辑演示文稿','模板及云端代码功能按账号能力开放','https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them'),
  cap('文档共同编辑','在 Docs 中编辑段落、分享、评论并导出','共同完成一份研究计划并留下版本讨论','需要适当的帐号权限及相关功能开关','https://support.claude.com/en/articles/16923645-get-started-with-claude-docs'),
  cap('编程与项目协作','在 Claude Code 中理解项目文件、修改代码和执行命令','读取一段程序错误并提出带测试的修复','Claude Code 与普通网页版是不同操作入口','https://support.claude.com/en/articles/14552382-your-first-day-in-claude-code')
 ],['打开 Claude 官网并核对所在地区是否支持','按任务选择聊天、Artifacts 或 Claude Code','验证内容或运行代码后再发布成果']),
 runway:profile('专业视频生成、镜头控制和人物表演驱动','不仅是文字生成视频，还能把角色参考与真实表演迁移结合','短剧导演、视频创作者、广告团队',[
  cap('文生与图生视频','从提示词或首帧图制作指定长度的动态镜头','从角色定妆照生成缓慢推进的 5 秒镜头','模型、时长和积分费用按当期套餐核对','https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5'),
  cap('角色参考一致性','使用人物参考图维持跨镜头视觉特征','同一演员分别出现在室内和汽车场景','一致性是可控能力而非百分百保证','https://help.runwayml.com/hc/en-us/articles/41748090660499-Creating-Multi-Character-Dialogues-with-Act-Two'),
  cap('Act-Two 动作与表演转移','把表演视频的动作、表情和说话方式应用到角色','为动画角色录制真人手势表情再驱动角色','Act-Two 受方案及素材要求限制','https://help.runwayml.com/hc/en-us/articles/42311337895827-Performance-Capture-with-Act-Two'),
  cap('双人角色对话流程','分别录制表演素材并组织双人场景','制作一段双人车内对话短镜头','制作流程需要人工拆镜和后期合成','https://help.runwayml.com/hc/en-us/articles/41748090660499-Creating-Multi-Character-Dialogues-with-Act-Two')
 ],['从 Runway 生成页面进入项目并检查额度','选择文生视频或准备人物参考和表演素材','生成短镜头并检查画面、积分、下载规则']),
 comfyui:profile('可复用的节点式视觉创作工作流','自定义节点流程和模型连接，适合重复生产与局部控制','高级创作者、模型实验者、开发者',[
  cap('节点式生成管线','将提示、模型、采样、输出连接成可复用工作流','固定角色参考后批量更换背景','需理解节点依赖和模型兼容性','https://docs.comfy.org/'),
  cap('本地模型与插件组合','按本机硬件选择和组合不同模型及节点','一套流程依次完成文生图、放大与细节修复','硬件显存、模型许可及插件安全需单独检查','https://docs.comfy.org/'),
  cap('工作流模板复用','加载模板并保存可重复运行的工作流','让团队沿用同一角色风格方案','模板兼容性因软件版本和依赖不同','https://docs.comfy.org/')
 ],['安装官方 ComfyUI 或选择其云产品','导入适配本机硬件的模板和模型','运行工作流并核对输出与模型许可']),
 dify:profile('从知识库到智能体应用的可维护构建平台','将数据检索、提示词、工具调用和应用发布分开管理','企业团队、智能体开发者、内部知识库运营人员',[
  cap('知识库与 RAG','把公司文档接入检索问答，为答案提供背景资料','员工查询产品手册和售后流程','检索效果依文档质量与索引设置','https://docs.dify.ai/'),
  cap('可视化工作流','用节点编排模型调用、判断和工具执行','先分类客服问题，再检索资料并生成回复','节点配置与运行成本仍需监测','https://docs.dify.ai/'),
  cap('智能体与外部工具','让应用结合工具和模型执行多步任务','自动读取订单状态并生成服务草稿','外部系统权限必须遵循最小授权','https://docs.dify.ai/'),
  cap('托管与自部署','在托管云或自有环境发布应用','自建企业知识问答入口','云托管价格与本地部署成本不同','https://www.dify.ai/pricing')
 ],['选择 Cloud 或 Community 并建立应用','导入数据、配置模型和工作流','使用测试问句验证，再公开应用入口']),
 n8n:profile('把现有办公系统连接成自动化任务流','工作流触发器与 API 节点结合 AI Agent，适合跨软件自动化','运营团队、业务自动化人员、开发者',[
  cap('跨应用自动化','连接多个应用读取、处理并传递业务数据','收到表单后自动整理、通知负责人','第三方服务要求独立授权和 API 权限','https://docs.n8n.io/'),
  cap('AI Agent 工作流','在工作流中加入 AI 处理步骤及工具调用','将客户问题分类，再交给相应处理流程','AI 调用成本和权限依模型及节点配置','https://docs.n8n.io/'),
  cap('云端或自部署','选择托管或自己的服务器运行任务','把业务自动化部署在自有服务环境','自托管仍需维护、备份及安全控制','https://docs.n8n.io/')
 ],['创建 n8n 工作流并选择起始触发器','添加目标应用和可用 AI 节点，配置权限','先用测试数据运行再正式启用']),
 suno:profile('从文字创作歌曲到分轨再编辑','创作歌曲后可延长、修改结构及分离声音轨道','音乐创作者、视频配乐、独立内容团队',[
  cap('歌曲与配乐生成','根据歌词、音乐风格和要求制作歌曲','为 60 秒短片生成主题配乐','音乐商用与下载权限受套餐限制','https://suno.com/'),
  cap('Extend 延长音乐','选择延长起点，补充歌词或风格继续制作','把 30 秒旋律延长为有完整结尾的歌曲','延长结果需人工试听和衔接','https://help.suno.com/en/articles/2409601'),
  cap('Song Editor 结构修改','调整段落、局部歌词、替换片段及淡入淡出','把副歌提前并重做其中四小节','编辑器可用性和功能受账号设置限制','https://help.suno.com/en/articles/6141505'),
  cap('Stems 伴奏与人声分离','将音乐拆分为人声、鼓、贝斯等轨道','将伴奏和人声分别用于视频剪辑','分轨功能适用 Pro/Premier，部分操作另扣积分','https://help.suno.com/en/articles/13925185')
 ],['进入 Suno 创作区输入歌词或音乐风格','生成并试听，使用编辑或延长功能修改','核对商用授权并下载允许的格式']),
 elevenlabs:profile('自然配音、多语种译配与音效制作','针对声音细节、语种、角色音色和视频声轨精细控制','视频制作者、有声读物团队、全球内容发行团队',[
  cap('文字转自然语音','把文案转换成具备语调与节奏的语音','同一段视频文案分别做温柔和严肃两种旁白','高级音质及商用权受计划限制','https://elevenlabs.io/docs/overview/capabilities/text-to-speech'),
  cap('视频多语言译配','翻译音视频并尽量保留说话人的音色和情绪','把中文演示视频制作英文版语音轨','语言、并发和水印限制因模型与套餐变化','https://elevenlabs.io/docs/overview/capabilities/dubbing'),
  cap('文字生成电影音效','描述音效并控制持续时间','生成开门、雨声或奇幻氛围声','具体模型与输出时长需要按接口核对','https://elevenlabs.io/docs/overview/capabilities/sound-effects'),
  cap('声音设计与克隆','在可授权前提下创作或复用音色','统一系列视频的品牌旁白声线','克隆需获得合法声音使用许可','https://elevenlabs.io/docs/overview/capabilities/text-to-speech')
 ],['打开语音工作台选择配音、译配或音效','上传合法素材或填写文字并选择语音','试听、核对授权，再导出音频']),
 midjourney:profile('风格化画面、视觉参考与局部编辑','可用风格参考和多图输入控制系列视觉作品的一致性','插画师、品牌设计师、视觉内容创作者',[
  cap('风格参考','复用参考图的色彩、媒介、灯光和视觉气氛','让十二张海报保持同一摄影风格','风格参考并非逐像素复制或角色完全锁定','https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference'),
  cap('图像局部编辑与扩图','在已有图片中按文字指令修改局部或延伸画幅','把横幅改成竖版同时补全画面','编辑模型版本及输入要求需检查','https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model'),
  cap('多张图参考生成','组合参考图实现新的场景、角色与物体组合','用服装和角色参考制作新场景','部分引用方式依当前模型而不同','https://docs.midjourney.com/hc/en-us/articles/33390732264589-Creating-on-Web'),
  cap('Describe 反向寻找提示词','从图片提取风格描述并生成创作思路','上传参考图得到画面关键词','结果只是创意建议，不能精准还原原图','https://docs.midjourney.com/hc/en-us/articles/32497889043981-Describe')
 ],['打开 Midjourney 网页端创作入口','输入文字或上传合法参考图','挑选变体，再编辑、扩图或导出']),
 perplexity:profile('带出处的联网问答与资料搜索','围绕搜索结果组织问题答案，并为关键结果提供来源链接','资料搜集者、市场研究人员',[
  cap('来源型联网回答','把搜索结果组织成可查看来源的答案','研究产品最新政策并查看所引用页面','网页来源本身也需鉴别可靠性','https://www.perplexity.ai/hub'),
  cap('追问与深入调查','围绕已有问题继续检索或组织研究','比较三家厂商的公开功能与差异','搜索范围、研究额度与模型权限受方案影响','https://www.perplexity.ai/hub'),
  cap('资料辅助整理','将多个来源概括成主题比较','把新闻和报告归纳为可阅读的主题简报','引用覆盖率和生成内容需人工核查','https://www.perplexity.ai/hub')
 ],['访问 Perplexity 并输入具体事实问题','展开引用，交叉核对主要来源','追问限制与差异，再保存研究结果']),
 ollama:profile('在自己的机器上安装和运行模型','将大模型运行位置和模型选择交给使用者控制','本地开发者、隐私优先团队、模型爱好者',[
  cap('本地模型运行','在自有机器下载并启动兼容的大语言模型','在不依赖在线聊天服务的情况下运行模型','初次下载依赖网络；性能由设备硬件决定','https://ollama.com/download'),
  cap('切换模型进行比较','选择不同本地模型用于问答或开发','在同一设备比较两款小模型输出','模型授权及性能不是 Ollama 自身的智力分','https://github.com/ollama/ollama'),
  cap('开发 API 集成','用本地服务接口连接其他应用或脚本','将本地文本模型接入个人工具','涉及开发、部署与资源配置','https://github.com/ollama/ollama')
 ],['安装 Ollama 并确认本机硬件空间','选择模型并按文档下载运行','测试具体任务及模型许可证']),
 deepseek:profile('中文分析、代码推理与开发者 API','聊天产品与 API 服务分别提供模型能力和计费路径','中文内容研究者、程序员、开发者',[
  cap('中文问答与解释','用中文提出具体问题并获取解释与结构化回答','解释一段代码中的算法选择','事实答案仍需交叉验证','https://www.deepseek.com'),
  cap('编程与逻辑推理','分析问题、理解程序及辅助调试','解释错误日志并提供可运行修复思路','代码需自行执行测试，型号随产品入口变化','https://www.deepseek.com'),
  cap('开发者 API','按所选模型调用对话与推理能力','应用程序调用模型生成结构化文案','API 输入输出与缓存单独计费','https://api-docs.deepseek.com/quick_start/pricing/')
 ],['使用官方聊天网页或开发者平台','提交中文问题或代码任务','核对模型、执行结果及 API 用量']),
 lovable:profile('用自然语言搭建可运行的网页与应用','让非开发者从需求说明开始制作应用原型','创业团队、产品经理、零基础建站者',[
  cap('需求转应用原型','将文字描述变成可操作的网页界面','制作客户预约网页并修改表单布局','生成的功能必须经过实际运行和安全测试','https://docs.lovable.dev/tips-tricks/chatgpt-app'),
  cap('对话迭代网页','通过新的需求逐次修改组件和交互','把单页项目扩展为含多页面的演示站','积分消耗与发布能力受套餐限制','https://docs.lovable.dev/tips-tricks/chatgpt-app'),
  cap('发布前验证','结合应用设置和实际功能检查后再上线','检查移动端与表单完整流程','生成页面不等同于安全审计或生产验收','https://docs.lovable.dev/tips-tricks/chatgpt-app')
 ],['描述想完成的网站、用户和关键流程','生成原型并逐页测试真实交互','核对数据权限和付费条件再发布'])
};
export function capabilityProfile(id:string):CapabilityProfile|undefined{return CAPABILITY_PROFILES[id];}
export function capabilityKeywords(id:string):string[]{const p=capabilityProfile(id);return p?p.capabilities.flatMap(x=>[x.name,x.outcome]):[];}
