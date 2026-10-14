"use client";
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {createContext,useContext,type ReactNode} from 'react';
import type {LingxiLang} from '@/lib/lingxi-i18n';
import {extraToolCopy} from '@/lib/tools/ui-copy-v86';
import {toolRuntimeText} from '@/lib/tool-runtime-i18n';
const Locale=createContext<LingxiLang|null>(null);
function copy(lang:LingxiLang,text:string){return extraToolCopy(lang,text)??toolRuntimeText(lang,text,text);}
function ConnectedProvider({children}:{children:ReactNode}){const {lang}=useLingxiLang();return <Locale.Provider value={lang}>{children}</Locale.Provider>;}
export function ToolUiLocaleProvider({lang,children}:{lang?:LingxiLang;children:ReactNode}){return lang?<Locale.Provider value={lang}>{children}</Locale.Provider>:<ConnectedProvider>{children}</ConnectedProvider>;}
function StandaloneText({text}:{text:string}){const {lang}=useLingxiLang();return copy(lang,text);}
/** Text-only React rendering: never changes DOM nodes or user input/output. */
export default function ToolUiText({text}:{text:string}){const lang=useContext(Locale);return lang?copy(lang,text):<StandaloneText text={text}/>;}
export function useToolUiCopy(){const {lang}=useLingxiLang();return (text:string)=>extraToolCopy(lang,text)??toolRuntimeText(lang,text,text);}
