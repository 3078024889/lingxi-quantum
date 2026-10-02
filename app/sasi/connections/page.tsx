import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"创作连接｜灵犀场 SASI",
  description:"连接你已经开通的创作服务，按页面提示安全保存连接凭证，之后可在 SASI 的适用任务中直接使用。",
  alternates:{canonical:"/sasi/connections"},
};

export default async function Page(){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  return <><Nav/><main className="lx11-page">
    <div className="lx11-wrap py-14">
      <SasiConnectionsClient accountEmail={user?.email??null}/>
    </div>
  </main><Footer/></>;
}