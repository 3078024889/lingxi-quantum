'use client';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {getGlobalTool} from '@/lib/seo/global-seo';
import ToolFacts from './ToolFacts';
export default function ToolGuideContent({slug}:{slug:string}){
 const {lang}=useLingxiLang();const tool=getGlobalTool(slug);
 return tool?<ToolFacts tool={tool} locale={lang}/>:null;
}
