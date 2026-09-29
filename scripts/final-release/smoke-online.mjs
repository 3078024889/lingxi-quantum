const base=(process.argv[2]||"https://lingxifield.com").replace(/\/$/,"");
const paths=["/","/tools","/tools/food-calorie","/tools/pdf-editor","/tools/ocr","/tools/image-watermark-remover","/tools/video-toolkit","/tools/temp-mail","/sasi"];
let failed=[];for(const p of paths){let ok=false,last="";for(let i=0;i<12;i++){try{const r=await fetch(base+p,{redirect:"follow",headers:{"user-agent":"LINGXIFIELD-RELEASE-SMOKE/1.0"}});last=String(r.status);if(r.ok){ok=true;break}}catch(e){last=String(e)}await new Promise(r=>setTimeout(r,10000))}console.log(`${p}=${ok?"PASS":"FAIL:"+last}`);if(!ok)failed.push(p)}
if(failed.length)process.exit(4);console.log("PRODUCTION_CORE_ROUTES=PASS");
