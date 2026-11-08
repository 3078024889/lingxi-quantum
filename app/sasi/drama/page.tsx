import {redirect} from "next/navigation";
export const metadata={robots:{index:false,follow:false}};
/** Retire new short-drama creation; preserve historical task/order data. */
export default function Page(){redirect("/sasi");}
