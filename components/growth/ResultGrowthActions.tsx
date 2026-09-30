"use client";
export default function ResultGrowthActions({downloadUrl,kind="result",artifactId}:{downloadUrl?:string;kind?:string;artifactId?:string}){
 const share=async()=>{const data={title:"灵犀场 LINGXIFIELD",text:"我用灵犀场完成了这个结果。",url:location.href};if(navigator.share)await navigator.share(data);else await navigator.clipboard.writeText(location.href)};
 return <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:16}}>
  {downloadUrl&&<a href={downloadUrl} download style={{padding:"10px 14px",border:"1px solid #ddd",borderRadius:14,textDecoration:"none",color:"inherit"}}>保存结果</a>}
  <button onClick={share} style={{padding:"10px 14px",border:"1px solid #ddd",borderRadius:14,background:"#fff"}}>分享</button>
  <button onClick={()=>window.dispatchEvent(new CustomEvent("lingxifield:template-submit",{detail:{kind,artifactId}}))} style={{padding:"10px 14px",border:"1px solid #ddd",borderRadius:14,background:"#fff"}}>提交为模板</button>
 </div>
}