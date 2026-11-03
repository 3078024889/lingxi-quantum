import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Item={count:number|null;collectedAt:string|null;status:'present'|'missing';label:string};
export async function GET(){
 const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/source-pipeline');
 const defs:[string,string,string,string][]=[
  ['offers','modelsdev-bulk.json','modelCount','模型服务记录'],
  ['models','model-offer-groups.json','distinctModelIdentifiers','模型标识'],
  ['products','products-unified.json','total','产品候选'],
  ['hfModels','hf-models-catalog.json','modelCount','Hub 模型'],
  ['hfSpaces','hf-spaces-catalog.json','count','公开应用']
 ];
 const items:Record<string,Item>={};
 for(const [key,file,field,label] of defs){
  try{
   const data=JSON.parse(await readFile(resolve(dir,file),'utf8')) as Record<string,unknown>;
   const value=data[field],time=data.collectedAt||data.sourceCollectedAt||data.generatedAt;
   items[key]={count:typeof value==='number'&&Number.isInteger(value)&&value>=0?value:null,
    collectedAt:typeof time==='string'?time:null,status:'present',label};
  }catch{items[key]={count:null,collectedAt:null,status:'missing',label}}
 }
 return NextResponse.json({items,scope:'local_collected_inventory_only',notice:'Model IDs may share underlying models. Product candidates are unverified. No traffic, SEO/GEO, revenue or user count is implied.'},{headers:{'Cache-Control':'no-store'}});
}
