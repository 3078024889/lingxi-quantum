import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShareRail from "@/components/tools/ToolShareRail";
import ExportAccessProvider from "@/components/tools/ExportAccessProvider";

export default function ToolsLayout({children}:{children:React.ReactNode}){
  return <>
    <Nav/>
    {children}
    <ExportAccessProvider/>
    <ToolShareRail/>
    <Footer/>
  </>;
}
