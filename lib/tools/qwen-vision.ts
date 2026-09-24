import "server-only";

function baseUrl(){
  const explicit=process.env.DASHSCOPE_COMPATIBLE_BASE_URL?.trim();
  if(explicit)return explicit.replace(/\/$/,"");
  const wan=process.env.SASI_WAN_BASE_URL?.trim();
  if(wan){
    try{
      const u=new URL(wan);
      if(u.protocol==="https:"&&(u.hostname==="dashscope.aliyuncs.com"||u.hostname.endsWith(".maas.aliyuncs.com"))){
        u.pathname="/compatible-mode/v1";
        u.search="";
        u.hash="";
        return u.toString().replace(/\/$/,"");
      }
    }catch{}
  }
  return "https://dashscope.aliyuncs.com/compatible-mode/v1";
}

function messageText(data:any){
  const value=data?.choices?.[0]?.message?.content;
  if(typeof value==="string")return value.trim();
  if(Array.isArray(value))return value.map((x:any)=>typeof x?.text==="string"?x.text:"").join("").trim();
  return "";
}

export async function analyzeFoodWithQwen(input:{dataUrl:string;prompt:string}){
  const key=process.env.DASHSCOPE_API_KEY?.trim();
  if(!key)throw new Error("DASHSCOPE_API_KEY_MISSING");
  const model=process.env.QWEN_VISION_MODEL?.trim()||"qwen3-vl-flash";
  const response=await fetch(`${baseUrl()}/chat/completions`,{
    method:"POST",
    headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      model,
      messages:[{
        role:"user",
        content:[
          {type:"image_url",image_url:{url:input.dataUrl}},
          {type:"text",text:input.prompt},
        ],
      }],
      stream:false,
    }),
    cache:"no-store",
    signal:AbortSignal.timeout(45000),
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`QWEN_VISION_${response.status}`);
  const text=messageText(body);
  if(!text)throw new Error("QWEN_VISION_EMPTY");
  return {text,model:String(body?.model||model),usage:body?.usage||null};
}
