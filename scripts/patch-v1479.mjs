import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){
  let s=read(p);
  if(s.includes(b)){console.log(`ALREADY ${n}`);return}
  if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);fail.push(n);return}
  s=s.replace(a,b);save(p,s);console.log(`PASS ${n}`);
}

// Home: shared icons and no implementation wording.
{
  const p="components/HomeProblemHub.tsx";let s=read(p);
  s=s.replace('<span className="lx-v143-icon tone-a">🧰</span>','<LingxiMiniIcon name="tools" size="card" className="lx-v143-icon"/>');
  s=s.replace('<span className="lx-v143-icon tone-b">✦</span>','<LingxiMiniIcon name="sasi" size="card" className="lx-v143-icon"/>');
  s=s.replace(
    '一个 PDF、一张图片、一段视频、一份表格，不应该为了处理它再装三个软件。能本地完成的尽量留在浏览器里，做完就拿结果。',
    '一个 PDF、一张图片、一段视频、一份表格，不需要在多个软件之间来回切换。打开对应工具，处理完成后直接拿到结果。'
  );
  s=s.replace(
    'A PDF, image, video or spreadsheet should not require three extra apps. When possible, work stays in the browser and ends with a usable result.',
    'A PDF, image, video or spreadsheet should not require jumping between multiple apps. Open the right tool, finish the task and take the result.'
  );
  save(p,s);console.log("PASS home visual + user-facing copy");
}

// SASI main entrance: effect-reference hierarchy, no copy rewrite.
{
  const p="components/SasiCommandCenter.tsx";let s=read(p);
  if(!s.includes('lx-sasi-center')){
    s=s.replace('<main className="lx11-page"><div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">','<main className="lx11-page lx-sasi-center"><div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">');
  }
  if(!s.includes('lx-sasi-hero-line')){
    s=s.replace('<section className="max-w-3xl"><p className="text-sm font-medium text-[var(--lx-faint)]">SASI · {zh?"AI 创作入口":"AI Creation"}</p>',
      '<section className="max-w-3xl lx-sasi-hero"><div className="lx-sasi-hero-line"><LingxiMiniIcon name="sasi" size="title"/><p className="text-sm font-medium text-[var(--lx-faint)]">SASI · {zh?"AI 创作入口":"AI Creation"}</p></div>');
  }
  s=s.replace('className="mt-10 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-7"',
    'className="mt-10 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-7 lx-sasi-prompt-panel"');
  s=s.replace('className="group rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 transition hover:border-[var(--lx-line-strong)]"',
    'className="group rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 transition hover:border-[var(--lx-line-strong)] lx-sasi-entry-card"');
  save(p,s);console.log("PASS SASI main visual hierarchy");
}

// Connection center: remove engineering-language UI while preserving actual connection behavior.
{
  const p="app/sasi/ConnectionCenter.tsx";let s=read(p);

  const swaps=[
    ['setMessage(t("已加密保存。下一步请执行连接验证，验证通过后才可用于生产。", "Encrypted and stored. Test the connection before using it for production."));',
     'setMessage(t("已保存。验证连接后即可在可用任务中使用。", "Saved. Verify the connection before using it in supported tasks."));'],
    ['setMessage(response.ok ? t("连接验证通过。供应商账户仍需保持余额、模型权限和地区可用性。", "Connection verified. Provider balance, model access and regional availability are still required.")',
     'setMessage(response.ok ? t("连接验证通过。实际可用范围以对应服务当前开放的模型与地区为准。", "Connection verified. Availability still depends on the models and regions currently supported by that service.")'],
    ['<div><small>OFFICIAL SETUP</small><h2>{selected.name}</h2><p>{selected.product}</p></div>',
     '<div><small>{t("连接设置","Connection setup")}</small><h2>{selected.name}</h2><p>{selected.product}</p></div>'],
    ['    <div className="sasi-connect-env"><span>{t("服务端环境变量", "Server environment variable")}</span><code>{selected.env}</code></div>\n',''],
    ['<div><h3>{t("我的加密连接", "My encrypted connection")}</h3>{connection && <span>{connection.keyHint}</span>}</div>',
     '<div><h3>{t("当前连接", "Current connection")}</h3>{connection && <span>{connection.keyHint}</span>}</div>'],
    ['placeholder={t("粘贴 API Key；不会写入浏览器或 Git", "Paste API key; never stored in browser or Git")}',
     'placeholder={t("粘贴 API Key", "Paste API key")}'],
    ['>{busy === "save" ? t("正在加密保存…", "Encrypting…") : t("加密保存凭证", "Encrypt & save")}</button>',
     '>{busy === "save" ? t("正在保存…", "Saving…") : t("保存并连接", "Save & connect")}</button>'],
    ['t("请先登录场域账户，再建立归属于你的加密连接。", "Sign in to create an encrypted connection owned by your account.")',
     't("请先登录，再连接你的 AI 服务。", "Sign in before connecting your AI service.")'],
    ['t("正在读取保险箱状态…", "Loading vault status…")',
     't("正在读取连接状态…", "Loading connection status…")'],
    ['t("保险箱当前不可用。请核对数据库迁移与服务端加密主密钥。", "The vault is unavailable. Check database migrations and the server encryption key.")',
     't("连接服务暂时不可用，请稍后重试。", "The connection service is temporarily unavailable. Please try again later.")'],
    ['<p className="sasi-connect-key-note">{t("凭证只通过登录后的表单发送到 SASI 服务端加密保险箱，不写入浏览器存储、页面日志或代码仓库。", "Credentials are sent only to the signed-in server vault, never browser storage, page logs or source control.")}</p>',
     '<p className="sasi-connect-key-note">{t("连接凭证会被安全保护，只用于你主动授权的 AI 服务连接。", "Connection credentials are protected and used only for the AI services you choose to connect.")}</p>'],
    ['<small>{t("未验证的连接不会标记为可生产", "Unverified connections stay out of production")}</small>',
     '<small>{t("未验证的连接暂不可使用", "Unverified connections cannot be used yet")}</small>'],
    ['<small>{tab === "models" ? "INTELLIGENCE PROVIDERS" : "VISUAL PRODUCTION PROVIDERS"}</small>',
     '<small>{tab === "models" ? t("文本与推理能力","Text & reasoning") : t("图像与视频能力","Image & video")}</small>'],
  ];
  for(const [a,b] of swaps){ if(s.includes(a)) s=s.replace(a,b); else if(!s.includes(b)){console.error(`MISS connection copy :: ${a.slice(0,80)}`);fail.push("connection copy")} }

  save(p,s);console.log("PASS connection center user-facing copy");
}

// Visual layer for remaining surfaces.
{
  const p="app/globals.css";let s=read(p);
  const marker="/* V14.79 remaining visual surfaces */";
  if(!s.includes(marker))s+=`

${marker}
.lx-v143-about-grid{gap:18px!important}
.lx-v143-about-grid>article{
  border-radius:22px!important;
  padding:22px!important;
  background:var(--lx-panel)!important;
  border:1px solid var(--lx-line)!important;
  box-shadow:0 8px 24px rgba(52,66,92,.045)!important;
}
.lx-v143-about-grid>article h3{font-size:18px!important;font-weight:780!important;line-height:1.4!important;margin-top:14px!important}
.lx-v143-about-grid>article p{font-size:14.5px!important;line-height:1.72!important;margin-top:8px!important}

.lx-sasi-center .lx-sasi-hero{max-width:820px!important}
.lx-sasi-hero-line{display:flex;align-items:center;gap:12px}
.lx-sasi-center .lx-sasi-hero h1{font-size:clamp(2.2rem,3.5vw,3.15rem)!important;font-weight:800!important;line-height:1.12!important;letter-spacing:-.04em!important}
.lx-sasi-center .lx-sasi-hero>p{font-size:15.5px!important;line-height:1.85!important}
.lx-sasi-prompt-panel{border-radius:22px!important;box-shadow:0 12px 30px rgba(54,68,96,.055)!important}
.lx-sasi-prompt-panel textarea{font-size:15px!important;line-height:1.75!important}
.lx-sasi-entry-card{
  min-height:190px!important;
  border-radius:20px!important;
  box-shadow:0 8px 24px rgba(54,68,96,.045)!important;
}
.lx-sasi-entry-card:hover{transform:translateY(-2px)!important;box-shadow:0 14px 30px rgba(54,68,96,.08)!important}
.lx-sasi-entry-card h3{font-size:17px!important;font-weight:780!important}
.lx-sasi-entry-card p{font-size:14px!important;line-height:1.65!important}

.sasi-connection-center{font-size:15px!important}
.sasi-connect-hero{border-radius:24px!important;box-shadow:0 10px 28px rgba(50,65,90,.05)!important}
.sasi-connect-hero h1{font-size:clamp(2rem,3vw,2.8rem)!important;font-weight:800!important;letter-spacing:-.035em!important}
.sasi-connect-hero strong{font-size:17px!important;line-height:1.55!important}
.sasi-connect-hero span{font-size:14.5px!important;line-height:1.75!important}
.sasi-connect-proof{border-radius:18px!important}
.sasi-connect-proof b{font-size:2.1rem!important}
.sasi-connect-provider-grid>article{border-radius:18px!important;padding:15px!important}
.sasi-connect-provider-main{gap:12px!important}
.sasi-connect-provider-logo{width:38px!important;height:38px!important;border-radius:11px!important}
.sasi-connect-provider-copy b{font-size:15px!important}
.sasi-connect-provider-copy small{font-size:12.5px!important}
.sasi-connect-provider-grid>article>p{font-size:13.5px!important;line-height:1.65!important}
.sasi-connect-setup{border-radius:22px!important;padding:20px!important}
.sasi-connect-setup>header h2{font-size:23px!important;font-weight:780!important}
.sasi-connect-vault{border-radius:18px!important}
.sasi-connect-vault h3{font-size:16px!important;font-weight:760!important}
.sasi-connect-key-note{font-size:13px!important;line-height:1.65!important;color:var(--lx-muted)!important}

@media(max-width:760px){
  .lx-sasi-center .lx-sasi-hero h1{font-size:2.1rem!important}
  .lx-sasi-entry-card{min-height:170px!important}
  .sasi-connect-tabs{overflow-x:auto!important;flex-wrap:nowrap!important;padding-bottom:4px!important}
  .sasi-connect-tabs button{white-space:nowrap!important}
}
`;
  save(p,s);console.log("PASS remaining visual CSS");
}

if(fail.length){console.error(`V14.79_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.79_PATCH=PASS");
