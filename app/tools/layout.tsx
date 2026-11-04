import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShareRail from "@/components/tools/ToolShareRail";
import ExportAccessProvider from "@/components/tools/ExportAccessProvider";

// Tool pages supply exact titles; do not append another brand suffix.
export const metadata:Metadata={title:{default:"在线工具｜灵犀场 LINGXIFIELD",template:"%s"}};
export default function ToolsLayout({children}:{children:React.ReactNode}){
  return <>
    <Nav/>
    {children}
    <ExportAccessProvider/>
    <ToolShareRail/>
    <Footer/>
  </>;
}
