import type { Metadata } from "next";
import BurnAfterReadReveal from "@/components/tools/BurnAfterReadReveal";
export const metadata:Metadata={title:"一次性内容｜灵犀场",robots:{index:false,follow:false}};
export default async function Page(props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  return <main className="lx11-page"><div className="lx11-wrap py-10"><BurnAfterReadReveal id={params.id}/></div></main>
}
