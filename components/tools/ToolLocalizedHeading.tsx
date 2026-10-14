"use client";
import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {toolTitle} from '@/lib/tools/card-i18n';
import {toolIntro} from '@/lib/tools/product-copy';
import {toolFacts} from '@/lib/seo/product-facts';
import {extraToolCopy} from '@/lib/tools/ui-copy-v86';
export default function ToolLocalizedHeading({title,intro,note}:{title:ReactNode;intro:ReactNode;note?:ReactNode}){
 const {lang}=useLingxiLang();const pathname=usePathname();const slug=pathname.split('/').filter(Boolean).pop()||'';
 const name=lang==='zh'||typeof title!=='string'?title:toolTitle(lang,slug,slug.replaceAll('-',' '));
 const description=lang==='zh'||typeof intro!=='string'?intro:toolIntro(lang,slug)||toolFacts(slug,lang).summary;
 return <div className="mt-6 max-w-3xl"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1><p className="mt-3 text-base leading-7 text-[var(--lx-muted)]">{description}</p>{note&&<p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">{typeof note==='string'?extraToolCopy(lang,note)||note:note}</p>}</div>;
}
