"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { uiCopy } from "@/lib/ui-copy";

type Mode="signin"|"signup";

export default function LoginForm({afterAuthPath="/products"}:{afterAuthPath?:string}){
  const router=useRouter();
  const {lang}=useLingxiLang();
  const t=(zh:string,en?:string)=>uiCopy(lang,zh,en);
  const[mode,setMode]=useState<Mode>("signin");
  const[displayName,setDisplayName]=useState("");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  async function submit(){
    setError("");
    if(mode==="signup"&&(displayName.trim().length<2||displayName.trim().length>24)){setError(t("用户名请输入 2–24 个字符。","Use 2–24 characters for your display name."));return}
    if(!/^\S+@\S+\.\S+$/.test(email)){setError(t("请输入有效的邮箱地址","Enter a valid email address"));return}
    if(password.length<6){setError(t("密码至少 6 位","Password must be at least 6 characters"));return}
    setLoading(true);
    try{
      const r=await fetch("/api/auth/password",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({mode,email,password,displayName}),
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok){
        if(d.registered){setMode("signin");setError(t("注册成功，请用刚才的密码登录。","Registration succeeded. Please sign in with the password you just set."));return}
        throw new Error(translateAuth(String(d.error||"AUTH_FAILED"),lang));
      }
      router.push(afterAuthPath);
      router.refresh();
    }catch(e){
      setError(t("登录失败：","Sign-in failed: ")+(e instanceof Error?e.message:String(e)));
    }finally{setLoading(false)}
  }

  return <div className="w-full space-y-4">
    <div className="flex rounded-sm border border-white/10 p-1">
      <button onClick={()=>{setMode("signin");setError("")}} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signin"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>{t("登录","Sign in")}</button>
      <button onClick={()=>{setMode("signup");setError("")}} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signup"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>{t("注册","Sign up")}</button>
    </div>
    {mode==="signup"&&<input type="text" value={displayName} maxLength={24} onChange={e=>setDisplayName(e.target.value)} placeholder={t("用户名","Display name")} autoComplete="nickname" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>}
    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("邮箱","Email")} autoComplete="email" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void submit()} placeholder={mode==="signup"?t("设置密码（至少 6 位）","Set password (6+ characters)"):t("密码","Password")} autoComplete={mode==="signup"?"new-password":"current-password"} className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <button onClick={()=>void submit()} disabled={loading} className="w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50">{loading?t("处理中…","Working…"):mode==="signup"?t("注册并进入","Create account & enter"):t("登录","Sign in")}</button>
    {error&&<p className="text-sm text-rose">{error}</p>}
    <p className="pt-2 text-center text-xs leading-6 text-bone-soft">{mode==="signin"?t("首次使用？点上方「注册」创建账户。","First time here? Choose Sign up above."):t("已有账户？点上方「登录」。","Already have an account? Choose Sign in above.")}</p>
  </div>
}

function translateAuth(msg:string,lang:import("@/lib/lingxi-i18n").LingxiLang){
  const pick=(zh:string,en:string)=>uiCopy(lang,zh,en);
  if(msg.includes("Invalid login credentials"))return pick("邮箱或密码不正确","incorrect email or password");
  if(msg.includes("already registered")||msg.includes("User already registered"))return pick("该邮箱已注册，请直接登录","this email is already registered — please sign in");
  if(msg.includes("Password should be"))return pick("密码强度不足，请用更长的密码","password too weak — please use a longer one");
  if(msg.includes("Failed to fetch")||msg.includes("fetch failed"))return pick("认证服务网络连接失败，请稍后重试","authentication network connection failed; please try again");
  return msg;
}
