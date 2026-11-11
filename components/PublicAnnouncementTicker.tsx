"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {publicNoticeItems} from "@/lib/release/public-announcements";
import styles from "./PublicAnnouncementTicker.module.css";

export default function PublicAnnouncementTicker(){
  const {lang}=useLingxiLang();
  const [remote,setRemote]=useState<Array<{id:string;titleZh:string;titleEn:string;href:string}>|null>(null);
  useEffect(()=>{
    let alive=true;
    fetch("/api/site-announcements",{cache:"no-store"})
      .then(async response=>response.ok?response.json():null)
      .then(value=>{
        if(!alive||!Array.isArray(value?.items))return;
        const clean=value.items.filter((item:unknown)=>Boolean(item&&typeof item==="object"&&typeof (item as {titleZh?:unknown}).titleZh==="string"));
        setRemote(clean.slice(0,5));
      }).catch(()=>{});
    return()=>{alive=false};
  },[]);
  const items=(remote?.length?remote.map(item=>({id:item.id,title:lang==="zh"?item.titleZh:item.titleEn||item.titleZh})):publicNoticeItems(lang).slice(0,3));
  if(!items.length)return null;
  return <div className={styles.ticker} role="region" aria-label={lang==="zh"?"灵犀场最新公告":"LINGXIFIELD latest notices"}>
    <span className={styles.label}>{lang==="zh"?"公告":"NEWS"}</span>
    <div className={styles.viewport}>
      <div className={styles.track}>
        {items.map(item=><Link className={styles.item} key={item.id} href="/announcements">{item.title}</Link>)}
        <div className={styles.repeat} aria-hidden="true">
          {items.map(item=><span className={styles.item} key={item.id}>{item.title}</span>)}
        </div>
      </div>
    </div>
    <Link href="/ai-wallet" className={styles.recharge}>{lang==="zh"?"余额 · 充值":"Balance / Top up"}</Link>
    <Link href="/announcements" className={styles.more}>{lang==="zh"?"全部公告":"All updates"} →</Link>
  </div>;
}
