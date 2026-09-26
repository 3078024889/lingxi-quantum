const KEY="dd41b579ec97a1409083992973de0702";
const current=[
 "/","/products","/tools","/sasi","/sasi/drama","/ai-knowledge","/ai-learning","/ai-research","/about",
 "/tools/temp-mail","/tools/burn-after-read","/tools/food-calorie","/tools/id-photo-ai",
 "/tools/video-transcription","/tools/subtitle-translate","/tools/pdf-editor","/tools/ocr"
];
const retired=["/live-as","/practice","/romance","/archetype","/subconscious","/relationship","/life-map","/qian","/mirror","/tarot","/resilience","/daily","/wealth","/dream","/gate/relation"];
async function submit(host){
 const urls=[...current,...retired].map(p=>`https://${host}${p}`);
 const res=await fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"content-type":"application/json; charset=utf-8"},body:JSON.stringify({host,key:KEY,keyLocation:`https://${host}/${KEY}.txt`,urlList:urls})});
 console.log(host,res.status,res.statusText);
 if(!res.ok&&res.status!==202)process.exitCode=1;
}
await submit("lingxifield.com");
await submit("lingxifield.cn");
