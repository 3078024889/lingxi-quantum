"use client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
export default function BookSasiBalanceBar(){
 const{lang}=useLingxiLang();const zh=lang==="zh";
 return <section className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-5">
  <p className="text-sm font-semibold text-[var(--lx-ink)]">{zh?"资料问答当前可直接使用":"Source Q&A is currently available directly"}</p>
  <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"当前书本、学习与科研资料问答不会扣除创作余额。以后如启用付费能力，会在执行前明确显示本次价格并由你确认。":"Book, learning and research source Q&A currently does not deduct creation balance. If paid capabilities are enabled later, the exact price will be shown before execution for confirmation."}</p>
 </section>;
}
