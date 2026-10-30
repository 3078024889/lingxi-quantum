'use client';
import type {Platform} from '../lib/data';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';

export function claimUrl(platform:Pick<Platform,'id'|'name'>){
 return '/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name}).toString();
}
export default function MarketRowActions({platform,onDetail,onToggleCompare,isCompared}:{platform:Platform;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean}){
 const links=platformLinks(platform.id).links.filter(safePublisherLink);
 const desktops=links.filter(l=>l.kind==='desktop');
 const mobiles=links.filter(l=>l.kind==='ios'||l.kind==='android');
 const mobileUnique=mobiles.filter((link,i)=>mobiles.findIndex(x=>x.url===link.url)===i);
 return <div className="marketRowActions" aria-label={platform.name+'官网、下载和厂商认领'}>
  <a href={platform.website} target="_blank" rel="noopener noreferrer" className="rowPrimary" title={platform.websiteKind==='repository'?'此入口是开发源码':platform.websiteKind==='documentation'?'此入口是技术文档':'厂商官网可能需要登录或注册'}>{platform.websiteKind==='repository'?'开源项目':platform.websiteKind==='documentation'?'官方文档':'网页使用 / 登录'} ↗</a>
  {desktops.length>0&&<a href={desktops[0].url} target="_blank" rel="noopener noreferrer" title={desktops[0].label}>电脑下载 ↗</a>}
  {mobileUnique.map((link,i)=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label}>{mobileUnique.length===1?'手机端下载':link.kind==='ios'?'iPhone 下载':'Android 下载'} ↗</a>)}
  <button type="button" onClick={onDetail}>详情</button>
  <button type="button" className={isCompared?"rowCompareActive":""} onClick={onToggleCompare}>{isCompared?"已选对比":"对比"}</button>
  <a href={claimUrl(platform)} className="vendorRowClaim" title={'免费认领或补充 '+platform.name+' 官方资料'}>厂商认领</a>
 </div>;
}
