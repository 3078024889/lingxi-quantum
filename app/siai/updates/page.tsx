import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import {getSiaiDirectoryRows} from "@/app/siai/catalog-data";

export const metadata:Metadata={
 title:"全球 SIAI 厂商资料更新｜灵犀场",
 description:"查看全球 SIAI 排行榜厂商已核验资料的复核日期、官方来源及 RSS 数据订阅入口。",
 robots:{index:true,follow:true}
};

export default function SiaiUpdatesPage(){
 const {curated}=getSiaiDirectoryRows();
 const rows=curated.filter(r=>r.checkedAt&&Number.isFinite(Date.parse(r.checkedAt)))
   .sort((a,b)=>Date.parse(b.checkedAt||"")-Date.parse(a.checkedAt||"")).slice(0,40);
 return <><Nav/><main className="lx11-page"><section style={{width:"min(940px,100%)",margin:"0 auto",padding:"8px 0 60px"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:18}}>
   <Link href="/siai" style={{color:"#245bbb",fontSize:13}}>← <LxText zh="全球 SIAI 排行榜" en="Global SIAI Rankings"/></Link>
   <Link href="/siai/updates.xml" style={{color:"#245bbb",fontSize:13,textDecoration:"underline"}}><LxText zh="RSS 订阅源（阅读器使用）" en="RSS feed for readers"/></Link>
  </div>
  <div style={{borderRadius:22,background:"var(--lx-panel,#fff)",border:"1px solid var(--lx-line,#e5e7eb)",padding:"24px clamp(16px,4vw,36px)"}}>
   <small style={{color:"#4e75a7",letterSpacing:".08em",fontWeight:750}}>LINGXIFIELD · SIAI</small>
   <h1 style={{fontSize:"clamp(24px,3vw,34px)",fontWeight:750,margin:"10px 0"}}><LxText zh="已核验厂商资料更新" en="Verified publisher updates"/></h1>
   <p style={{color:"var(--lx-muted,#666)",lineHeight:1.85,fontSize:14}}>
    <LxText zh="这里展示公开目录中已核验厂商资料的最近复核记录。复核时间不代表新品发布；未审核候选不进入公开列表。浏览器直接打开 RSS 时看到 XML 属正常现象，日常阅读可使用本页面。" en="This page lists recent source reviews for published vendor profiles. Review dates do not imply product launches. Unreviewed candidates are excluded. Raw XML is normal when opening the RSS feed in a browser."/>
   </p>
   <div style={{marginTop:24,display:"grid",gap:10}}>
    {rows.map(r=><article key={r.id} style={{border:"1px solid var(--lx-line,#e5e7eb)",borderRadius:12,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
     <div><strong style={{fontSize:15}}>{r.name}</strong><div style={{color:"var(--lx-muted,#666)",fontSize:12,marginTop:6}}>{r.category} · <LxText zh="资料复核" en="Source reviewed"/> {new Date(r.checkedAt!).toLocaleDateString("en-CA",{timeZone:"UTC"})}</div></div>
     {r.website?.startsWith("https://")?<a href={r.website} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:"#245bbb",textDecoration:"underline"}}><LxText zh="官网资料" en="Official website"/> ↗</a>:null}
    </article>)}
   </div>
   {!rows.length&&<p style={{padding:24}}><LxText zh="暂无可展示的已核验更新。" en="No verified updates available."/></p>}
  </div>
 </section></main><Footer/></>;
}
