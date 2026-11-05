import {notFound} from "next/navigation";
import type {Metadata} from "next";
import offers from "@/config/tool-pass-offers.v2.json";
import ToolPassOffers from "@/components/tools/ToolPassOffers";
export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"实用工具包｜LINGXIFIELD",
 robots:{index:false,follow:false}
};
export default function ToolPassPage(){
 // Keep the entire UI unavailable until DB, real-payment and end-to-end QA
 // are complete; this is a non-public, opt-in engineering candidate.
 if(process.env.LINGXIFIELD_TOOL_PASS_ENABLED!=="true"||!offers.active)notFound();
 return <ToolPassOffers/>;
}
