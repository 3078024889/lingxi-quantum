import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"连接我的智能服务｜灵犀场 SASI",
 description:"选择火山方舟、OpenRouter 或模型官方服务，连接自己的账户，用于对话、网站、学习与创作。",
 alternates:{canonical:"/sasi/connections"},
};

export default async function Page(){
 const supabase=isSupabasePublicConfigured()?createClient():null;
 const user=supabase?await getServerUser(supabase):null;
 return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-8"><SasiConnectionsClient accountEmail={user?.email??null}/></div></main><Footer/></>;
}
