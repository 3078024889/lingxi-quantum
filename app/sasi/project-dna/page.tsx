import Nav from "@/components/Nav";import Footer from "@/components/Footer";import SasiProjectDNAEditor from "@/components/SasiProjectDNAEditor";
export const dynamic="force-dynamic";export const metadata={title:"人物与作品风格｜灵犀场 SASI",robots:{index:false,follow:false}};
export default async function Page(props:{searchParams?: Promise<{projectId?:string}>}) {
 const searchParams = await props.searchParams;
 const projectId=typeof searchParams?.projectId==="string"?searchParams.projectId:"";
 return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-14">{projectId?<SasiProjectDNAEditor projectId={projectId}/>:<p className="text-[var(--lx-muted)]">请从一个 SASI 项目进入人物与作品风格设置。</p>}</div></main><Footer/></>
}
