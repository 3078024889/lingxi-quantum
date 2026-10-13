export type RegexHit={index:number;match:string;position:number;groups:(string|undefined)[]};
export function runRegexSafely(pattern:string,text:string,signal?:AbortSignal):Promise<RegexHit[]>{
 if(pattern.length>20000||text.length>500000)return Promise.reject(Error('REGEX_INPUT_TOO_LARGE'));
 if(signal?.aborted)return Promise.reject(Error('REGEX_CANCELLED'));
 if(typeof Worker==='undefined')return Promise.reject(Error('REGEX_UNAVAILABLE'));
 return new Promise((resolve,reject)=>{
  let worker:Worker;try{worker=new Worker('/runtime/tools/regex-worker-v79.js')}catch{reject(Error('REGEX_UNAVAILABLE'));return}
  let settled=false;
  const finish=(error?:Error,matches?:RegexHit[])=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);worker.terminate();if(error)reject(error);else resolve(matches||[])};
  const cancel=()=>finish(Error('REGEX_CANCELLED'));
  let timer=setTimeout(()=>finish(Error('REGEX_UNAVAILABLE')),10000);
  signal?.addEventListener('abort',cancel,{once:true});
  worker.onmessage=event=>{if(settled)return;const data=event.data;if(data?.ready===true){clearTimeout(timer);timer=setTimeout(()=>finish(Error('REGEX_TIMEOUT')),1500);try{worker.postMessage({pattern,text})}catch{finish(Error('REGEX_INVALID'))}return}if(data?.ok===true&&Array.isArray(data.matches))finish(undefined,data.matches);else finish(Error(/^REGEX_/.test(data?.error||'')?data.error:'REGEX_INVALID'))};
  worker.onerror=()=>finish(Error('REGEX_UNAVAILABLE'));
 });
}
