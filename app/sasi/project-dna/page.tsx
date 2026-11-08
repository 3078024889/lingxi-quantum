import {redirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Retire new SASI creation. Historical paid orders and files remain stored. */
export default function Page(){redirect("/sasi");}
