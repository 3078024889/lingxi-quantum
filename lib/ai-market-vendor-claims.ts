/** Central account catalog: source must match market MARKET_API_PRODUCTS. */
export const AI_MARKET_CLAIMABLE_IDS = [
  'chatgpt',
  'claude',
  'gemini',
  'grok',
  'perplexity',
  'deepseek',
  'qwen',
  'doubao',
  'jimeng',
  'kling',
  'runway',
  'luma',
  'midjourney',
  'suno',
  'elevenlabs',
  'lovable',
  'replit',
  'ollama',
  'llamacpp',
  'vllm',
  'langchain',
  'llamaindex',
  'transformers',
  'comfyui',
  'automatic1111',
  'whisper',
  'fasterwhisper',
  'openwebui',
  'dify',
  'n8n',
  'openai-python',
  'anthropic-sdk-python'
] as const;
export const AI_MARKET_CLAIMABLE_LABELS:Record<string,string> = {
  "chatgpt": "ChatGPT",
  "claude": "Claude",
  "gemini": "Gemini",
  "grok": "Grok",
  "perplexity": "Perplexity",
  "deepseek": "DeepSeek",
  "qwen": "千问 Qwen",
  "doubao": "豆包",
  "jimeng": "即梦 AI",
  "kling": "可灵 Kling",
  "runway": "Runway",
  "luma": "Luma",
  "midjourney": "Midjourney",
  "suno": "Suno",
  "elevenlabs": "ElevenLabs",
  "lovable": "Lovable",
  "replit": "Replit",
  "ollama": "Ollama",
  "llamacpp": "llama.cpp",
  "vllm": "vLLM",
  "langchain": "LangChain",
  "llamaindex": "LlamaIndex",
  "transformers": "Transformers",
  "comfyui": "ComfyUI",
  "automatic1111": "Stable Diffusion WebUI",
  "whisper": "Whisper",
  "fasterwhisper": "faster-whisper",
  "openwebui": "Open WebUI",
  "dify": "Dify",
  "n8n": "n8n",
  "openai-python": "OpenAI Python SDK",
  "anthropic-sdk-python": "Anthropic Python SDK"
};
const claimable = new Set<string>(AI_MARKET_CLAIMABLE_IDS);
export function safeMarketProductId(raw:unknown){
 return typeof raw==='string'&&claimable.has(raw)?raw:null;
}
export function safeMarketClaimUrl(raw:unknown){
 if(typeof raw!=='string'||raw.length>1400)return null;
 try {
  const u=new URL(raw);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash||u.hostname.length<4||
  u.hostname==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)||u.hostname.endsWith('.local'))return null;
  return u.toString();
 } catch { return null; }
}
export function parseMarketVendorClaim(raw:unknown){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as Record<string,unknown>;
 const product_id=safeMarketProductId(v.productId);
 const company_name=typeof v.companyName==='string'?v.companyName.trim():'';
 const official_site=safeMarketClaimUrl(v.officialSite);
 const evidence_url=safeMarketClaimUrl(v.evidenceUrl);
 const work_email=typeof v.workEmail==='string'?v.workEmail.trim().toLowerCase():'';
 if(!product_id||company_name.length<2||company_name.length>120||!official_site||!evidence_url||
  work_email.length>254||! /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(work_email))return null;
 return {product_id,company_name,official_site,evidence_url,work_email};
}
