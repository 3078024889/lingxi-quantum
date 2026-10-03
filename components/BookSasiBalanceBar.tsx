"use client";

import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

export default function BookSasiBalanceBar(){
 const{lang}=useLingxiLang();
 const zh=lang==="zh";
 return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
     <div>
       <b className="text-sm text-[var(--lx-ink)]">{zh?"余额":"Balance"}</b>
       <p className="mt-1 text-sm text-[var(--lx-muted)]">{zh?"一个余额，全部 SASI 共用。":"One balance across every SASI."}</p>
     </div>
     <Link href="/sasi/pricing" className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2 text-sm">{zh?"充值":"Top up"}</Link>
   </div>
 </div>;
}
