import {redirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Keep legacy links valid; no more new video/image-generation pricing. */
export default function Page(){redirect("/sasi#products");}
