function hash32(value:string){
 let h=2166136261>>>0;
 for(let i=0;i<value.length;i++){
  h^=value.charCodeAt(i);
  h=Math.imul(h,16777619)>>>0;
 }
 return h>>>0;
}

export function retryWithJitter(baseSeconds:number,attempt:number,key:string,capSeconds=21600){
 const exp=Math.max(0,Math.min(Number(attempt||1)-1,8));
 const raw=Math.min(Math.max(30,baseSeconds)*2**exp,Math.max(30,capSeconds));
 const unit=(hash32(`${key}:${attempt}`)%10001)/10000;
 const factor=.8+unit*.4;
 return Math.max(30,Math.round(raw*factor));
}

export function webhookRetrySeconds(attempt:number,key:string){
 return retryWithJitter(60,attempt,key,6*60*60);
}
