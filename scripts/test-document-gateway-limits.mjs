import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createHmac,randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
const secret='gateway-test-only-'+randomUUID();
let mode='normal',releaseHeld,held=false;
const upstream=http.createServer(async(req,res)=>{
 if(req.url==='/health'){res.end();return}
 for await(const chunk of req){}
 if(mode==='hold'){held=true;await new Promise(resolve=>{releaseHeld=resolve})}
 if(mode==='declared'){res.writeHead(200,{'content-length':101*1024*1024});res.end();return}
 if(mode==='chunked'){
  res.writeHead(200,{'content-type':'application/pdf'});
  const block=Buffer.alloc(1024*1024);block.write('%PDF-');
  for(let i=0;i<101;i++){if(res.destroyed)return;if(!res.write(block))await new Promise(resolve=>{const done=()=>{res.off('drain',done);res.off('close',done);resolve()};res.once('drain',done);res.once('close',done)})}
  res.end();return;
 }
 if(mode==='stalled'){res.writeHead(200,{'content-type':'application/pdf'});res.write('%PDF-');return}
 res.end('%PDF-1.7\n%%EOF');
});
upstream.listen(0,'127.0.0.1');await once(upstream,'listening');
const reserve=http.createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(r=>reserve.close(r));
const gateway=spawn(process.execPath,['infra/document-converter/gateway/server.mjs'],{env:{...process.env,PORT:String(port),LINGXIFIELD_DOCUMENT_GATEWAY_SECRET:secret,GOTENBERG_INTERNAL_URL:'http://127.0.0.1:'+upstream.address().port},stdio:['ignore','pipe','pipe']});
const base='http://127.0.0.1:'+port;let errors='';gateway.stderr.on('data',b=>{errors+=b});
const bytes=Buffer.from('{\rtf1 test}');
function ticket(size=bytes.length){const exp=Math.floor(Date.now()/1000)+300,nonce=randomUUID(),name='sample.rtf',type='application/rtf';const token=createHmac('sha256',secret).update(['v1',exp,nonce,size,name,type].join('\n')).digest('base64url');return {'content-type':type,'x-lingxifield-ticket-version':'v1','x-lingxifield-filename':name,'x-lingxifield-size':String(size),'x-lingxifield-exp':String(exp),'x-lingxifield-nonce':nonce,'x-lingxifield-token':token}}
async function convert(headers=ticket()){return fetch(base+'/convert',{method:'POST',headers,body:bytes})}
async function status(response,expected){assert.equal(response.status,expected,await response.text())}
try{
 for(let i=0;i<100;i++){try{const r=await fetch(base+'/health');if(r.ok)break}catch{}if(i===99)throw new Error('gateway not ready: '+errors);await delay(50)}
 await status(await convert({...ticket(),'x-lingxifield-token':'wrong'}),401);
 for(const size of [-1,NaN,Infinity,1.5])await status(await convert(ticket(size)),401);
 mode='hold';const firstTicket=ticket(),secondTicket=ticket();const first=convert(firstTicket);
 for(let i=0;i<100&&!held;i++)await delay(20);assert(held);
 const busy=await convert(secondTicket);assert.equal(busy.headers.get('retry-after'),'5');await status(busy,503);
 mode='normal';releaseHeld();await status(await first,200);
 await status(await convert(secondTicket),200);await status(await convert(firstTicket),409);
 mode='declared';await status(await convert(),413);
 mode='chunked';await status(await convert(),413);
 mode='normal';await status(await convert(),200);
 mode='stalled';const started=Date.now();await status(await convert(),504);assert(Date.now()-started>=65_000);
 mode='normal';await status(await convert(),200);
 console.log('PASS: authenticated admission, integer sizes, one active conversion, retryable busy ticket, replay protection, declared/chunked output limits, stalled response timeout and slot recovery.');
}finally{gateway.kill();upstream.closeAllConnections();await new Promise(r=>upstream.close(r))}
