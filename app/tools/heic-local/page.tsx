import {permanentRedirect} from "next/navigation";
type Props={searchParams:Promise<{lang?:string|string[]}>};
/** Legacy URL retained for bookmarks; /tools/heic-to-jpg is the sole public tool. */
export default async function Page({searchParams}:Props){
 const {lang}=await searchParams;
 const valid=new Set(["zh","en","ja","ko","fr","de","es","pt","ar"]);
 const locale=typeof lang==="string"&&valid.has(lang)?`?lang=${encodeURIComponent(lang)}`:"";
 permanentRedirect("/tools/heic-to-jpg"+locale);
}
