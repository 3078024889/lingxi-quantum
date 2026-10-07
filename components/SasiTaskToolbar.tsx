"use client";
import {createContext,useContext,type ReactNode} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {SasiEntryMode} from "./SasiUnifiedLauncher";
type Row=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Row=>({zh,en,ja,ko,fr,de,es,pt,ar});
const HEADING=L("直接告诉 SASI 你要完成什么","Tell SASI what you want to accomplish","SASIにやりたいことをそのまま伝えてください","SASI에게 원하는 결과를 바로 말해 주세요","Dites directement à SASI ce que vous voulez accomplir","Sag SASI direkt, was du erreichen möchtest","Dile directamente a SASI qué quieres conseguir","Diga diretamente ao SASI o que quer realizar","أخبر SASI مباشرة بما تريد إنجازه");
const Context=createContext<{current:SasiEntryMode|null;select:(mode:SasiEntryMode)=>void}|null>(null);
export function SasiTaskNavigation({current,onSelect,children}:{current:SasiEntryMode|null;onSelect:(mode:SasiEntryMode)=>void;children:ReactNode}){return <Context.Provider value={{current,select:onSelect}}>{children}</Context.Provider>}
export function SasiWelcomeHeading(){const {lang}=useLingxiLang();return <h1 className="mb-7 text-center text-2xl font-semibold sm:text-3xl">{HEADING[lang]}</h1>}
export default function SasiTaskToolbar(_props:{current?:SasiEntryMode|null;onSelect?:(mode:SasiEntryMode)=>void;disabled?:boolean}){useContext(Context);return null}
