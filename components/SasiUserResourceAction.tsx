"use client";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {connectUserResource,disconnectUserResource,userResourceState,type UserResourceState} from "@/lib/sasi/browser/user-resource-text";
import {SASI_USER_RESOURCE_COPY} from "@/lib/sasi/browser/user-resource-ui-copy";

export default function SasiUserResourceAction(){
 const{lang}=useLingxiLang(),copy=SASI_USER_RESOURCE_COPY[lang];
 const[state,setState]=useState<UserResourceState>("off"),[busy,setBusy]=useState(false);
 useEffect(()=>{let live=true;void userResourceState().then(v=>{if(live)setState(v)});return()=>{live=false}},[]);
 if(state==="unavailable")return <div className="px-1 py-1 text-sm"><div className="font-medium">{copy.title}</div><div className="mt-1 text-xs text-[var(--lx-muted)]">{copy.unavailable}</div></div>;
 return <div data-sasi-user-resource className="px-1 py-1 text-sm">
  <div className="font-medium">{copy.title}</div>
  <div className="mt-1 text-xs leading-5 text-[var(--lx-muted)]">{copy.lead}</div>
  {state==="connected"?<div className="mt-2 flex items-center gap-2"><span className="text-xs">{copy.connected}</span><button type="button" className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs hover:bg-[var(--lx-soft)]" onClick={()=>{disconnectUserResource();setState("off")}}>{copy.disconnect}</button></div>:
  <button type="button" disabled={busy} className="mt-2 rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs hover:bg-[var(--lx-soft)] disabled:opacity-50" onClick={async()=>{setBusy(true);const next=await connectUserResource();setState(next);setBusy(false)}}>{busy?"…":copy.connect}</button>}
 </div>;
}
