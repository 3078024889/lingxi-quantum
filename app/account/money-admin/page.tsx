import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {isSupabaseAdminConfigured} from "@/lib/supabase/admin";
import type {Metadata} from "next";import Nav from "@/components/Nav";import Footer from "@/components/Footer";import MoneyAdminDashboard from "@/components/MoneyAdminDashboard";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"管理后台｜灵犀场",robots:{index:false,follow:false}};
export default async function Page(){
 const h=await headers();
 const host=(h.get("x-lingxi-public-host")||h.get("host")||"").toLowerCase().split(":")[0];
 // Shared Supabase control plane: secure fallback, never forward cookies/tokens across domains.
 if(["lingxifield.com","www.lingxifield.com"].includes(host)&&!isSupabaseAdminConfigured())
   redirect("https://lingxifield.cn/account/money-admin");
 return <><Nav/><MoneyAdminDashboard/><Footer/></>;
}
