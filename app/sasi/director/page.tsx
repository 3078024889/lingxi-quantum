import {permanentRedirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Retired SASI creation route. Historical paid orders, files and entitlements remain preserved. */
export default function Page(){permanentRedirect("/sasi");}
