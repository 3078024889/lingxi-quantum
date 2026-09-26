"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import Bi from "@/components/Bi";

export default function SwitchAccountButton(){
 const[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function switchAccount(){
  if(busy)return;setBusy(true);setError("");
  try{
   const{error}=await createClient().auth.signOut({scope:"global"});
   if(error)throw error;
   window.location.replace("/account?mode=signin&switch=1");
  }catch{
   setError("暂时无法切换账户，请重试。");
   setBusy(false);
  }
 }
 return <div>
  <button disabled={busy} onClick={()=>void switchAccount()} className="w-full border border-lattice/35 py-4 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:bg-lattice/10 disabled:opacity-50"><Bi zh={busy?"正在切换…":"切换账户"} en={busy?"Switching…":"Switch account"}/></button>
  {error&&<p role="alert" className="mt-2 text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
