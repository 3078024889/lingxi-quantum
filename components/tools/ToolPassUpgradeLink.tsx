"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
const label:Record<string,string>={
 zh:"使用全场实用工具通用包",en:"Use the all-tools pass",
 ja:"共通ツールパスで利用",ko:"전체 도구 이용권 사용",
 fr:"Utiliser le pass tous outils",de:"Alle Werkzeuge mit dem Pass nutzen",
 es:"Usar el pase de herramientas",pt:"Usar o passe de ferramentas",
 ar:"استخدام باقة جميع الأدوات"
};
export default function ToolPassUpgradeLink(){
 const {lang}=useLingxiLang();
 return <Link href="/tools/pass"
 className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--lx-line)] bg-[var(--lx-ink)] px-5 py-3 text-sm font-semibold text-[var(--lx-bg)]">
 {label[lang]||label.en}
 </Link>;
}
