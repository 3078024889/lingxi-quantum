export type MonetizationMode = 'free-ad'|'free-local'|'paid-once'|'paid-usage'|'paid-ai';
export type ToolPrice = { mode:MonetizationMode; rmb?:number; usd?:number; freeQuota?:number; unit?:string; productId?:string };
export const TOOL_PRICING: Record<string,ToolPrice> = {
  'why-cant-i-upload-this-file': {mode:'free-ad'},
  'compress-image': {mode:'free-ad'},
  'compress-image-to-target': {mode:'paid-once',rmb:1,usd:0.2,freeQuota:1,unit:'file',productId:'tool-exact-compress'},
  'photo-requirement-checker': {mode:'paid-once',rmb:2,usd:0.3,freeQuota:1,unit:'image',productId:'tool-photo-compliance'},
  'merge-pdf': {mode:'free-ad'}, 'split-pdf': {mode:'free-ad'}, 'image-to-pdf': {mode:'free-ad'}, 'pdf-to-jpg': {mode:'free-ad'},
  'compress-pdf': {mode:'paid-once',rmb:2,usd:0.3,freeQuota:1,unit:'file',productId:'tool-pdf-compress'},
  'ocr-image': {mode:'paid-usage',rmb:1,usd:0.2,freeQuota:3,unit:'page',productId:'tool-ocr'},
  'privacy-scan': {mode:'paid-usage',rmb:2,usd:0.3,freeQuota:1,unit:'image',productId:'tool-privacy-scan'},
  'website-diagnose': {mode:'free-ad'}, 'qr-safe-preview': {mode:'free-ad'}, 'real-file-type': {mode:'free-ad'},
  'video-compatibility': {mode:'free-ad'},
  'video-compress-target': {mode:'paid-usage',rmb:4,usd:0.6,unit:'job',productId:'tool-video-compress'},
  'video-dub': {mode:'paid-ai',rmb:9.9,usd:1.5,unit:'job',productId:'tool-video-dub'},
  'food-analyze': {mode:'paid-ai',rmb:1.9,usd:0.3,freeQuota:1,unit:'image',productId:'tool-food-analyze'},
  'ai-portrait': {mode:'paid-ai',rmb:4.9,usd:0.8,unit:'image',productId:'tool-ai-portrait'},
};
