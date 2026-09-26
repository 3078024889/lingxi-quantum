"use client";

import {useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {uiCopy} from "@/lib/ui-copy";

type Mode="signin"|"signup";

export default function LoginForm({afterAuthPath="/products",initialMode="signin",serverError=""}:{afterAuthPath?:string;initialMode?:Mode;serverError?:string}){
  const{lang}=useLingxiLang();
  const t=(zh:string,en?:string)=>uiCopy(lang,zh,en);
  const[mode,setMode]=useState<Mode>(initialMode);
  const[loading,setLoading]=useState(false);
  const errorText=authErrorText(serverError,t);

  return <form method="post" action="/account/auth" onSubmit={()=>setLoading(true)} className="w-full space-y-4">
    <input type="hidden" name="mode" value={mode}/>
    <input type="hidden" name="next" value={afterAuthPath}/>
    <div className="flex rounded-sm border border-white/10 p-1">
      <button type="button" onClick={()=>setMode("signin")} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signin"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>{t("登录","Sign in")}</button>
      <button type="button" onClick={()=>setMode("signup")} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signup"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>{t("注册","Sign up")}</button>
    </div>
    {mode==="signup"&&<input name="displayName" type="text" maxLength={24} minLength={2} required placeholder={t("用户名","Display name")} autoComplete="nickname" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>}
    <input name="email" type="email" required placeholder={t("邮箱","Email")} autoComplete="email" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <input name="password" type="password" minLength={8} required placeholder={mode==="signup"?t("设置密码（至少 8 位）","Set password (8+ characters)"):t("密码","Password")} autoComplete={mode==="signup"?"new-password":"current-password"} className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <button type="submit" disabled={loading} className="w-full bg-lattice py-4 font-display text-sm tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50">{loading?t("请稍候…","Please wait…"):mode==="signup"?t("注册并验证邮箱","Create account & verify email"):t("登录","Sign in")}</button>
    {errorText&&<p role="status" className="text-sm leading-6 text-rose">{errorText}</p>}
    <p className="pt-2 text-center text-xs leading-6 text-bone-soft">{mode==="signin"?t("首次使用？选择上方「注册」。","New here? Choose Sign up above."):t("注册后需要先验证邮箱，再登录账户。","Verify your email before signing in.")}</p>
  </form>;
}

function authErrorText(code:string,t:(zh:string,en?:string)=>string){
  if(!code)return "";
  if(code==="credentials")return t("邮箱或密码不正确。","Incorrect email or password.");
  if(code==="registered")return t("这个邮箱已经注册，请直接登录。","This email is already registered. Please sign in.");
  if(code==="check_email")return t("验证邮件已发送。请打开邮箱完成验证后再登录。","Verification email sent. Confirm your email, then sign in.");
  if(code==="email_unconfirmed")return t("这个邮箱还没有完成验证，请先查看验证邮件。","This email has not been verified yet.");
  if(code==="confirmation_failed")return t("这个验证链接无效或已过期，请重新注册或获取新的验证邮件。","This verification link is invalid or expired.");
  if(code==="verification_config")return t("邮箱验证正在维护中，暂时无法创建新账户。","Email verification is temporarily unavailable.");
  if(code==="email")return t("请输入有效的邮箱地址。","Enter a valid email address.");
  if(code==="password")return t("密码至少 8 位。","Password must be at least 8 characters.");
  if(code==="name")return t("用户名请输入 2–24 个字符。","Use 2–24 characters for the display name.");
  if(code==="origin")return t("页面状态已过期，请刷新后重试。","Refresh the page and try again.");
  if(code==="service")return t("账户服务暂时没有响应，请稍后再试。","Account service is temporarily unavailable.");
  return t("暂时无法继续，请稍后再试。","Unable to continue right now. Please try again.");
}
