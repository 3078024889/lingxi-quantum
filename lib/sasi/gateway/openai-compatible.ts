export interface OpenAICompatibleConfig{baseUrl:string;apiKey:string;model:string;headers?:Record<string,string>;timeoutMs?:number}
export interface ChatMessage{role:"system"|"user"|"assistant"|"tool";content:string}
export interface CompatibleRequest{messages:ChatMessage[];temperature?:number;maxTokens?:number;stream?:boolean}
export function chatCompletionsUrl(baseUrl:string){return baseUrl.replace(/\/$/,"")+"/chat/completions"}
export function toOpenAIRequest(config:OpenAICompatibleConfig,input:CompatibleRequest){return {url:chatCompletionsUrl(config.baseUrl),headers:{"content-type":"application/json",authorization:"Bearer "+config.apiKey,...config.headers},body:{model:config.model,messages:input.messages,temperature:input.temperature,max_tokens:input.maxTokens,stream:input.stream??false},timeoutMs:config.timeoutMs??60000}}
