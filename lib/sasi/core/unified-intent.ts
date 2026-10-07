import {inferSasiMode} from "./intent-router";
import type {SasiMode} from "./session-contract";

export type UnifiedSasiIntent=SasiMode|"chat"|"image";

const IMAGE_RULES=[
 "生成图片","生成一张","生成照片","画一张","画一个","做一张图","图片生成","海报","封面图",
 "create image","generate image","draw","illustration","poster","cover image",
 "画像生成","イラスト","이미지 생성","그림","créer une image","générer une image",
 "bild erstellen","imagen","crear imagen","gerar imagem","صورة","إنشاء صورة"
];

function hasAny(value:string,rules:string[]){return rules.some(rule=>value.includes(rule.toLowerCase()))}

export function inferExplicitUnifiedSasiIntent(text:string):UnifiedSasiIntent|null{
 const value=String(text||"").trim().toLowerCase();
 if(!value)return null;
 if(hasAny(value,IMAGE_RULES))return"image";
 return inferSasiMode(value);
}

export function inferUnifiedSasiIntent(text:string,hasFiles=false):UnifiedSasiIntent{
 const explicit=inferExplicitUnifiedSasiIntent(text);
 if(explicit)return explicit;
 if(hasFiles)return"book";
 return"chat";
}

export const UNIFIED_SASI_EXAMPLES_ZH=[
 "构建一个网站",
 "生成一部100集短剧",
 "生成图片或视频",
 "把这本书活化成可对话的智能体",
 "研究这些资料并给出证据",
 "教我这一章"
];
