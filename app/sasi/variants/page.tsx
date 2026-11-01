import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiVariantWorkbench from "@/components/SasiVariantWorkbench";

export const metadata:Metadata={
 title:"SASI Editable Storyboard Variants | LINGXIFIELD",
 description:"Build and export 1–100 editable storyboard variants locally before requesting a real video generation quote.",
 robots:{index:false,follow:false},
};
export default function Page(){return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)] pt-16 lg:pt-8"><SasiVariantWorkbench/></main><Footer/></>;}
