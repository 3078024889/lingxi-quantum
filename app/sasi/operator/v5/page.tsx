import {permanentRedirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Retired internal SASI creation-era operator surface. Marketplace administration remains at /sasi/marketplace/admin. */
export default function Page(){permanentRedirect("/sasi");}
