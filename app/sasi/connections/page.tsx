import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"连接我的智能服务｜灵犀场 SASI",
 description:"连接一次，SASI 会在短剧、网站、书本、学习和科研中自动选择适配的能力。",
 alternates:{canonical:"/sasi/connections"},
};

export default async function Page(){
 const supabase=isSupabasePublicConfigured()?createClient():null;
 const user=supabase?await getServerUser(supabase):null;
 return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-14"><SasiConnectionsClient accountEmail={user?.email??null}/></div></main><Footer/></>;
}
