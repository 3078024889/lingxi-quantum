"use client";
import{useEffect,useState}from"react";import{useLingxiLang}from"@/lib/lingxi-i18n";import{uiCopy}from"@/lib/ui-copy";
type Mode="signin"|"signup"|"verify";
export default function LoginForm({afterAuthPath="/products",initialMode="signin",serverError="",initialEmail=""}:{afterAuthPath?:string;initialMode?:Mode;serverError?:string;initialEmail?:string}){
 const{lang}=useLingxiLang(),t=(zh:string,en?:string)=>uiCopy(lang,zh,en);
 const[mode,setMode]=useState<Mode>(initialMode),[loading,setLoading]=useState(false),[cooldown,setCooldown]=useState(0);
 useEffect(()=>{if(cooldown<=0)return;const x=setInterval(()=>setCooldown(v=>Math.max(0,v-1)),1000);return()=>clearInterval(x)},[cooldown]);
 const errorText=authErrorText(serverError,t);
 if(mode==="verify")return <form method="post" action="/account/auth" onSubmit={()=>setLoading(true)} className="w-full space-y-4">
  <input type="hidden" name="mode" value="verify"/><input type="hidden" name="next" value={afterAuthPath}/>
  <div className="rounded-xl bg-[var(--lx-soft)] px-4 py-4 text-left"><b className="text-sm">{t("输入邮箱验证码","Enter email code")}</b><p className="mt-1 text-xs leading-5 text-[var(--lx-muted)]">{t("验证码已发送到你的邮箱。请输入最新邮件中的验证码完成注册。","We sent a code to your email. Enter the code from the latest email to finish creating your account.")}</p></div>
  <input name="email" type="email" required defaultValue={initialEmail} placeholder={t("邮箱","Email")} autoComplete="email" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none"/>
  <input name="token" inputMode="numeric" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required autoFocus placeholder={t("邮箱验证码","Email verification code")} autoComplete="one-time-code" onInput={e=>{const el=e.currentTarget;el.value=el.value.replace(/\D/g,"").slice(0,10)}} className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-center font-mono text-xl tracking-[.25em] text-bone outline-none"/>
  <button type="submit" disabled={loading} className="w-full bg-lattice py-4 font-display text-sm tracking-widest2 text-void-deep disabled:opacity-50">{loading?t("正在验证…","Verifying…"):t("验证并进入灵犀场","Verify & continue")}</button>
  {errorText&&<p role="status" className="text-sm leading-6 text-rose">{errorText}</p>}
  <button type="button" onClick={()=>setMode("signup")} className="text-xs text-bone-soft">{t("重新获取验证码","Request a new code")}</button>
 </form>;
 return <form method="post" action="/account/auth" onSubmit={()=>setLoading(true)} className="w-full space-y-4">
  <input type="hidden" name="mode" value={mode}/><input type="hidden" name="next" value={afterAuthPath}/>
  <div className="flex rounded-sm border border-white/10 p-1"><button type="button" onClick={()=>setMode("signin")} className={`flex-1 rounded-sm py-2.5 text-sm ${mode==="signin"?"bg-lattice/15 text-lattice":"text-bone-dim"}`}>{t("登录","Sign in")}</button><button type="button" onClick={()=>setMode("signup")} className={`flex-1 rounded-sm py-2.5 text-sm ${mode==="signup"?"bg-lattice/15 text-lattice":"text-bone-dim"}`}>{t("注册","Sign up")}</button></div>
  {mode==="signup"&&<input name="displayName" type="text" maxLength={24} minLength={2} required placeholder={t("用户名","Display name")} autoComplete="nickname" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none"/>}
  <input name="email" type="email" required defaultValue={initialEmail} placeholder={t("邮箱","Email")} autoComplete="email" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none"/>
  <input name="password" type="password" minLength={8} required placeholder={mode==="signup"?t("设置密码（至少 8 位）","Set password (8+ characters)"):t("密码","Password")} autoComplete={mode==="signup"?"new-password":"current-password"} className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none"/>
  <button type="submit" disabled={loading} className="w-full bg-lattice py-4 text-sm text-void-deep disabled:opacity-50">{loading?t("请稍候…","Please wait…"):mode==="signup"?t("获取邮箱验证码","Send verification code"):t("登录","Sign in")}</button>
  {errorText&&<p role="status" className="text-sm leading-6 text-rose">{errorText}</p>}
  <p className="pt-2 text-center text-xs leading-6 text-bone-soft">{mode==="signup"?t("注册后直接在这里输入邮箱验证码。","Enter the email code here after signing up."):t("首次使用？选择上方「注册」。","New here? Choose Sign up above.")}</p>
 </form>
}
function authErrorText(code:string,t:(zh:string,en?:string)=>string){
 if(!code)return"";
 if(code==="credentials")return t("邮箱或密码不正确。","Incorrect email or password.");
 if(code==="registered")return t("这个邮箱已经注册，请直接登录。","This email is already registered. Please sign in.");
 if(code==="code_sent")return t("验证码已发送，请查看邮箱。","Verification code sent. Check your inbox.");
 if(code==="code_expired")return t("这个验证码已经失效，请重新获取最新验证码。","This code has expired. Request the latest code.");
 if(code==="code_invalid")return t("验证码不正确，请输入最新邮件中的验证码。","Incorrect code. Enter the code from the latest email.");
 if(code==="email_unconfirmed")return t("这个邮箱还没有完成验证，请重新注册获取验证码。","This email is not verified. Sign up again to request a code.");
 if(code==="email_delivery")return t("验证码暂时没有发送成功，请稍后再试。","We couldn't send the code right now. Please try again.");
 if(code==="email")return t("请输入有效的邮箱地址。","Enter a valid email address.");
 if(code==="password")return t("密码至少 8 位。","Password must be at least 8 characters.");
 if(code==="name")return t("用户名请输入 2–24 个字符。","Use 2–24 characters for the display name.");
 if(code==="origin")return t("页面状态已过期，请刷新后重试。","Refresh the page and try again.");
 return t("账户服务暂时没有响应，请稍后再试。","Account service is temporarily unavailable.");
}
