import Nav from "@/components/Nav";import Footer from "@/components/Footer";
import {createAdminClient} from "@/lib/supabase/admin";
export const revalidate=300;
export const metadata={title:"灵犀场模板｜发现可以继续创造的作品",description:"发现经创作者主动提交并通过审核的灵犀场公开模板。私人作品不会自动进入模板库。"};
export default async function Page(){
 let items:any[]=[];try{const a=createAdminClient();const r=await a.from("lingxifield_creator_templates").select("id,kind,title,description,cover_url,preview_url,use_count,created_at").eq("visibility","public").eq("review_status","approved").order("created_at",{ascending:false}).limit(48);items=r.data||[]}catch{}
 return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16"><p className="text-sm opacity-50">LINGXIFIELD CREATIONS</p><h1 className="mt-3 text-4xl font-semibold">灵犀场模板</h1><p className="mt-4 max-w-2xl leading-8 opacity-65">只有创作者明确提交并通过审核的作品才会出现在这里。你可以从一个好结果继续创造，而不是从空白开始。</p>
 <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.length?items.map(x=><article key={x.id} className="rounded-3xl border border-black/10 p-5"><div className="text-xs opacity-45">{x.kind}</div><h2 className="mt-2 text-xl font-semibold">{x.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 opacity-60">{x.description}</p><div className="mt-5 text-xs opacity-45">已被继续使用 {Number(x.use_count||0)} 次</div></article>):<div className="rounded-3xl border border-black/10 p-8 opacity-60">公开模板正在积累中。私人作品不会被自动发布。</div>}</div></main><Footer/></>;
}
