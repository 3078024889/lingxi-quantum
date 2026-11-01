/**
 * Editorial task phrases for the 32 EXISTING products. NOT search-volume data,
 * user quotes, web analytics, usage counts or measured popularity.
 * No new product is indexed until its evidence package passes review.
 */
export const PRODUCT_TASK_PHRASES=Object.freeze({
 'anthropic-sdk-python':['Python怎么调用Claude API','Claude Python SDK异步流式接口','Anthropic SDK 怎么安装'],
 chatgpt:['ChatGPT免费版能做什么','哪个AI能帮我写邮件和研究资料','ChatGPT能上传文档分析吗','Codex能帮我开发网站吗','Codex能自动修复BUG并运行测试吗','Codex可以审查GitHub PR吗'],
 claude:['Claude适合长文档分析吗','Claude怎么写代码','Claude和ChatGPT有什么区别'],
 comfyui:['ComfyUI如何本地生成图片','免费开源AI绘画工作流','ComfyUI怎么装节点'],
 deepseek:['DeepSeek如何免费使用','DeepSeek编程推理能力','DeepSeek API怎么计费'],
 dify:['Dify怎么制作AI工作流','不用写代码搭建知识库问答','Dify自托管怎么部署'],
 elevenlabs:['AI配音怎么做比较自然','视频配音能否商用','ElevenLabs多语言语音合成多少钱'],
 fasterwhisper:['怎样把录音转成文字','faster-whisper怎么本地部署','离线批量语音转字幕'],
 gemini:['Gemini免费版有哪些功能','Google Gemini支持哪些国家','Gemini怎么分析图片文档'],
 grok:['Grok怎么搜索最新消息','Grok实时资讯功能','Grok需要付费吗'],
 langchain:['LangChain怎么开发AI智能体','Python AI工具调用框架','LangChain如何接知识库'],
 llamacpp:['没有显卡怎么运行大模型','llama.cpp本地模型量化','CPU运行GGUF模型'],
 llamaindex:['LlamaIndex怎么做文档检索','企业文档知识库RAG','怎样让AI回答自己的PDF'],
 lovable:['不用编程怎么做一个网站','Lovable AI建站多少钱','一句话生成网页原型'],
 luma:['Luma文生视频怎么做','Luma视频生成费用和积分','Luma Ray模型怎样使用'],
 midjourney:['Midjourney怎么生成图片','Midjourney套餐多少钱','AI绘画图片能商用吗'],
 n8n:['n8n自动化工作流怎么做','微信消息和表格自动处理','n8n如何连接AI模型'],
 ollama:['Ollama怎么在电脑运行AI','不联网使用本地大模型','Windows安装Ollama'],
 openwebui:['Open WebUI怎么连接Ollama','本地AI聊天界面推荐','Open WebUI部署教程'],
 'openai-python':['OpenAI Python SDK怎么调用','API Token如何计费','Python调用GPT模型代码'],
 perplexity:['哪个AI搜索会给出处','Perplexity适合做资料研究吗','AI搜索工具哪个好'],
 replit:['Replit怎么在线写网站','不安装开发环境写代码','Replit Agent费用'],
 runway:['Runway视频生成多少钱','图片变视频的AI工具','Runway视频去水印需要什么套餐'],
 automatic1111:['Stable Diffusion WebUI安装','免费的本地AI图片生成','AUTOMATIC1111怎么使用'],
 suno:['AI写歌软件哪个好','Suno免费生成音乐次数','Suno音乐商用授权规则'],
 transformers:['Hugging Face Transformers如何使用','Python加载开源AI模型','模型推理训练工具库'],
 vllm:['vLLM如何部署大模型API','提升大模型并发吞吐','自建GPU推理服务'],
 whisper:['Whisper音频转文字','视频自动生成字幕','开源离线语音识别'],
 qwen:['千问可以免费写代码吗','Qwen模型和百炼API价格','千问中文版多模态AI'],
 jimeng:['即梦AI视频怎么做','Seedance视频积分多少钱','即梦AI生成图片视频'],
 kling:['可灵AI视频多少钱','Kling视频会员积分','可灵图生视频如何做'],
 doubao:['豆包AI免费吗','豆包可以生成图片吗','豆包能帮我处理文档吗']
});
/** Intent recommendations are editorial capability matches, NOT vendor rankings. */
export const TASK_INTENTS=Object.freeze([
 {id:'video',pattern:/视频生成|生成视频|视频制作|图生视频|文生视频|照片动起来|短剧|短视频|image.to.video|text.to.video|ai video/i,ids:['runway','kling','jimeng','luma']},
 {id:'image',pattern:/画图|ai绘画|图片生成|文生图|设计图片|生成插画|ai image|text.to.image/i,ids:['midjourney','comfyui','jimeng','automatic1111','runway','gemini','doubao']},
 {id:'song',pattern:/写歌|编曲|生成音乐|做背景音乐|ai music|song generator/i,ids:['suno']},
 {id:'voice',pattern:/配音|语音合成|旁白|文字转语音|克隆声音|text.to.speech|voiceover/i,ids:['elevenlabs']},
 {id:'transcription',pattern:/字幕|语音转文字|录音转文字|音频转文字|语音识别|转录|transcrib|speech.to.text/i,ids:['whisper','fasterwhisper','elevenlabs']},
 {id:'site',pattern:/ai建站|生成网站|不用写代码做网站|不用编程|网页原型|web app builder|create website/i,ids:['lovable','replit','dify']},
 {id:'automation',pattern:/自动化工作流|自动处理表格|自动化任务|workflow|automation/i,ids:['n8n','dify','langchain']},
 {id:'local',pattern:/本地大模型|离线大模型|私有部署|本地ai|本地模型|offline ai|local llm/i,ids:['ollama','openwebui','llamacpp','vllm','transformers','comfyui']},
 {id:'research',pattern:/带引用的搜索|搜索有出处|联网研究|找资料|搜索论文|搜索资料|找出处|research ai|ai search/i,ids:['perplexity','gemini','chatgpt','claude','grok']},
 {id:'coding',pattern:/ai写代码|代码开发|编程助手|程序开发|code assistant|ai coding/i,ids:['claude','chatgpt','deepseek','qwen','replit','lovable','langchain']},
 {id:'document',pattern:/阅读pdf|分析合同|分析文档|长文档理解|知识库问答|document analysis|pdf question/i,ids:['claude','chatgpt','gemini','llamaindex','dify']},
 {id:'api',pattern:/调用api|python sdk|api开发|模型接口|api price|token price/i,ids:['openai-python','anthropic-sdk-python','deepseek','qwen','langchain','llamaindex','vllm']}
]);
/** @type {Array<[string,RegExp]>} */
const BRANDS=[
 ['chatgpt',/chatgpt|codex/i],['claude',/claude/i],['gemini',/gemini/i],
 ['deepseek',/deepseek/i],['grok',/grok/i],['perplexity',/perplexity/i],
 ['qwen',/qwen|千问/i],['runway',/runway/i],['luma',/\bluma\b/i],
 ['midjourney',/midjourney/i],['kling',/可灵|\bkling\b/i],
 ['jimeng',/即梦|jimeng/i],['doubao',/豆包|doubao/i],
 ['suno',/\bsuno\b/i],['elevenlabs',/elevenlabs/i],
 ['comfyui',/comfyui/i],['dify',/\bdify\b/i],['n8n',/\bn8n\b/i],
 ['ollama',/\bollama\b/i],['openwebui',/open webui|openwebui/i],
 ['lovable',/\blovable\b/i],['replit',/\breplit\b/i],
 ['langchain',/langchain/i],['llamaindex',/llamaindex/i],
 ['llamacpp',/llama[.]cpp/i],['vllm',/\bvllm\b/i],
 ['transformers',/\btransformers\b/i],['automatic1111',/automatic1111/i],
 ['anthropic-sdk-python',/anthropic python sdk/i],
 ['openai-python',/openai python sdk/i],
 ['fasterwhisper',/faster[- ]whisper/i],['whisper',/(?<!faster[- ])\bwhisper\b/i]
];
const fold=s=>String(s||'').normalize('NFKC').trim().toLocaleLowerCase();
const normalize=s=>fold(s).replace(/[\s\p{P}\p{S}]/gu,'');
export function questionForProduct(id){return PRODUCT_TASK_PHRASES[id]||[];}
/** @returns {string[] | null} */
export function matchingEditorialProductIds(query){
 const q=String(query||'').trim().slice(0,120);
 if(q.length<3)return null;
 const normalized=normalize(q);
 // A brand's Python SDK is a developer library, not just its consumer chat page.
 if(/claude|anthropic/i.test(q)&&/python|sdk|调用.*api/i.test(q))return ['anthropic-sdk-python','claude'];
 // Explicit names take priority: "ChatGPT vs Claude" offers both, not a fabricated winner.
 const named=BRANDS.filter(([,pattern])=>pattern.test(q)).map(([id])=>id);
 if(named.length)return named.slice(0,3);
 // General tasks offer several suitable tools so visitors can compare cost and regions.
 const match=TASK_INTENTS.find(group=>group.pattern.test(q));
 if(match)return match.ids;
 // Specific editorial questions without a known synonym retain their product connection.
 for(const [id,phrases] of Object.entries(PRODUCT_TASK_PHRASES)){
  if(phrases.some(phrase=>normalize(phrase)===normalized))return [id];
 }
 return null;
}
