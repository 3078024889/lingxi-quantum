/** Verified scholarly metadata retrieval via OpenAlex; never fabricate full texts or article summaries. */
export type ScholarlyPaper={title:string;url:string;doi:string|null;published:string;authors:string[];source:string;citations:number|null};
export function scholarlySearchUrl(query:string,days:number,now=new Date()):string{
 const q=query.trim();
 if(!q||q.length>240)throw new Error("SCHOLARLY_QUERY_INVALID");
 const window=Math.min(365,Math.max(1,Math.trunc(days)||60));
 const from=new Date(now.getTime()-window*86400_000).toISOString().slice(0,10);
 const url=new URL("https://api.openalex.org/works");
 url.searchParams.set("search",q);
 url.searchParams.set("filter","from_publication_date:"+from);
 url.searchParams.set("sort","publication_date:desc");
 url.searchParams.set("per_page","10");
 url.searchParams.set("select","id,title,doi,publication_date,authorships,primary_location,cited_by_count");
 return url.toString();
}
export function parseScholarlyPapers(data:unknown):ScholarlyPaper[]{
 if(!data||typeof data!=="object"||!Array.isArray((data as any).results))return[];
 const seen=new Set<string>(),result:ScholarlyPaper[]=[];
 for(const raw of (data as any).results){
  if(!raw||typeof raw!=="object"||typeof raw.title!=="string"||!raw.title.trim())continue;
  const doi=typeof raw.doi==="string"&&/^https:\/\/doi\.org\//i.test(raw.doi)?raw.doi:null;
  const id=typeof raw.id==="string"&&/^https:\/\/openalex\.org\/W\d+$/.test(raw.id)?raw.id:null;
  const url=doi||id;if(!url||seen.has(url))continue;seen.add(url);
  const date=typeof raw.publication_date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(raw.publication_date)?raw.publication_date:"";
  const authors=Array.isArray(raw.authorships)?raw.authorships.map((x:any)=>String(x?.author?.display_name||"").trim()).filter(Boolean).slice(0,8):[];
  result.push({title:raw.title.slice(0,360),url,doi,published:date,authors,source:String(raw.primary_location?.source?.display_name||"").slice(0,200),citations:Number.isInteger(raw.cited_by_count)&&raw.cited_by_count>=0?raw.cited_by_count:null});
 }
 return result;
}
