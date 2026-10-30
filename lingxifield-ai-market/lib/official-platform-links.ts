// Links must resolve to the publisher or official platform download hub. No fabricated app store links.
export type PlatformLink={label:string;url:string;kind:'desktop'|'ios'|'android'|'x'|'news'|'team'|'github'|'reviews'};
type Profile={links:readonly PlatformLink[];team?:{summary:string;source:string};funding?:{summary:string;source:string}};
export const OFFICIAL_PLATFORM_LINKS:Record<string,Profile>={
 chatgpt:{links:[
 {label:'电脑端下载',url:'https://chatgpt.com/download/',kind:'desktop'},
 {label:'App Store 评价',url:'https://apps.apple.com/us/app/chatgpt/id6448311069',kind:'reviews'},
 {label:'iPhone 下载',url:'https://chatgpt.com/download/',kind:'ios'},
 {label:'Android 下载',url:'https://chatgpt.com/download/',kind:'android'},
 {label:'X 官方账号',url:'https://x.com/OpenAI',kind:'x'},
 {label:'最新动态',url:'https://openai.com/news/',kind:'news'},
 {label:'公司与团队',url:'https://openai.com/about/',kind:'team'}
 ],team:{summary:'OpenAI 于 2015 年成立；公司组织及董事会信息以官方介绍为准。',source:'https://openai.com/our-structure/'}},
 claude:{links:[
 {label:'电脑端下载',url:'https://claude.com/download',kind:'desktop'},
 {label:'App Store 评价',url:'https://apps.apple.com/us/app/claude-by-anthropic/id6473753684',kind:'reviews'},
 {label:'iPhone 下载',url:'https://claude.com/download',kind:'ios'},
 {label:'Android 下载',url:'https://claude.com/download',kind:'android'},
 {label:'X 官方账号',url:'https://x.com/AnthropicAI',kind:'x'},
 {label:'最新动态',url:'https://www.anthropic.com/news',kind:'news'},
 {label:'公司与团队',url:'https://www.anthropic.com/company',kind:'team'}
 ]},
 gemini:{links:[
 {label:'手机端使用说明',url:'https://support.google.com/gemini/answer/14579026',kind:'android'},
 {label:'Google 官方资讯',url:'https://blog.google/technology/ai/',kind:'news'}
 ]},
 runway:{links:[
 {label:'iPhone 下载',url:'https://apps.apple.com/us/app/runway-ai-image-video/id1665024375',kind:'ios'},
 {label:'App Store 评价',url:'https://apps.apple.com/us/app/runway-ai-image-video/id1665024375',kind:'reviews'},
 {label:'X 官方账号',url:'https://x.com/runwayml',kind:'x'},
 {label:'最新动态',url:'https://runwayml.com/research',kind:'news'}
 ]},
 perplexity:{links:[
 {label:'iPhone / Android',url:'https://www.perplexity.ai/mobile',kind:'ios'},
 {label:'X 官方账号',url:'https://x.com/perplexity_ai',kind:'x'}
 ]},
 ollama:{links:[
 {label:'Windows / Mac / Linux 下载',url:'https://ollama.com/download',kind:'desktop'},
 {label:'GitHub 源码',url:'https://github.com/ollama/ollama',kind:'github'}
 ]},
 suno:{links:[
 {label:'iPhone 下载',url:'https://apps.apple.com/us/app/suno-ai-songs-music-lyrics/id6480136315',kind:'ios'},
 {label:'安卓下载指引',url:'https://help.suno.com/en/articles/3134337',kind:'android'},
 {label:'App Store 评价',url:'https://apps.apple.com/us/app/suno-ai-songs-music-lyrics/id6480136315',kind:'reviews'},
 {label:'官方更新',url:'https://suno.com/release-notes',kind:'news'}
 ]},
 elevenlabs:{links:[
 {label:'iPhone 与安卓下载',url:'https://elevenlabs.io/docs/help-center/other/does-eleven-labs-have-an-official-app',kind:'ios'},
 {label:'手机客户端下载',url:'https://elevenlabs.io/docs/help-center/product/mobile-apps/elevenlabs-for-ios-and-android/what-is-the-elevenlabs-app',kind:'android'}
 ]},
 lovable:{links:[
 {label:'Windows / Mac 下载',url:'https://lovable.dev/en/download',kind:'desktop'},
 {label:'最新动态',url:'https://lovable.dev/blog',kind:'news'}
 ]},
 replit:{links:[
 {label:'iPhone / 安卓下载',url:'https://replit.com/mobile-download',kind:'ios'},
 {label:'App 介绍',url:'https://replit.com/products/mobile',kind:'android'}
 ]},
 comfyui:{links:[
 {label:'电脑端安装',url:'https://www.comfy.org/download',kind:'desktop'},
 {label:'GitHub 源码',url:'https://github.com/Comfy-Org/ComfyUI',kind:'github'}
 ]}
};
export function platformLinks(id:string):Profile{
 return OFFICIAL_PLATFORM_LINKS[id]||{links:[]};
}
export function safePublisherLink(link:PlatformLink):boolean{
 try{const u=new URL(link.url);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.length>3&&/^(?:desktop|ios|android|x|news|team|github|reviews)$/.test(link.kind)}catch{return false}
}
