import type { LingxiLang } from "@/lib/lingxi-i18n";

const LOCALES:Record<LingxiLang,string>={
  zh:"zh-CN",en:"en-US",ja:"ja-JP",ko:"ko-KR",fr:"fr-FR",de:"de-DE",es:"es-ES",pt:"pt-BR",ar:"ar",
};

function phrase(lang:LingxiLang,expired:boolean,date:string){
  if(lang==="zh")return expired?`已于 ${date} 过期`:`有效至 ${date}`;
  if(lang==="ja")return expired?`${date} に期限切れ`:`有効期限 ${date}`;
  if(lang==="ko")return expired?`${date} 만료`:`${date}까지 유효`;
  if(lang==="fr")return expired?`Expiré le ${date}`:`Valable jusqu’au ${date}`;
  if(lang==="de")return expired?`Abgelaufen am ${date}`:`Gültig bis ${date}`;
  if(lang==="es")return expired?`Caducó el ${date}`:`Válido hasta ${date}`;
  if(lang==="pt")return expired?`Expirou em ${date}`:`Válido até ${date}`;
  if(lang==="ar")return expired?`انتهت الصلاحية في ${date}`:`صالح حتى ${date}`;
  return expired?`Expired ${date}`:`Valid until ${date}`;
}

export default function LocalizedOrderExpiry({iso,days}:{iso:string;days:number}){
  const expiry=new Date(new Date(iso).getTime()+days*86400000);
  const expired=expiry<new Date();
  const langs=(["zh","en","ja","ko","fr","de","es","pt","ar"] as LingxiLang[]);
  return <>
    {langs.map(lang=>{
      const date=expiry.toLocaleDateString(LOCALES[lang],{year:"numeric",month:"numeric",day:"numeric"});
      return <span key={lang} data-lang={lang} className="lx-bi-part">{phrase(lang,expired,date)}</span>;
    })}
  </>;
}
