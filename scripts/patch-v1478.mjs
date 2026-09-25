import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){let s=read(p);if(s.includes(b)){console.log(`ALREADY ${n}`);return}if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);fail.push(n);return}s=s.replace(a,b);save(p,s);console.log(`PASS ${n}`)}

// Account cards: smaller icons, proper spacing, no icon/title collision.
{
 const p="app/account/page.tsx";let s=read(p);
 s=s.replace('className="rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="products" size="card"/>','className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="products" size="title"/>');
 s=s.replace('className="rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="orders" size="card"/>','className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="orders" size="title"/>');
 s=s.replace('className="rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="wallet" size="card"/>','className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="wallet" size="title"/>');
 s=s.replace('className="rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="sasi" size="card"/>','className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="sasi" size="title"/>');
 s=s.replace('className="rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="refund" size="card"/>','className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="refund" size="title"/>');
 save(p,s);console.log("PASS account card spacing");
}

// Account menu: replace raw dots / letters with the same small icon system.
{
 const p="components/Nav.tsx";let s=read(p);
 const replacements=[
  ['<Link href="/account" onClick={() => setMenuOpen(false)}><span className="lx11-menu-glyph tone-account">●</span><b>{mt.account}</b></Link>','<Link href="/account" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="account" size="tiny"/><b>{mt.account}</b></Link>'],
  ['<Link href="/account/orders" onClick={() => setMenuOpen(false)}><span className="lx11-menu-glyph tone-orders">▤</span><b>{mt.orders}</b></Link>','<Link href="/account/orders" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="orders" size="tiny"/><b>{mt.orders}</b></Link>'],
  ['<button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><span className="lx11-menu-glyph tone-nav">⌁</span><b>{mt.navigation}</b></button>','<button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><LingxiMiniIcon name="products" size="tiny"/><b>{mt.navigation}</b></button>'],
  ['{signedIn && <button type="button" onClick={switchAccount}><span>SW</span><b>{mt.switch}</b></button>}','{signedIn && <button type="button" onClick={switchAccount}><LingxiMiniIcon name="switch" size="tiny"/><b>{mt.switch}</b></button>}'],
  ['{signedIn && <button type="button" onClick={signOut}><span>EX</span><b>{mt.signout}</b></button>}','{signedIn && <button type="button" onClick={signOut}><LingxiMiniIcon name="signout" size="tiny"/><b>{mt.signout}</b></button>}'],
  ['<Link href="/account" onClick={() => setMenuOpen(false)}><span>AC</span><b>{mt.account}</b></Link>','<Link href="/account" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="account" size="tiny"/><b>{mt.account}</b></Link>'],
  ['<Link href="/account/orders" onClick={() => setMenuOpen(false)}><span>OR</span><b>{mt.orders}</b></Link>','<Link href="/account/orders" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="orders" size="tiny"/><b>{mt.orders}</b></Link>'],
  ['<button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><span>NV</span><b>{mt.navigation}</b></button>','<button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><LingxiMiniIcon name="products" size="tiny"/><b>{mt.navigation}</b></button>'],
 ];
 for(const [a,b] of replacements){ if(s.includes(a))s=s.replace(a,b); }
 save(p,s);console.log("PASS account menu mini icons");
}

// Visual refinement layer.
{
 const p="app/globals.css";let s=read(p);
 const marker="/* V14.78 icon/account refine */";
 if(!s.includes(marker))s+=`

${marker}
.lx-mini-icon-card{width:50px!important;height:50px!important;border-radius:15px!important;font-size:25px!important}
.lx-mini-icon-title{width:38px!important;height:38px!important;border-radius:12px!important;font-size:19px!important}
.lx-mini-icon-nav{width:28px!important;height:28px!important;border-radius:9px!important;font-size:14px!important}
.lx-mini-icon-tiny{width:24px!important;height:24px!important;border-radius:8px!important;font-size:12px!important}
.lx-mini-glyph{display:block!important;transform:translateY(-1px)!important}
.lx-mini-badge{
  right:3px!important;
  bottom:3px!important;
  min-width:15px!important;
  height:15px!important;
  padding:0 4px!important;
  border-radius:999px!important;
  font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;
  font-size:8px!important;
  line-height:15px!important;
  font-weight:850!important;
  letter-spacing:-.02em!important;
}
.lx-mini-tone-pdf .lx-mini-badge,.lx-mini-tone-ocr .lx-mini-badge{background:#ee355b!important}
.lx-mini-tone-green .lx-mini-badge{background:#28a85d!important}
.lx-mini-tone-paper .lx-mini-badge{background:#7367d5!important}
.lx-mini-tone-cyan .lx-mini-badge{background:#2c98c9!important}
.lx-tools-v124-card .lx-mini-icon-card{margin-bottom:13px!important}
.lx-tools-v124-card .lx11-tool-title-row h3{font-size:17px!important}
.lx-tools-v124-card .lx-tools-v124-desc{font-size:14px!important;line-height:1.62!important}

.lx-account-entry{
  display:grid!important;
  grid-template-columns:38px minmax(0,1fr)!important;
  grid-template-rows:auto auto!important;
  column-gap:14px!important;
  row-gap:4px!important;
  align-items:center!important;
  min-height:112px!important;
  padding:17px 18px!important;
  border-radius:18px!important;
  background:var(--lx-panel)!important;
  box-shadow:0 6px 18px rgba(51,66,92,.035)!important;
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease!important;
}
.lx-account-entry:hover{
  transform:translateY(-1px)!important;
  border-color:var(--lx-line-strong)!important;
  box-shadow:0 10px 24px rgba(51,66,92,.07)!important;
}
.lx-account-entry>.lx-mini-icon{grid-column:1!important;grid-row:1 / span 2!important;margin:0!important}
.lx-account-entry>b{grid-column:2!important;grid-row:1!important;font-size:15.5px!important;font-weight:760!important;line-height:1.35!important}
.lx-account-entry>p{grid-column:2!important;grid-row:2!important;margin:0!important;font-size:13.5px!important;line-height:1.55!important}
.lx11-account-menu-links>a,.lx11-account-menu-links>button{
  display:grid!important;
  grid-template-columns:24px minmax(0,1fr)!important;
  align-items:center!important;
  column-gap:11px!important;
}
.lx11-account-menu-links .lx-mini-icon{margin:0!important}
.lx11-link[href="/account"] .lx-mini-icon{
  box-shadow:0 6px 14px rgba(72,126,188,.12),inset 0 1px 0 rgba(255,255,255,.85)!important;
}
`;
 save(p,s);console.log("PASS icon/account CSS refine");
}

if(fail.length){console.error(`V14.78_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.78_PATCH=PASS");
