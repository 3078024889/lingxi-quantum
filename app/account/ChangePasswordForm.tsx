"use client";
import { useState } from "react";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { uiCopy } from "@/lib/ui-copy";

export default function ChangePasswordForm(){
 const {lang}=useLingxiLang();
 const t=(zh:string,en?:string)=>uiCopy(lang,zh,en);
 const [open,setOpen]=useState(false),[a,setA]=useState(""),[b,setB]=useState(""),[status,setStatus]=useState<"idle"|"saving"|"saved">("idle"),[error,setError]=useState("");
 async function save(){
  setError("");
  if(a.length<6){setError(t("新密码至少需要6位。","New password must be at least 6 characters."));return}
  if(a!==b){setError(t("两次输入的新密码不一致。","The two new passwords do not match."));return}
  setStatus("saving");
  try{
   const{error}=await createClient().auth.updateUser({password:a});
   if(error){setError(error.message||t("修改失败，请稍后再试。","Update failed. Please try again."));setStatus("idle");return}
   setA("");setB("");setStatus("saved");
  }catch{setError(t("修改失败，请稍后再试。","Update failed. Please try again."));setStatus("idle")}
 }
 if(!open)return <button onClick={()=>setOpen(true)} className="w-full py-3 text-center text-xs text-bone-soft underline underline-offset-2"><Bi zh="修改密码" en="Change Password"/></button>;
 return <div className="w-full rounded-sm border border-white/10 p-5">
  <p className="text-sm text-bone-dim"><Bi zh="修改密码" en="Change Password"/></p>
  {status==="saved"&&<p className="mt-3 text-sm text-lattice"><Bi zh="密码已更新。" en="Password updated."/></p>}
  <input type="password" value={a} onChange={e=>setA(e.target.value)} placeholder={t("新密码（至少6位）","New password (min. 6 characters)")} className="mt-3 w-full rounded-sm border border-white/15 bg-void px-4 py-3"/>
  <input type="password" value={b} onChange={e=>setB(e.target.value)} placeholder={t("再次输入新密码","Enter new password again")} className="mt-3 w-full rounded-sm border border-white/15 bg-void px-4 py-3"/>
  {error&&<p className="mt-2 text-xs text-rose">{error}</p>}
  <div className="mt-3 flex gap-3"><button onClick={save} disabled={status==="saving"} className="flex-1 border border-lattice/40 py-2.5 text-xs text-lattice">{status==="saving"?<Bi zh="保存中…" en="Saving…"/>:<Bi zh="保存" en="Save"/>}</button><button onClick={()=>{setOpen(false);setError("");setStatus("idle")}} className="flex-1 border border-white/15 py-2.5 text-xs text-bone-dim"><Bi zh="取消" en="Cancel"/></button></div>
 </div>
}
