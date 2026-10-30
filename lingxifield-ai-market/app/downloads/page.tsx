import Link from 'next/link';
import {OFFICIAL_PLATFORM_LINKS} from '../../lib/official-platform-links';
import {searchPlatforms} from '../../lib/platform-repository';
export const metadata={title:'AI 工具官网下载｜Windows、Mac、iPhone、安卓｜灵犀场',description:'直接进入全球 SI AI 工具的厂商官网和官方下载页；无官方安装包的产品仅提供网页入口。'};
export default function DownloadsPage(){
 const platforms=searchPlatforms({limit:50}).items;
 const byId=new Map(platforms.map(x=>[x.id,x]));
 const names:Record<string,string>={suno:'Suno 音乐',elevenlabs:'ElevenLabs 配音',lovable:'Lovable AI 建网站',replit:'Replit AI 编程'};
 const items=Object.entries(OFFICIAL_PLATFORM_LINKS).map(([id,p])=>({
  id,name:names[id]||byId.get(id)?.name||id,site:byId.get(id)?.website,
  links:p.links.filter(x=>['desktop','ios','android'].includes(x.kind))
 })).filter(x=>x.links.length).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
 return <main className="officialDownloads"><Link href="/">← 返回全球SI AI工具行情平台</Link>
  <h1>AI 工具官网下载</h1><p>想用哪个工具，直接去厂商官方渠道。电脑端、iPhone、安卓的下载方式分开列出；没有安装包时可通过网页使用。</p>
  <div className="downloadCards">{items.map(x=><article key={x.id}>
   <h2>{x.name}</h2><div className="downloadLinks">
    {x.site&&<a href={x.site} target="_blank" rel="noopener noreferrer">访问官网 ↗</a>}
    {x.links.map(l=><a key={l.kind+l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
    <Link href={'/platform/'+x.id}>使用方法、免费与收费</Link>
   </div>
  </article>)}</div>
  <p className="publicSourceNote">下载链接只指向厂商公布的官方页面或应用商店；应用能否在你所在地区安装，以各商店实际显示为准。不提供第三方安装包。</p>
 </main>;
}
