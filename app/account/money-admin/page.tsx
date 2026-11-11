import type {Metadata} from "next";import Nav from "@/components/Nav";import Footer from "@/components/Footer";import MoneyAdminDashboard from "@/components/MoneyAdminDashboard";
export const dynamic="force-static";export const metadata:Metadata={title:"管理后台｜灵犀场",robots:{index:false,follow:false}};
// Static shell only: authorization is enforced by the API, never the HTML.
export default function Page(){return <><Nav/><MoneyAdminDashboard/><Footer/></>;}
