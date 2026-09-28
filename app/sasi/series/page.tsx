import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiMultiEpisodeWorkspace from "@/components/SasiMultiEpisodeWorkspace";
export const metadata:Metadata={title:"SASI Multi-episode Studio｜LINGXIFIELD",robots:{index:false,follow:false}};
export default async function Page(props:{searchParams?: Promise<{projectId?:string}>}) {
 const searchParams = await props.searchParams;
 const projectId=typeof searchParams?.projectId==="string"?searchParams.projectId:"";
 return <><Nav/>{/^[0-9a-f-]{36}$/i.test(projectId)?<SasiMultiEpisodeWorkspace projectId={projectId}/>:<main className="min-h-screen bg-[var(--lx-bg)] p-10 text-[var(--lx-ink)]">Select a valid SASI drama project first.</main>}<Footer/></>;
}
