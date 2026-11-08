import {redirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Historical orders and files remain accessible through account pages. No new image generation. */
export default function Page(){redirect("/sasi");}
