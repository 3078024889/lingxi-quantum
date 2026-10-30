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
 ],['描述想完成的网站、用户和关键流程','生成原型并逐页测试真实交互','核对数据权限和付费条件再发布']),
 gemini:profile('多模态理解、Google 资料研究与创作','将文件、搜索、Canvas 和 Google 生态的辅助任务结合；具体工具受地区、年龄和方案限制','学生、知识工作者、内容创作者',[
  cap('文件与长资料分析','上传 PDF、表格等资料，对内容提问、提取数据与整理结论','把长报告拆分成研究结论、依据和待核实问题','上下文长度随方案变化；超大文件可能消耗较多额度','https://support.google.com/gemini/answer/16275805'),
  cap('Deep Research 多轮研究','围绕一个研究目标搜索多个来源并整理分析报告','比较几家新能源公司的公开政策与技术布局','要求登录且通常需要成年；研究额度和模型按套餐不同','https://support.google.com/gemini/answer/15719111'),
  cap('图片、视频与文档创作','使用 Gemini 的生成、编辑、Canvas 等创作入口','先生成主题图片，再制作报告或演示内容','视频/图片高级功能和用量由地区及方案决定','https://support.google.com/gemini/')
 ],['核对所在地区是否支持 Gemini 消费者或 Workspace 入口','上传合规素材或选择研究、Canvas、图像创作任务','核对配额、数据来源和生成结果，再导出']),
 replit:profile('描述需求即可生成、迭代与部署实际网页应用','从自然语言需求生成界面与代码，并结合数据库、身份验证、托管部署','小团队、创业者、网页开发者、零基础产品经理',[
  cap('自然语言创建应用','用一句产品需求启动 Agent，创建网页、应用或仪表板','制作一个含登录和管理页的预约网站原型','实际后端权限、费用和安全性仍需测试','https://replit.com/build'),
  cap('内置应用基础设施','结合托管、数据库、认证等组件部署完整项目','给预约原型添加数据库与用户注册','托管、用量、资源扩容与账单按实际套餐结算','https://replit.com/'),
  cap('服务集成与迭代','连接外部应用与 AI 服务，并继续通过对话修改','接入 Stripe 和 Google Workspace，再检查错误流程','第三方系统仍需单独授权、密钥管理与集成测试','https://replit.com/')
 ],['用自然语言说明应用目标、用户和页面','让 Agent 建立初版，实际点击测试每个功能','审核数据、付款、权限，再决定是否发布']),
 doubao:profile('中文资料、桌面协作、网页视频总结与对照翻译','桌面端能结合屏幕截图、文档、浏览器和代码场景完成即时辅助','中文办公人员、学生、视频资料研究者',[
  cap('桌面截图提问与跨软件辅助','选中桌面内容、截图或共享文档，进行解释、总结和协助','截取表格截图并请豆包解释指标变化','需安装桌面版；操作权限、数据隐私以功能设置为准','https://www.doubao.com/download/desktop'),
  cap('PDF 与网页对照翻译','对 PDF、网页和划词内容进行翻译与双语对照','将外文说明书译成中文并对照原文校读','专业术语需人工校正，格式效果因文件差异而不同','https://www.doubao.com/download/desktop'),
  cap('网页与视频信息总结','从浏览网页或视频提取概要、重点及后续问题','把课程视频整理成时间线和笔记','视频获取能力依网页内容、客户端版本及权限不同','https://www.doubao.com/download/desktop')
 ],['使用豆包官方网页版或下载适配设备的客户端','输入中文需求、截屏或分享授权文档','检查引用、对照译文并保存最终成果']),
 llamacpp:profile('在普通电脑或多种硬件上本地运行 GGUF 大模型','C/C++ 推理、量化及 CPU/GPU 混合执行，兼顾低资源与可控性','本地 AI 实验者、隐私敏感开发团队、推理服务运维人员',[
  cap('下载并运行 GGUF 模型','调用命令行工具在本机加载兼容模型完成文本或多模态推理','在无云端聊天服务时运行本地轻量语言模型','首次模型下载需要网络；性能由内存与模型大小决定','https://github.com/ggml-org/llama.cpp'),
  cap('兼容 API 的本地推理服务','启动 llama server，向已有开发应用提供模型推理 API','给内部工具提供本地聊天推理接口','需要自行管理服务访问权限、模型许可与运维','https://github.com/ggml-org/llama.cpp'),
  cap('量化与 CPU/GPU 混合加速','用 GGUF 及量化模型匹配显存、内存与多种硬件后端','把大模型换成合适位宽版本降低硬件门槛','量化可能降低质量，性能取决于具体芯片及后端','https://github.com/ggml-org/llama.cpp/blob/master/docs/models.md')
 ],['在官方项目下载编译版或安装工具','选择兼容 GGUF 模型、核对授权与硬件','先做少量可复现问答测试再接入应用']),
 vllm:profile('面向开发者的高吞吐大模型推理服务','持续批处理、缓存、量化与分布式推理，优化大规模 API 服务资源使用','GPU 服务运维人员、模型平台工程师、企业开发团队',[
  cap('连续批处理与 KV 缓存调度','处理多请求推理并利用 PagedAttention 等机制管理显存','部署供团队共同使用的模型 API 以提升并发吞吐','需要合适 GPU 与运行参数；吞吐表现须同条件测量','https://docs.vllm.ai/en/stable/'),
  cap('量化及多硬件推理','按模型与硬件支持使用 FP8、INT4、GPTQ 等量化格式','降低服务显存负载并评估性能损失','量化格式、精度与可运行后端需逐型号核验','https://docs.vllm.ai/en/stable/'),
  cap('分布式部署与高吞吐服务','结合多 GPU、张量并行与服务端配置提供模型推理','为应用部署可扩展文本生成服务','属于开发者基础设施，不是免注册在线聊天产品','https://docs.vllm.ai/en/stable/')
 ],['检查 GPU 兼容表和目标模型支持情况','安装对应版本并用小样本部署 API','运行并发、延迟与真实计费压力测试'])
,
 whisper:profile('本地多语音频识别与翻译','把音频转换为文字、识别语种，并用合适模型把语音翻译成英文','字幕制作、会议整理、研究人员与开发者',[
  cap('多语言语音转文字','将录音或音视频中的语音识别为可编辑文本','把 30 分钟中文会议录音转写成初稿','效果随语言、噪声、口音和模型大小变化','https://github.com/openai/whisper'),
  cap('语音识别与语种检测','识别输入音频主要语言并据此进行转写','把来自多国语言的采访素材按语言整理','多语言混合或低质量录音可能识别错误','https://github.com/openai/whisper/blob/main/README.md'),
  cap('多语语音翻译成英文','选择支持翻译的多语言模型输出英文文本','将日语受访者音频整理为英文字幕','turbo 版本不能按翻译模式使用，需选择合适多语模型','https://github.com/openai/whisper/blob/main/README.md')
 ],['安装官方 Python 项目与运行依赖','按音频语言、硬件选择正确模型','检查人名、术语和时间戳后再作为字幕发布']),
 fasterwhisper:profile('低资源高吞吐的 Whisper 转写实现','基于 CTranslate2 执行 Whisper 模型，支持批量推理和 8-bit 量化','需要批处理音视频字幕的开发者和本地生产团队',[
  cap('兼容 Whisper 模型转写','用优化的推理引擎进行多语音频转写','把录音批处理成字幕初稿','速度与准确度必须在同硬件、模型和参数下比较','https://github.com/SYSTRAN/faster-whisper'),
  cap('批量推理与低内存量化','可按 CPU/GPU 环境选 INT8 等运行模式','在有限显存环境试用更紧凑的转写配置','量化与批量大小对速度、内存和精度均有影响','https://github.com/SYSTRAN/faster-whisper'),
  cap('语音活动过滤与时间片段','使用转写接口输出分段时间信息并过滤部分静音','生成视频字幕片段供人工校对','不同版本、语速和背景噪声可能影响时间对齐','https://github.com/SYSTRAN/faster-whisper')
 ],['根据硬件配置安装 CTranslate2 和 faster-whisper','选择官方兼容模型与精度设置','对比转写错误率与运行内存，再生成字幕']),
 llamaindex:profile('把企业数据接入检索问答与智能体','构建 RAG、文档索引与多步骤工具调用应用，而非单一大模型','企业知识库研发团队、RAG 架构师、应用开发者',[
  cap('文档入库与 RAG 问答','把 PDF、网页等资料索引后用语义搜索为回答提供上下文','对内部操作手册提问并返回对应资料','结果取决于索引切分、检索质量及底层模型','https://developers.llamaindex.ai/python/framework/use_cases/q_and_a/'),
  cap('智能体与工具连接','让模型选择检索和函数工具分步执行任务','把项目知识库与支持工单动作结合','外部工具必须分别授权并限制写入操作','https://developers.llamaindex.ai/python/framework/use_cases/agents/'),
  cap('可定制 RAG 工作流','按业务场景编排检索、重排序及输出校验','针对知识库采用多检索器进行证据对照','需要开发和实际评测，非一键免费网页版工具','https://developers.llamaindex.ai/python/framework/understanding/rag/')
 ],['准备授权的资料和可选模型服务','配置文档解析、索引与检索流程','用已知答案的问题集检验召回、成本和错误率']),
 transformers:profile('跨模型架构的加载、推理与训练开发框架','Hugging Face 开发库用于运行、微调与分发不同文本、图像、语音模型','机器学习工程师、模型研究人员、开发者',[
  cap('加载开源预训练模型','使用模型加载器和 tokenizer 运行指定任务','加载公开文本分类模型分析客户反馈','每个模型的权重授权、硬件需求和输入格式不同','https://huggingface.co/docs/transformers/en/index'),
  cap('Pipeline 高阶推理接口','按文本、视觉或音频任务选择适配模型并处理推理','构建情感分析或语音识别的原型程序','任务表现属于所选模型，不能等同框架自身评分','https://huggingface.co/docs/transformers/en/index'),
  cap('训练、微调与模型发布','按支持配置进行数据训练和模型权重更新','用许可范围内的数据微调分类模型','需要训练数据、算力、评估集及合规许可','https://huggingface.co/docs/transformers/en/index')
 ],['先确定具体任务与有许可的模型','按官方版本安装依赖并跑最小实例','对数据泄漏、质量、速度和许可逐项验收']),
 openwebui:profile('可自建的聊天工作台与多模型入口','将本地模型或兼容接口接入浏览器，提供对话界面和检索扩展','自部署团队、本地模型用户、内网应用管理员',[
  cap('多模型聊天界面','在自己的环境提供网页聊天入口并切换后端模型','在内网集中使用不同 Ollama 或兼容服务','底层模型能力不属于界面自身，需单独部署推理服务','https://docs.openwebui.com/'),
  cap('文档检索增强','把获授权的资料接入检索，并辅助回答问题','让内部团队对说明文档进行问答','文档权限、检索质量和敏感资料处理需要审核','https://docs.openwebui.com/'),
  cap('自托管与账户管理','通过容器等方式运行服务并配置用户及模型访问','让多个办公账号接入同一个内网 AI 工作台','服务器维护、备份和身份权限由部署方负责','https://docs.openwebui.com/')
 ],['选择可用模型服务和自托管环境','部署 Open WebUI 并配置账户与连接','在正式共享前验证权限、备份和文档隔离'])
,
 automatic1111:profile('可本地运行的 Stable Diffusion 图像创作界面','提供文生图、图生图、局部重绘、扩图与放大处理，是软件界面而非单一智能模型','本地绘画创作者、模型工作流爱好者',[
  cap('文生图与图生图','使用适配的扩散模型和提示生成图片或修改已有作品','把角色草图转成场景插画','效果与模型及显存、采样配置有关','https://github.com/AUTOMATIC1111/stable-diffusion-webui'),
  cap('局部重绘与画布扩展','通过遮罩修改局部画面或在原图外补足内容','只修改人物服装而尽量保留背景','遮罩和选用模型影响一致性及边缘质量','https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features'),
  cap('模型与 LoRA 风格组合','加载用户安装的权重、LoRA 或其他网络来调整画面风格','在同一批海报里复用特定视觉风格','模型版权、插件安全及具体授权需分别确认','https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features')
 ],['安装项目依赖并核对设备显存','准备具有许可的模型和图片素材','先测单张图片，再批量执行和保存']),
 langchain:profile('围绕模型构建工具调用与智能体工作流','组织模型、工具、提示和执行流程的开发框架；不是面向消费者的在线聊天品牌','Agent 开发人员、工具集成工程师、企业应用团队',[
  cap('模型与工具编排','把不同模型调用和外部函数接入一个应用','让客服问答流程在检索后调用订单工具','工具调用权限、错误处理和费用需要独立控制','https://docs.langchain.com/oss/python/langchain/overview'),
  cap('构建智能体执行流程','配置智能体在多步骤任务中调用工具和处理结果','按用户提问规划搜索、整理和反馈草稿','智能体不是自动正确，需限制执行副作用','https://docs.langchain.com/oss/python/langchain/overview'),
  cap('应用扩展与持续调试','为模型应用组织状态、调用和可维护执行逻辑','逐步扩展研究助手的检索与结果校验','对结果可靠性仍需单独设置评测与追踪','https://docs.langchain.com/oss/python/langchain/overview')
 ],['选定业务任务、模型和合法数据源','按文档搭建最小代理与必要工具','做权限、成本、错误及结果准确率测试']),
 'openai-python':profile('OpenAI API 官方 Python 开发接口','同步、异步、流式请求及结构化输入输出的开发工具，不是另一款独立聊天模型','Python 应用工程师、AI 平台研发团队',[
  cap('模型 API 调用','通过 Python 客户端访问 Responses 等接口','编写带业务输入的服务端文本处理功能','需合法地区和 API 凭据；SDK 安装不等于模型免费','https://github.com/openai/openai-python'),
  cap('异步与流式输出','通过异步客户端及事件流即时处理结果','在网页中逐步显示长文本生成过程','需要控制超时、重试与网络错误','https://github.com/openai/openai-python/blob/main/README.md'),
  cap('类型与请求管理','使用 SDK 请求字段类型和底层 HTTP 设置维护集成','在应用中加上请求错误诊断及超时处理','实际模型费用和配额与 SDK 是不同层次','https://github.com/openai/openai-python/blob/main/README.md')
 ],['按照官方说明安装 Python SDK','使用服务端环境变量安全配置 API 凭据','用受控样本检查费用、权限和失败处理']),
 'anthropic-sdk-python':profile('Claude API 官方 Python 开发接口','通过 Python 服务端调用 Claude 消息、流式响应及工具函数，不是第二个 Claude 对话网站','Python 开发者、智能体与应用集成工程师',[
  cap('Claude Messages API','向官方 Claude 模型发送结构化消息并获取回复','在自己的服务端构建文件问答接口','须持有受支持地区的 API 访问权限和费用预算','https://github.com/anthropics/anthropic-sdk-python'),
  cap('流式响应输出','使用 SDK 的事件流接口逐步处理响应内容','边生成边向浏览器显示分析文本','连接中断和消息重试应单独处理','https://github.com/anthropics/anthropic-sdk-python/blob/main/helpers.md'),
  cap('Python 工具调用辅助','按支持功能将应用函数与模型的工具选择衔接','根据产品 ID 查询内部资料并返回结果','程序拥有的真实权限必须由开发者验证','https://github.com/anthropics/anthropic-sdk-python')
 ],['确认 Claude API 国家和账户权限','安装 SDK、配置仅服务端可见的密钥','先试单一请求再验证工具执行及用量']),
 jimeng:profile('中文创作提示、首尾帧视频及图片改造','即梦将文生/图生视频、镜头控制与图片参考编辑整合到中文创作流程','短剧制作、海报与视频创作者、中文内容团队',[
  cap('文字与图片生成视频','描述场景或提供首帧生成短视频片段','用中文写分镜并制作缓慢推进镜头','视频长度、积分和下载权限随模型和套餐变化','https://jimeng.jianying.com/'),
  cap('首尾帧与镜头控制','给出开头结尾画面约束镜头运动和速度变化','让室内场景从首帧自然过渡到指定结尾','动作连续与人物一致性仍需逐条检验','https://jimeng.jianying.com/'),
  cap('参考图保留与局部风格调整','在图生图中参考主体特征，进行背景或风格改造','把同一人物转成不同场景的宣传海报','保留能力依模型、参考素材及使用额度变化','https://jimeng.jianying.com/')
 ],['从即梦官网选择图片或视频入口','输入中文场景、上传有权使用的参考图','核对时长、积分、水印与保存条件'])
,
 grok:profile('结合 X 场景的对话、问题解答和信息辅助','Grok 面向问题分析、灵感整理和 X 场景使用，相关个性化和数据使用受账号设置约束','X 用户、内容研究者、创作者',[
  cap('自然语言解答与构思','输入问题，获得说明、备选想法与多轮讨论','将文章主题整理成多个不同角度','回答可能存在事实错误，重要信息需要核查','https://help.x.com/en/using-x/about-grok'),
  cap('X 环境中的 AI 辅助','在支持的 X 入口使用 Grok 处理信息和创意任务','围绕一个公开话题整理概念与后续问题','入口、模型和配额受地区、账户和产品调整影响','https://help.x.com/en/using-x/about-grok'),
  cap('语音与个性化控制','按支持功能使用语音和个人偏好控制','通过自然语音交流完成信息查找','交互可能用于模型改进；需核对隐私设置','https://help.x.com/en/using-x/about-grok')
 ],['核实所在地区和 X/Grok 的使用条件','提交问题或任务并按需要继续追问','核对来源以及隐私和数据训练设置']),
 qwen:profile('多模态内容理解、中文创作与模型 API','千问区分在线 Qwen Chat、API 模型与不同输入模态，不把整个模型家族混为单一产品','中文研究人员、开发者、多模态资料分析团队',[
  cap('多语言写作与问答','通过 Qwen 产品或支持的 API 完成创作、翻译、摘要与问答','把一份产品说明整理成不同语言的介绍','不同模型、聊天与 API 入口的额度和模态不同','https://qwen.ai/apiplatform'),
  cap('图片、视频和文档理解','在支持的视觉模型上提供图片或视频进行问答','提取画面信息并归纳视频内容','须选择视觉语言型号；文本专用型号不具备该能力','https://qwen.ai/apiplatform'),
  cap('编程与智能体开发','使用特定 Qwen 模型进行编码、工具调用和流程辅助','为业务脚本生成单元测试与纠错建议','代码需运行验证；能力依具体版本和工具权限','https://qwen.ai/blog?id=qwen3.7&locale=en')
 ],['选择网页版对话还是开发者 API','根据任务选择文本、视觉或编程模型','验证版本、费用、来源与实际运行结果']),
 luma:profile('有镜头控制的图片视频创作与现有视频再设计','Dream Machine 与 Ray3 系列结合文/图生视频、关键帧、角色参考和视频修改','影视短片、广告视觉、视频创作者',[
  cap('文字/图片引导视频生成','输入场景提示或图片参考创建镜头动态','从角色参考图制作几秒推进镜头','视频生成模型、额度、时长及分辨率按方案不同','https://lumalabs.ai/changelog/welcome-to-the-all-new-dream-machine'),
  cap('首尾帧与角色参考控制','在 Ray3 的特定流程中使用首尾帧和人物参考组织转场','使镜头从起始参考画面过渡到指定结尾','角色一致性不能保证绝对保留，须实测结果','https://lumalabs.ai/learning-hub/ray3-modify-user-guide'),
  cap('修改既有视频','在 Modify 模式进行服装、环境或光照变化','保留演员动作同时重设环境背景','素材时长和角色参考可用性受流程与订阅限制','https://lumalabs.ai/news/ray3-modify')
 ],['确认 Dream Machine 入口、额度和型号','准备合法参考图片或视频并选择镜头控制','短镜头试生成后核对费用、人物一致性与下载'])

};
export function capabilityProfile(id:string):CapabilityProfile|undefined{return CAPABILITY_PROFILES[id];}
export function capabilityKeywords(id:string):string[]{const p=capabilityProfile(id);return p?p.capabilities.flatMap(x=>[x.name,x.outcome]):[];}
