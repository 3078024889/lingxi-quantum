import {redirect} from "next/navigation";

// Preserve the requested UI language when forwarding this legacy tool URL.
// Only known language codes are accepted; never forward arbitrary query strings.
const supported=new Set(["zh","en","ja","ko","fr","de","es","pt","ar"]);
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string|string[]}>}){
 const query=await searchParams;
 const lang=typeof query.lang==="string"&&supported.has(query.lang)?query.lang:null;
 redirect(lang?`/tools/image-to-pdf?lang=${lang}`:"/tools/image-to-pdf");
}
