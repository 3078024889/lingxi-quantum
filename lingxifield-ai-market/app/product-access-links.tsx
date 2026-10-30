import type {Platform} from '../lib/data';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';

/** Navigate to the publisher's product, its official documentation, or code repository.
 * No repository URL can be represented as an official product website.
 */
export default function ProductAccessLinks({platform}:{platform:Platform}){
 const url=platform.website;
 const kind=platform.websiteKind||(new URL(url).hostname==='github.com'?'repository':'official');
 const isRepo=kind==='repository';
 const isDocs=kind==='documentation';
 const websiteLabel=isRepo?'查看源码与安装说明':isDocs?'查看官方文档':'访问产品官网';
 const repo=platform.repositoryUrl;
 const verified=platformLinks(platform.id).links.filter(safePublisherLink);
 return <div className="productLinks" aria-label="官方与开发者入口">
  <a className={isRepo?'linkSource':'primaryLink'} href={url} target="_blank" rel="noopener noreferrer"
   data-link-kind={kind}>{websiteLabel} ↗</a>
  {repo&&repo!==url&&!verified.some(x=>x.url===repo)&&<a className="linkSource" href={repo} target="_blank" rel="noopener noreferrer"
   data-link-kind="repository">GitHub 源码 ↗</a>}
  {verified.map(link=><a key={link.kind+link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="linkSource" data-link-kind={link.kind}>{link.label} ↗</a>)}
  {isRepo&&<span className="subtle" style={{fontSize:12}}>此项目是开发者代码库，没有经核验的独立在线使用入口；可能需要本地部署。</span>}
  {isDocs&&<span className="subtle" style={{fontSize:12}}>该入口是官方技术文档，并非可直接体验的在线产品。</span>}
 </div>;
}
