import {permanentRedirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Legacy SASI creation pricing now resolves to the current account balance. */
export default function Page(){permanentRedirect("/ai-wallet");}
