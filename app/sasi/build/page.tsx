import {permanentRedirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Retired SASI creation or provider-connection route. Historical orders and files remain preserved. */
export default function Page(){permanentRedirect("/sasi");}
