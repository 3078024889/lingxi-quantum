import {platforms,type Platform} from './data';
import {entries} from './catalog-store';
import {createSearchIndex} from './search-index.mjs';
import type {CatalogEntry} from './catalog-engine.mjs';
const seed=new Map(platforms.map(p=>[p.id,p]));
const records=new Map<string,CatalogEntry>(platforms.map(p=>[p.id,{id:p.id,name:p.name,company:p.company,category:p.category,website:p.website,description:p.about,status:'unverified',updatedAt:'2026-10-29T00:00:00Z',capabilities:p.features}]));
for(const item of entries)if(item.status!=='discontinued')records.set(item.id,item);
const index=createSearchIndex([...records.values()]);
export function toPlatform(e:CatalogEntry):Platform {
 const prior=seed.get(e.id);
 return {...(prior||{symbol:'◇',year:'待核验',location:'待核验',funding:'待核验',listing:'待核验',price:'待核验',free:'待核验',restrictions:'待核验',seo:'待核验',geo:'待核验',visits:'—',downloads:'—',score:0,trend:0}),id:e.id,name:e.name,company:e.company,category:e.category,about:e.description,features:e.capabilities,website:e.website,source:e.website,domain:new URL(e.website).hostname};
}
export function findPlatform(id:string){const row=index.get(id);return row?toPlatform(row):undefined;}
export function searchPlatforms(options:{q?:string;category?:string;limit?:number;cursor?:number}={}) {const r=index.search(options);return {...r,items:r.items.map(toPlatform)};}
