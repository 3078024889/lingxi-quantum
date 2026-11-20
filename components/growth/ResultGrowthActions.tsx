"use client";
import {publicVisitPath} from "@/lib/analytics/public-visit";
export default function ResultGrowthActions({downloadUrl,kind="result",artifactId}:{downloadUrl?:string;kind?:string;artifactId?:string}){
 const share=async()=>{
  const path=publicVisitPath(location.pathname)||"/tools";
  const url=new URL(path,location.origin);
  url.searchParams.set("utm_source","result_share");
  url.searchParams.set("utm_campaign","tool_result");
  url.searchParams.set("utm_content",/^[a-z0-9-]{1,32}$/i.test(kind)?kind.toLowerCase():"result");
  const target=url.toString();
  const data={title:"灵犀场 LINGXIFIELD",text:"查看灵犀场的公开工具与资料入口。",url:target};
  if(navigator.share)await navigator.share(data);else await navigator.clipboard.writeText(target);
 };
 const button={padding:"10px 14px",border:"1px solid var(--lx-line)",borderRadius:14,background:"transparent",color:"var(--lx-ink)",cursor:"pointer"} as const;
 return <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:16}}>
  {downloadUrl&&<a href={downloadUrl} download style={{...button,textDecoration:"none"}}>保存结果</a>}
  <button type="button" onClick={share} style={button}>分享公开入口</button>
  <button type="button" onClick={()=>window.dispatchEvent(new CustomEvent("lingxifield:template-submit",{detail:{kind,artifactId}}))} style={button}>提交为模板</button>
 </div>
}
