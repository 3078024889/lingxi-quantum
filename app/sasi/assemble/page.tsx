import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import VideoAssembler from "../VideoAssembler";

export const metadata={
 title:"SASI Video Assembly｜LINGXIFIELD",
 description:"Arrange existing clips and assemble one MP4 locally in your browser.",
 robots:{index:false,follow:false}
};

export default function AssemblePage(){
 return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)] px-4 py-10 text-[var(--lx-ink)]"><VideoAssembler/></main><Footer/></>;
}
