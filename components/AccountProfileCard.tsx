"use client";
import {useMemo,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {accountText} from "@/lib/account-experience-i18n";
export default function AccountProfileCard({email,initialName}:{email:string;initialName:string}){
 const{lang}=useLingxiLang();const t=(k:string)=>accountText(lang,k);const[name,setName]=useState(initialName),[saved,setSaved]=useState(initialName),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const initials=useMemo(()=>{const s=(saved||email.split("@")[0]||"L").trim();return Array.from(s).slice(0,2).join("").toUpperCase()},[saved,email]);
 async function save(){const n=name.trim();if(n.length<2||n.length>24){setMsg(t("nameInvalid"));return}setBusy(true);setMsg("");try{const supabase=createClient();const{error}=await supabase.auth.updateUser({data:{display_name:n}});if(error)throw error;setSaved(n);setName(n);setMsg(t("saved"));window.dispatchEvent(new CustomEvent("lingxi:profile",{detail:{display_name:n}}));}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <section className="lx-account-profile"><div className="lx-account-avatar" aria-hidden="true"><span>✦</span><b>{initials}</b></div><div className="lx-account-profile-copy"><small>{t("profile")}</small><h2>{saved}</h2><p>{email}</p><div className="lx-account-name-edit"><input value={name} onChange={e=>setName(e.target.value)} maxLength={24} aria-label={t("displayName")}/><button onClick={save} disabled={busy||name.trim()===saved}>{busy?t("saving"):t("save")}</button></div><em>{t("displayNameHint")}</em>{msg&&<strong>{msg}</strong>}</div></section>
}
