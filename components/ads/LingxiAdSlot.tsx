'use client';
import { useEffect } from 'react';

declare global { interface Window { adsbygoogle?: unknown[] } }
export default function LingxiAdSlot({slot,className=''}:{slot?:string;className?:string}){
  const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const resolved=slot || process.env.NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT;
  useEffect(()=>{ if(client && resolved){ try{ (window.adsbygoogle=window.adsbygoogle||[]).push({}); }catch{} } },[client,resolved]);
  if(!client || !resolved) return null;
  return <div className={className} aria-label="Advertisement"><ins className="adsbygoogle" style={{display:'block'}} data-ad-client={client} data-ad-slot={resolved} data-ad-format="auto" data-full-width-responsive="true" /></div>;
}
