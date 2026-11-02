import {randomInt} from 'node:crypto';
export const FEEDBACK_CATEGORIES=['tool_experience','site_experience','bug','suggestion','correction'];
export const FEEDBACK_LOCALES=['zh','en','ja','ko','fr','de','es','pt','ar'];
// The alias is the author's own pseudonym, NEVER a fabricated review or identity claim.
export const STAR_ALIASES={
 zh:['土星旅人','金星光羽','天狼星使者','仙女座微光','北斗星尘','织女星河','阿尔忒弥斯','奥丁星图','伊西斯之星','猎户星行者','木星守望者','月桂星语'],
 en:['Saturn Voyager','Venus Ray','Sirius Herald','Andromeda Glow','Orion Dreamer','Artemis Moon','Odin Atlas','Isis Starlight','Vega Wanderer','Jupiter Guardian'],
 ja:['土星の旅人','金星の光','シリウスの使者','アンドロメダの微光','織姫の星空'],
 ko:['토성 여행자','금성의 빛','시리우스 전령','안드로메다의 빛','직녀성의 노래'],
 fr:['Voyageur de Saturne','Éclat de Vénus','Messager de Sirius','Lueur d’Andromède','Gardien d’Orion'],
 de:['Saturn-Wanderer','Venuslicht','Sirius-Bote','Andromeda-Glanz','Orion-Wächter'],
 es:['Viajero de Saturno','Luz de Venus','Mensajero de Sirio','Resplandor de Andrómeda','Guardián de Orión'],
 pt:['Viajante de Saturno','Luz de Vênus','Mensageiro de Sirius','Brilho de Andrômeda','Guardião de Órion'],
 ar:['مسافر زحل','نور الزهرة','رسول الشعرى','وهج أندروميدا','حارس الجبار']
};
export function pickStarNickname(locale='en'){const pool=STAR_ALIASES[locale]||STAR_ALIASES.en;return pool[randomInt(pool.length)];}
const asText=v=>typeof v==='string'?v.trim():'';
export function validateVisitorFeedback(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const category=asText(raw.category),locale=asText(raw.locale),body=asText(raw.body);
 const nickname=asText(raw.nickname),productId=asText(raw.productId);
 if(!FEEDBACK_CATEGORIES.includes(category)||!FEEDBACK_LOCALES.includes(locale))return null;
 if([...body].length<15||[...body].length>1500||/<\s*\/?\s*(script|iframe|img|svg)|(?:https?:\/\/\S+\s*){3,}/iu.test(body))return null;
 if(nickname&&([...nickname].length<2||[...nickname].length>32||/https?:\/\/|[<>]/i.test(nickname)))return null;
 if(productId&&!/^[a-z0-9][a-z0-9-]{0,79}$/.test(productId))return null;
 if(category==='tool_experience'&&!productId)return null;
 return {category,locale,body,nickname:nickname||pickStarNickname(locale),productId:productId||null};
}
