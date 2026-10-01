'use client';
import Link from 'next/link';
import {setLingxiLang,type LingxiLang} from '@/lib/lingxi-i18n';

export default function LocaleEntryLink({locale,href,children}:{locale:LingxiLang;href:string;children:React.ReactNode}){
 return <Link href={href} onClick={()=>setLingxiLang(locale)} style={{display:'inline-block',padding:'12px 18px',border:'1px solid currentColor',borderRadius:999,textDecoration:'none',fontWeight:700}}>{children}</Link>;
}
