"use client";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
const copy:Record<LingxiLang,string>={
 zh:"把全球 SIAI 资料嵌入你的网站 · 免费",
 en:"Add verified SIAI profiles to your website · Free",
 ja:"SIAI企業情報をサイトに無料で埋め込む",
 ko:"검증된 SIAI 기업 정보를 사이트에 무료로 추가",
 fr:"Intégrer les fiches SIAI à votre site · Gratuit",
 de:"Geprüfte SIAI-Profile auf Ihrer Website · Kostenlos",
 es:"Integra los perfiles SIAI en tu web · Gratis",
 pt:"Incorpore perfis SIAI ao seu site · Grátis",
 ar:"أضف بيانات SIAI إلى موقعك مجاناً"
};
export default function SiaiPartnerLink(){
 const {lang}=useLingxiLang();
 return <div style={{maxWidth:1180,margin:"12px auto 0",padding:"4px 18px",textAlign:"end"}}>
  <Link href="/partners" style={{fontSize:15,color:"#2359c7",fontWeight:700,textDecoration:"underline",textUnderlineOffset:3}}>
   {copy[lang]||copy.en}
  </Link>
 </div>;
}
