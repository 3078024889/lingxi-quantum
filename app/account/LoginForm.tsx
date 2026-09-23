"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { uiCopy } from "@/lib/ui-copy";

type Mode = "signin" | "signup";

export default function LoginForm({ afterAuthPath = "/live-as" }: { afterAuthPath?: string }) {
  const router = useRouter();
  const { lang } = useLingxiLang();
  const t = (zh:string,en?:string) => uiCopy(lang,zh,en);
  const [mode,setMode]=useState<Mode>("signin");
  const [displayName,setDisplayName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit=async()=>{
    setError("");
    if(mode==="signup"&&(displayName.trim().length<2||displayName.trim().length>24)){setError(t("用户名请输入 2–24 个字符。","Use 2–24 characters for your display name."));return}
    if(!/^\S+@\S+\.\S+$/.test(email)){setError(t("请输入有效的邮箱地址"));return}
    if(password.length<6){setError(t("密码至少 6 位"));return}
    setLoading(true);
    let supabase;
    try{supabase=createClient()}
    catch{setLoading(false);setError(t("场域登录配置正在同步，请稍后再试"));return}

    if(mode==="signup"){
      const{error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName.trim()}}});
      setLoading(false);
      if(error){setError(t("注册失败：")+translateAuth(error.message,lang));return}
      const{error:signInErr}=await supabase.auth.signInWithPassword({email,password});
      if(signInErr){setError(t("注册成功，请用刚才的密码登录。"));setMode("signin");return}
      router.push(afterAuthPath);router.refresh();
    }else{
      const{error}=await supabase.auth.signInWithPassword({email,password});
      setLoading(false);
      if(error){setError(t("登录失败：")+translateAuth(error.message,lang));return}
      router.push(afterAuthPath);router.refresh();
    }
  };

  return <div className="w-full space-y-4">
    <div className="flex rounded-sm border border-white/10 p-1">
      <button onClick={()=>{setMode("signin");setError("")}} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signin"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>
        {t("登录")}
      </button>
      <button onClick={()=>{setMode("signup");setError("")}} className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode==="signup"?"bg-lattice/15 text-lattice":"text-bone-dim hover:text-lattice"}`}>
        {t("注册")}
      </button>
    </div>

    {mode==="signup"&&<input type="text" value={displayName} maxLength={24} onChange={e=>setDisplayName(e.target.value)} placeholder={t("用户名","Display name")} autoComplete="nickname" className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>}
    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("邮箱")} autoComplete="email"
      className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
      placeholder={mode==="signup"?t("设置密码（至少 6 位）"):t("密码")} autoComplete={mode==="signup"?"new-password":"current-password"}
      className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"/>

    <button onClick={submit} disabled={loading}
      className="w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50">
      {loading?t("处理中…"):mode==="signup"?t("注册并进入场域"):t("进入场域")}
    </button>

    {error&&<p className="text-sm text-rose">{error}</p>}
    <p className="pt-2 text-center text-xs leading-6 text-bone-soft">
      {mode==="signin"?t("首次使用？点上方「注册」创建你的场域账户。"):t("已有账户？点上方「登录」。请牢记你的密码。")}
    </p>
  </div>;
}

function translateAuth(msg:string,lang:import("@/lib/lingxi-i18n").LingxiLang){
  const pick=(zh:string,en:string)=>uiCopy(lang,zh,en);
  if(msg.includes("Invalid login credentials"))return pick("邮箱或密码不正确","incorrect email or password");
  if(msg.includes("already registered")||msg.includes("User already registered"))return pick("该邮箱已注册，请直接登录","this email is already registered — please sign in");
  if(msg.includes("Password should be"))return pick("密码强度不足，请用更长的密码","password too weak — please use a longer one");
  return msg;
}
