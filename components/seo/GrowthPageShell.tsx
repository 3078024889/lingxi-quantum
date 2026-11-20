import type {ReactNode} from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {SEO_LOCALES,localePath,type SeoLocale} from "@/lib/seo/global-seo";

type Props={
 locale:SeoLocale;
 eyebrow:string;
 title:string;
 description:string;
 backHref?:string;
 backLabel?:string;
 children:ReactNode;
};

export default function GrowthPageShell({locale,eyebrow,title,description,backHref,backLabel,children}:Props){
 const copy=SEO_LOCALES[locale];
 return <>
  <Nav/>
  <main className="lx-growth-page" lang={copy.hreflang} dir={copy.dir} data-lx-growth-page>
   <div className="lx-growth-shell">
    <nav className="lx-growth-breadcrumb" aria-label="Breadcrumb">
     <Link href={localePath(locale,"/")}>{copy.brand}</Link>
     {backHref?<><span aria-hidden="true">/</span><Link href={localePath(locale,backHref)}>{backLabel||copy.brand}</Link></>:null}
    </nav>
    <header className="lx-growth-hero">
     <p className="lx-growth-eyebrow">{eyebrow}</p>
     <h1>{title}</h1>
     <p className="lx-growth-description">{description}</p>
    </header>
    <div className="lx-growth-content">{children}</div>
   </div>
  </main>
  <Footer/>
 </>;
}
