import type {Metadata} from "next";
import Link from "next/link";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {aiTools} from "@/lib/ai-discovery/catalog";
import TerminalWorkbench from "@/app/ai/terminal-workbench";
import styles from "@/app/ai/discovery.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AI 平台预览｜灵犀场",robots:{index:false,follow:false}};
export default async function AIPreview(){
 let allowed=false;
 try { allowed=Boolean(await moneyAdministrator()); } catch { /* Keep the preview closed when identity cannot be checked. */ }
 if(!allowed)return <main className={styles.page}><div className={styles.shell}><h1>请使用管理员账户查看</h1><p>登录后，从管理后台进入 AI 平台预览。</p><Link href="/account?mode=signin">前往登录</Link></div></main>;
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD</Link><Link href="/account/money-admin">返回管理后台</Link></header><TerminalWorkbench tools={aiTools}/></div></main>;
}
