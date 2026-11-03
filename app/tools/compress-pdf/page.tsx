import {permanentRedirect} from "next/navigation";
type Props={searchParams:Promise<{lang?:string|string[]}>};
/** Legacy compression URL; the enhanced 3-preset PDF compressor is canonical. */
export default async function Page({searchParams}:Props){
 const {lang}=await searchParams;
 const valid=new Set(["zh","en","ja","ko","fr","de","es","pt","ar"]);
 const locale=typeof lang==="string"&&valid.has(lang)?`?lang=${encodeURIComponent(lang)}`:"";
 permanentRedirect("/tools/pdf-compress"+locale);
}
