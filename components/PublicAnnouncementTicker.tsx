"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {publicNoticeItems} from "@/lib/release/public-announcements";
import styles from "./PublicAnnouncementTicker.module.css";

export default function PublicAnnouncementTicker(){
  const {lang}=useLingxiLang();
  const items=publicNoticeItems(lang).slice(0,3);
  if(!items.length)return null;
  return <div className={styles.ticker} role="region" aria-label={lang==="zh"?"灵犀场最新公告":"LINGXIFIELD latest notices"}>
    <span className={styles.label}>{lang==="zh"?"公告":"NEWS"}</span>
    <div className={styles.viewport}>
      <div className={styles.track}>
        {items.map(item=><Link className={styles.item} key={item.id} href="/account/notifications">{item.title}</Link>)}
        <div className={styles.repeat} aria-hidden="true">
          {items.map(item=><span className={styles.item} key={item.id}>{item.title}</span>)}
        </div>
      </div>
    </div>
    <Link href="/account/notifications" className={styles.more}>{lang==="zh"?"全部公告":"All updates"} →</Link>
  </div>;
}
