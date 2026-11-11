import {permanentRedirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** The public software market now lives at /sasi; seller operations live at /sasi/seller. */
export default function Page(){permanentRedirect("/sasi");}
