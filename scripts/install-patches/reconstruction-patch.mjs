import fs from"node:fs";
function patch(p,fn){const s=fs.readFileSync(p,"utf8"),n=fn(s);if(n!==s){fs.writeFileSync(p,n);console.log("PATCHED",p)}else console.log("UNCHANGED",p)}
patch("components/Nav.tsx",s=>s.replace(
'style={{width:"100%",display:"flex",alignItems:"center",gap:10,border:"1px solid rgba(150,125,70,.20)",borderRadius:14,padding:"11px 12px",background:"rgba(255,255,255,.55)",fontWeight:650,cursor:"pointer"}}><span aria-hidden="true">✦</span><span>告诉我们</span>',
'style={{width:"100%",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(150,125,70,.20)",borderRadius:12,padding:"9px 12px",background:"rgba(255,255,255,.55)",fontSize:14,fontWeight:500,lineHeight:"20px",cursor:"pointer"}}><span aria-hidden="true" style={{fontSize:12}}>✦</span><span>告诉我们</span>'
).replace('>查看处理进度</Link>','>我的问题</Link>'));
patch("app/account/page.tsx",s=>{
 s=s.replace(/`r`n/g,"\n");
 if(!s.includes('href="/account/support"'))s=s.replace(
 '<Link href="/account/notifications"',
 '<Link href="/account/support" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><LingxiMiniIcon name="account" size="title"/><b>我的问题</b><p className="mt-2 text-sm text-[var(--lx-muted)]">查看已提交的问题、截图和处理进度</p></Link>\n            <Link href="/account/notifications"'
 );
 return s;
});
patch("app/api/support/tickets/route.ts",s=>{
 s=s.replace('select("id,kind,title,message,status,created_at,updated_at,release_version,screenshot_url,context")','select("id,kind,title,message,status,contact,created_at,updated_at,release_version,screenshot_url,context")');
 if(!s.includes("createSignedUrl"))s=s.replace('return error?NextResponse.json({error:"UNAVAILABLE"},{status:500}):NextResponse.json({items:data||[]})',
 'if(error)return NextResponse.json({error:"UNAVAILABLE"},{status:500});const items=await Promise.all((data||[]).map(async(x:any)=>{const paths=(x.context?.attachments||[]).map((z:any)=>z.path).filter(Boolean).slice(0,4),attachmentUrls:string[]=[];for(const p of paths){const q=await a.storage.from(B).createSignedUrl(p,600);if(q.data?.signedUrl)attachmentUrls.push(q.data.signedUrl)}return{...x,attachmentUrls}}));return NextResponse.json({items},{headers:{"Cache-Control":"private, no-store"}})');
 return s;
});
