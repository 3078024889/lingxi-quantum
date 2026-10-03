const base=(process.env.LINGXIFIELD_BASE_URL||"").replace(/\/$/,"");
if(!base)throw new Error("LINGXIFIELD_BASE_URL_REQUIRED");

async function json(url,headers={}){
 const r=await fetch(url,{headers,redirect:"manual"});
 const body=await r.json().catch(()=>null);
 return{status:r.status,body};
}

const publicHealth=await json(`${base}/api/health`);
if(publicHealth.status!==200||publicHealth.body?.ok!==true){
 console.error("PUBLIC_HEALTH_FAILED",publicHealth);
 process.exit(1);
}
console.log("R15_PRODUCTION_PUBLIC_HEALTH=PASS");

const secret=process.env.MONEY_RECONCILE_SECRET||"";
if(secret){
 const ready=await json(`${base}/api/internal/ops/readiness`,{authorization:`Bearer ${secret}`});
 if(![200,503].includes(ready.status)){
  console.error("INTERNAL_READINESS_REQUEST_FAILED",ready);
  process.exit(1);
 }
 console.log(`R15_PRODUCTION_INTERNAL_READINESS=${String(ready.body?.status||"unknown").toUpperCase()}`);
 console.log(JSON.stringify(ready.body,null,2));
}else{
 console.log("R15_PRODUCTION_INTERNAL_READINESS=SKIPPED_NO_SECRET");
}
