"use client";
import {useLingxiLang} from '@/lib/lingxi-i18n';
import ConnectionCenter from '@/app/sasi/ConnectionCenter';
export default function SasiConnectionsClient({accountEmail}:{accountEmail:string|null}){
 const {lang}=useLingxiLang();
 return <ConnectionCenter lang={lang} dark={false} accountEmail={accountEmail}/>;
}
