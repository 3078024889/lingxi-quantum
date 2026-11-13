export type TextProfile={model:string;inputYuanPerMillion:number;outputYuanPerMillion:number;maxOutputTokens:number;validUntil:string;priceSource:string};
export function parseTextProfile(raw:string|undefined,now=Date.now()):TextProfile|null{
  try{const p=JSON.parse(raw??"null");if(!p||typeof p.model!=="string"||!/^[a-z0-9._-]{3,180}$/i.test(p.model)
    ||![p.inputYuanPerMillion,p.outputYuanPerMillion].every(n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=10000)
    ||!Number.isInteger(p.maxOutputTokens)||p.maxOutputTokens<1024||p.maxOutputTokens>16384||!Number.isFinite(Date.parse(p.validUntil))||Date.parse(p.validUntil)<=now)return null;
    const u=new URL(p.priceSource);if(u.protocol!=="https:"||!["docs.volcengine.com","www.volcengine.com"].includes(u.hostname))return null;
    return{model:p.model,inputYuanPerMillion:p.inputYuanPerMillion,outputYuanPerMillion:p.outputYuanPerMillion,maxOutputTokens:p.maxOutputTokens,validUntil:p.validUntil,priceSource:u.toString()};
  }catch{return null;}
}
