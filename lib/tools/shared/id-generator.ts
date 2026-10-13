const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const MAX_TIME = 0xffffffffffff;

/** ULID's published 48-bit timestamp and 80-bit monotonic random suffix. */
export function createMonotonicUlid(now:()=>number=Date.now,random:()=>Uint8Array=()=>crypto.getRandomValues(new Uint8Array(16))){
 let lastTime=-1,digits:number[]=[];
 return()=>{
  const clock=now();
  if(!Number.isSafeInteger(clock)||clock<0||clock>MAX_TIME)throw Error('ULID_TIME_INVALID');
  const time=Math.max(clock,lastTime);
  if(time===lastTime){let index=digits.length-1;while(index>=0&&digits[index]===31)index--;if(index<0)throw Error('ULID_RANDOM_OVERFLOW');digits[index]++;for(let tail=index+1;tail<digits.length;tail++)digits[tail]=0;}
  else{const bytes=random();if(bytes.length!==16)throw Error('ULID_RANDOM_INVALID');digits=Array.from(bytes,byte=>byte&31);}
  lastTime=time;let value=time,prefix='';
  for(let index=0;index<10;index++){prefix=ALPHABET[value%32]+prefix;value=Math.floor(value/32);}
  return prefix+digits.map(digit=>ALPHABET[digit]).join('');
 };
}
export function idBatchCount(count:number){if(!Number.isFinite(count))throw Error('ID_COUNT_INVALID');return Math.max(1,Math.min(10000,Math.floor(count)));}
