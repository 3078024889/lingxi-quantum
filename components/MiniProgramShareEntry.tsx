"use client";

import {useState} from "react";
import Link from "next/link";
import {openMiniShare,publicMiniSharePath} from "@/lib/mini/share-client";
import {isMiniProgramContext} from "@/lib/mini/payment-client";
import styles from "./MiniProgramShareEntry.module.css";

const PUBLIC_ROUTE=/^\/(?:tools(?:\/[a-z0-9-]+)?|siai|sasi|ai-knowledge|ai-learning|ai-research)\/?$/;
export default function MiniProgramShareEntry(){
 const [message,setMessage]=useState("");
 const [working,setWorking]=useState(false);
 if(typeof window==="undefined")return null;
 if(new URLSearchParams(window.location.search).get("mini")!=="1"||!isMiniProgramContext())return null;
 const route=window.location.pathname;
 if(!PUBLIC_ROUTE.test(route)||publicMiniSharePath(window.location.href)==="/")return null;
 const lang=(document.documentElement.lang||"").toLowerCase();
 const cn=lang==="zh"||lang.startsWith("zh-");
 const params=new URLSearchParams(window.location.search);
 const currency=params.get("currency")==="USD"?"USD":"CNY";
 const isRanking=route==="/siai";
 const landing=(isRanking?"/tools":"/siai")+"?mini=1&ads=0&currency="+currency;
 async function openShare(){
  if(working)return;
  setWorking(true);setMessage("");
  const title=document.querySelector("h1")?.textContent?.trim()||"灵犀场 LINGXIFIELD";
  const ok=await openMiniShare(title);
  if(!ok)setMessage(cn?"暂时未能打开分享页，可通过右上角菜单重新尝试。":"Unable to open the share page. Try again from the mini-program menu.");
  setWorking(false);
 }
 return <div className={styles.entry} data-testid="mini-native-share-entry">
  <Link href={landing} className={styles.nav} data-testid="mini-siai-quick-link">
    {isRanking?(cn?"返回实用工具":"Back to tools"):(cn?"全球 SIAI 排行榜":"Global SIAI rankings")}
  </Link>
  <button type="button" onClick={openShare} disabled={working}
    aria-label={cn?"打开小程序分享页":"Open mini-program sharing"}
    className={styles.button}>{working?(cn?"正在打开…":"Opening…"):(cn?"分享":"Share")}</button>
  {message?<p role="status" className={styles.status}>{message}</p>:null}
 </div>;
}
