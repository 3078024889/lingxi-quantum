"use client";

import { useState } from "react";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { uiCopy } from "@/lib/ui-copy";

type Mode="signin"|"signup";

export default function LoginForm({
  afterAuthPath="/products",
  initialMode="signin",
  serverError=""
}:{
  afterAuthPath?:string;
  initialMode?:Mode;
  serverError?:string;
}){
  const {lang}=useLingxiLang();
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
    <input name="password" type="password" minLength={6} required placeholder={mode==="signup"?t("设置密码（至少 6 位）","Set password (6+ characters)"):t("密码","Password")} autoComplete={mode==="signup"?"new-password":"current-password"} className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <button type="submit" disabled={loading} className="w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50">{loading?t("正在进入…","Signing in…"):mode==="signup"?t("注册并进入","Create account & enter"):t("进入灵犀场","Enter LINGXIFIELD")}</button>
    {errorText&&<p className="text-sm text-rose">{errorText}</p>}
    <p className="pt-2 text-center text-xs leading-6 text-bone-soft">{mode==="signin"?t("首次使用？点上方「注册」创建账户。","First time here? Choose Sign up above."):t("已有账户？点上方「登录」。","Already have an account? Choose Sign in above.")}</p>
  </form>;
}

function authErrorText(code:string,t:(zh:string,en?:string)=>string){
  if(!code)return "";
  if(code==="credentials")return t("邮箱或密码不正确。","Incorrect email or password.");
  if(code==="registered")return t("这个邮箱已经注册，请直接登录。","This email is already registered. Please sign in.");
  if(code==="registered_signin")return t("注册已完成，请登录一次。","Registration is complete. Please sign in.");
  if(code==="email")return t("请输入有效的邮箱地址。","Enter a valid email address.");
  if(code==="password")return t("密码至少 6 位。","Password must be at least 6 characters.");
  if(code==="name")return t("用户名请输入 2–24 个字符。","Use 2–24 characters for the display name.");
  if(code==="origin")return t("登录请求来源异常，请刷新页面后重试。","Please refresh the page and try again.");
  if(code==="service")return t("登录服务暂时没有响应，请稍后再试。","The sign-in service is temporarily unavailable.");
  return t("暂时无法登录，请稍后再试。","Unable to sign in right now. Please try again.");
}
