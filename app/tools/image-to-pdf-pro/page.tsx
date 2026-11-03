import {permanentRedirect} from "next/navigation";
type Props={searchParams:Promise<{lang?:string|string[]}>};
/** Keep old bookmarks and preserve the chosen UI language. */
export default async function Page({searchParams}:Props){
 const {lang}=await searchParams;
 const valid=new Set(["zh","en","ja","ko","fr","de","es","pt","ar"]);
 permanentRedirect("/tools/image-to-pdf"+(typeof lang==="string"&&valid.has(lang)?`?lang=${encodeURIComponent(lang)}`:""));
}
