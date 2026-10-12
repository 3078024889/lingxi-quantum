import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createHmac,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';

// Called only by the disposable native PostgreSQL fixture runner.
// A real PostgREST + Supabase JS + built Next.js route chain, not an HTTP mock.
export async function verifyBurnHttp({db,runtime,port,password}){
 const jwtSecret=randomUUID()+randomUUID(),burnSecret=randomUUID();
 const sign=(part,secret)=>createHmac('sha256',secret).update(part).digest('base64url');
 const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
 const payload=Buffer.from(JSON.stringify({role:'service_role',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 const jwt=header+'.'+payload+'.'+sign(header+'.'+payload,jwtSecret);
 const children=[];let gateway;
 const log=fs.createWriteStream('reports/r64/burn-http-server.log');
 const start=(bin,args,env)=>{
  const child=spawn(bin,args,{cwd:process.cwd(),env,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
  child.on('error',e=>log.write(e.message+'\n'));
  for(const stream of [child.stdout,child.stderr])stream.on('data',b=>log.write(String(b).replaceAll(password,'[LOCAL_PASSWORD]').replaceAll(jwtSecret,'[LOCAL_JWT_SECRET]').replaceAll(jwt,'[LOCAL_SERVICE_TOKEN]').replaceAll(burnSecret,'[LOCAL_SHARE_SECRET]')));
  return child;
 };
 const wait=async(url,expected)=>{for(let i=0;i<120;i++){if(children.some(c=>c.exitCode!==null))throw Error('LOCAL_HTTP_PROCESS_EXITED');try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(r.status===expected)return}catch{}await new Promise(r=>setTimeout(r,250))}throw Error('LOCAL_HTTP_START_TIMEOUT')};
 try{
  await db.query('alter role service_role bypassrls;grant usage on schema public to anon,authenticated,service_role;grant select on public.burn_files to service_role');
  start(path.join(runtime,'postgrest-14.13','postgrest.exe'),[],{...process.env,
   PATH:path.join(runtime,'node_modules/@embedded-postgres/windows-x64/native/bin')+path.delimiter+process.env.PATH,
   PGRST_DB_URI:`postgres://postgres:${password}@127.0.0.1:${port}/postgres`,PGRST_DB_SCHEMAS:'public',PGRST_DB_ANON_ROLE:'anon',PGRST_JWT_SECRET:jwtSecret,PGRST_SERVER_HOST:'127.0.0.1',PGRST_SERVER_PORT:'55465',PGRST_DB_POOL:'5',PGRST_LOG_LEVEL:'error'});
  await wait('http://127.0.0.1:55465/',200);
  gateway=http.createServer(async(req,res)=>{
   if(!req.url?.startsWith('/rest/v1/')){res.writeHead(404);res.end();return}
   try{
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>16384)throw Error('LOCAL_GATEWAY_BODY_LIMIT');chunks.push(chunk)}
    const response=await fetch('http://127.0.0.1:55465'+req.url.slice('/rest/v1'.length),{method:req.method,headers:{'content-type':'application/json',authorization:String(req.headers.authorization||''),accept:String(req.headers.accept||'application/json')},body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks),signal:AbortSignal.timeout(10000)});
    res.writeHead(response.status,{'content-type':response.headers.get('content-type')||'application/json'});res.end(Buffer.from(await response.arrayBuffer()));
   }catch{res.writeHead(503);res.end()}
  });
  await new Promise((resolve,reject)=>{gateway.once('error',reject);gateway.listen(55466,'127.0.0.1',resolve)});
  start(process.execPath,[path.resolve('node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','31065'],{...process.env,
   NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:55466',NEXT_PUBLIC_SUPABASE_ANON_KEY:jwt,SUPABASE_SERVICE_ROLE_KEY:jwt,BURN_LINK_TOKEN_SECRET:burnSecret,
   R2_ACCOUNT_ID:'local-test',R2_ACCESS_KEY_ID:'local-key',R2_SECRET_ACCESS_KEY:randomUUID(),R2_BUCKET_PRIVATE_BURN:'local-private-test',R2_ENDPOINT:'https://isolated-r64.r2.example.test'});
  await wait('http://127.0.0.1:31065/api/tools/burn-after-read/consume',405);
  const id=randomUUID(),viewId=randomUUID(),expiresAt=new Date(Date.now()+120000).toISOString();
  await db.query("insert into burn_notes(id,ciphertext,iv,expires_at,max_views,has_files,ready_at) values($1,'encrypted','iv',$2,1,true,now())",[id,expiresAt]);
  await db.query("insert into burn_files(note_id,object_key,original_name,size_bytes) values($1,$2,'private.txt',10)",[id,'burn/'+id+'/file']);
  const exp=Math.floor(Date.parse(expiresAt)/1000),revealToken=`v1.${exp}.${sign(`v1:${id}:${exp}`,burnSecret)}`;
  const post=(action,body)=>fetch('http://127.0.0.1:31065/api/tools/burn-after-read/'+action,{method:'POST',headers:{'content-type':'application/json',origin:'http://127.0.0.1:31065',referer:'http://127.0.0.1:31065/tools/burn-after-read/'+id,'sec-fetch-site':'same-origin'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  assert.equal((await post('consume',{id})).status,403);assert.equal((await post('ack',{id,revealToken:revealToken+'X',viewId})).status,403);
  const preview=await post('consume',{id,revealToken});assert.equal(preview.status,200);const before=await preview.json();assert.equal(before.ciphertext,'encrypted');assert.equal(before.files,undefined);
  assert.equal((await db.query('select views_used from burn_notes where id=$1',[id])).rows[0].views_used,0);
  const anonymous=await fetch('http://127.0.0.1:55465/rpc/preview_burn_note',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({p_id:id})});assert.equal(anonymous.status,401);
  const repeated=await Promise.all(Array.from({length:12},()=>post('ack',{id,revealToken,viewId})));
  for(const response of repeated){assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const body=await response.json();assert.equal(body.views_used,1);assert.equal(body.files[0].name,'private.txt');const url=new URL(body.files[0].url);assert.equal(url.hostname,'isolated-r64.r2.example.test');assert(Number(url.searchParams.get('X-Amz-Expires'))<=120)}
  assert.equal((await db.query('select views_used from burn_notes where id=$1',[id])).rows[0].views_used,1);
  assert.equal((await post('ack',{id,revealToken,viewId:randomUUID()})).status,410);
  console.log('PASS: built Next.js HTTP routes → actual Supabase JS → native PostgREST 14.13 → PostgreSQL; token/WebView rejection, preview without download URLs, role permissions, 12 concurrent ACKs count once and signed file TTL bound. Only local fixtures; no R2 requests or production data.');
 }finally{
  if(gateway){gateway.closeAllConnections();await new Promise(resolve=>gateway.close(resolve))}
  for(const child of children.reverse()){if(child.exitCode===null){const stopped=new Promise(resolve=>child.once('exit',resolve));child.kill();await Promise.race([stopped,new Promise(resolve=>setTimeout(resolve,3000))])}}
  log.end();
 }
}
