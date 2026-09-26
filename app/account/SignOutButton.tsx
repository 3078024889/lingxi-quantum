"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import Bi from "@/components/Bi";

export default function SignOutButton(){
 const[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function signOut(){
  if(busy)return;setBusy(true);setError("");
  try{
   const{error}=await createClient().auth.signOut({scope:"global"});
   if(error)throw error;
   window.location.replace("/account");
  }catch{
   setError("退出没有完成，请重试。");
   setBusy(false);
  }
 }
 return <div>
  <button disabled={busy} onClick={()=>void signOut()} className="w-full border border-white/15 py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim transition hover:border-lattice/40 hover:text-lattice disabled:opacity-50"><Bi zh={busy?"正在退出…":"退出登录"} en={busy?"Signing out…":"Sign out"}/></button>
  {error&&<p role="alert" className="mt-2 text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
