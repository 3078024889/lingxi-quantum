import type {ByokProvider} from "@/lib/sasi/credential-vault";

export type PublicCapability = "text"|"vision"|"image"|"video"|"audio";

export type ProviderDefaults = {
  provider: ByokProvider;
  baseUrl: string;
  capabilities: PublicCapability[];
  textWire?: "openai"|"anthropic"|"gemini";
  modelHints?: string[];
};

const DEFAULTS: Record<ByokProvider, ProviderDefaults> = {
  openai:{provider:"openai",baseUrl:"https://api.openai.com/v1",capabilities:["text","vision","image","video","audio"],textWire:"openai"},
  xai:{provider:"xai",baseUrl:"https://api.x.ai/v1",capabilities:["text","vision","image","video"],textWire:"openai"},
  anthropic:{provider:"anthropic",baseUrl:"https://api.anthropic.com/v1",capabilities:["text","vision"],textWire:"anthropic"},
  gemini:{provider:"gemini",baseUrl:"https://generativelanguage.googleapis.com/v1beta",capabilities:["text","vision","image","audio"],textWire:"gemini"},
  deepseek:{provider:"deepseek",baseUrl:"https://api.deepseek.com",capabilities:["text"],textWire:"openai"},
  openrouter:{provider:"openrouter",baseUrl:"https://openrouter.ai/api/v1",capabilities:["text","vision"],textWire:"openai"},
  luma:{provider:"luma",baseUrl:"https://api.lumalabs.ai/dream-machine/v1",capabilities:["image","video"]},
  volcengine:{provider:"volcengine",baseUrl:"https://ark.cn-beijing.volces.com/api/v3",capabilities:["text","vision","image","video"],textWire:"openai"},
  aliyun:{provider:"aliyun",baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1",capabilities:["text","vision","image","video","audio"],textWire:"openai"},
  compatible:{provider:"compatible",baseUrl:"",capabilities:["text"],textWire:"openai"},
};

export function providerDefaults(provider:ByokProvider){return DEFAULTS[provider]}
export function defaultBaseUrl(provider:ByokProvider){return DEFAULTS[provider].baseUrl}
export function providerPublicCapabilities(provider:ByokProvider){return DEFAULTS[provider].capabilities}

const BAD_MODEL=/(embed|embedding|moderation|rerank|whisper|tts|speech|audio|image|video|vision-only)/i;
export function chooseTextModel(provider:ByokProvider, models:string[], explicit?:string|null){
  const wanted=String(explicit||"").trim();
  if(wanted)return wanted;
  const cleaned=models.map(x=>x.replace(/^models\//,""))
    .filter(x=>x && x.length<=180 && !BAD_MODEL.test(x));
  const preferred=cleaned.find(x=>/(gpt|claude|gemini|grok|deepseek|qwen|doubao|glm|chat|instruct|reason)/i.test(x));
  return preferred||cleaned[0]||"";
}
