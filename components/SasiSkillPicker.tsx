"use client";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{sasiSkillUi}from"@/lib/sasi/skills/ui";
import type{SasiMode,SasiSkillId}from"@/lib/sasi/skills/types";
const HEAD={zh:"选择能力",en:"Choose capabilities",ja:"機能を選択",ko:"기능 선택",fr:"Choisir les capacités",de:"Funktionen wählen",es:"Elegir capacidades",pt:"Escolher capacidades",ar:"اختر القدرات"}as const;
export default function SasiSkillPicker({mode,selected,onChange,compact=false}:{mode:SasiMode;selected:SasiSkillId[];onChange:(ids:SasiSkillId[])=>void;compact?:boolean}){
 const{lang}=useLingxiLang();const rows=sasiSkillUi(mode,lang);if(!rows.length)return null;
 return <div className={compact?"":"mt-2 border-t border-[var(--lx-line)] pt-2"}>
  <div className="px-3 pb-2 pt-1 text-xs text-[var(--lx-muted)]">{HEAD[lang]??HEAD.en}</div>
  {rows.map(row=><label key={row.id} className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--lx-soft)]">
   <input type="checkbox" className="mt-0.5 h-4 w-4 accent-violet-600" checked={selected.includes(row.id)} onChange={()=>onChange(selected.includes(row.id)?selected.filter(x=>x!==row.id):[...selected,row.id].slice(0,8))}/>
   <span className="text-sm">{row.label}<span className="mt-0.5 block text-xs leading-5 text-[var(--lx-muted)]">{row.description}</span></span>
  </label>)}
 </div>;
}
