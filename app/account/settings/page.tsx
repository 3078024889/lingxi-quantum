import type{Metadata}from"next";
import Nav from"@/components/Nav";
import Footer from"@/components/Footer";
import AccountSettingsPanel from"@/components/AccountSettingsPanel";
export const metadata:Metadata={title:"设置｜灵犀场 LINGXIFIELD",robots:{index:false,follow:false},alternates:{canonical:"/account/settings"}};
export default function Page(){return <><Nav/><main className="lx11-page"><div className="lx11-wrap lx-v40-settings-wrap"><AccountSettingsPanel/></div></main><Footer/></>;}
