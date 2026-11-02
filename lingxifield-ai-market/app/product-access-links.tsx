import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';
import {publisherLinkCopy,publisherLinkLabel} from '../lib/market-link-copy.mjs';

/** Outbound URL is publisher-sourced; labels and warnings follow the selected language. */
export default function ProductAccessLinks({platform,language='zh'}:{platform:Platform;language?:Language}){
 const t=publisherLinkCopy(language),url=platform.website;
 const kind=platform.websiteKind||(new URL(url).hostname==='github.com'?'repository':'official');
 const isRepo=kind==='repository',isDocs=kind==='documentation';
 const repo=platform.repositoryUrl;
 const verified=platformLinks(platform.id).links.filter(safePublisherLink);
 return <div className="productLinks" aria-label={t.aria} dir={language==='ar'?'rtl':'ltr'}>
  <a className={isRepo?'linkSource':'primaryLink'} href={url} target="_blank" rel="noopener noreferrer" data-link-kind={kind}>
   {publisherLinkLabel(kind,language)} ↗
  </a>
  {repo&&repo!==url&&!verified.some(x=>x.url===repo)&&<a className="linkSource" href={repo} target="_blank" rel="noopener noreferrer" data-link-kind="repository">{t.source} ↗</a>}
  {verified.map(link=><a key={link.kind+link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="linkSource" data-link-kind={link.kind}>{publisherLinkLabel(link.kind,language)} ↗</a>)}
  {isRepo&&<span className="subtle">{t.repoNote}</span>}
  {isDocs&&<span className="subtle">{t.docsNote}</span>}
 </div>;
}
