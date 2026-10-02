import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShareRail from "@/components/tools/ToolShareRail";

export default function ToolsLayout({children}:{children:React.ReactNode}){
  return <>
    <Nav/>
    {children}
    <ToolShareRail/>
    <Footer/>
  </>;
}
