import {createHash} from "node:crypto";
import {extname} from "node:path";
import JSZip from "jszip";
import {NextRequest,NextResponse} from "next/server";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const BUCKET="sasi-software-delivery";
const MAX_FILE_BYTES=30*1024*1024;
const MAX_UNPACKED_BYTES=60*1024*1024;
const MAX_ENTRIES=100;
const ALLOWED_EXTENSIONS=new Set([".mq5",".mqh",".ex5",".set",".pdf",".md",".txt",".json",".csv",".ini",".png",".jpg",".jpeg",".webp"]);
const HEADERS={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:HEADERS});
async function reviewer(){try{return await moneyAdministrator()}catch{return null}}

type ZipEntryMeta={unsafeOriginalName?:string;unixPermissions?:number|string;_data?:{uncompressedSize?:number}};

async function inspectPackage(bytes:Buffer){
 if(bytes.length<100||bytes.subarray(0,4).toString("hex")!=="504b0304")
  return {ok:false as const,error:"ZIP_SIGNATURE_INVALID"};
 let zip:JSZip;
 try{zip=await JSZip.loadAsync(bytes,{checkCRC32:false,createFolders:false})}
 catch{return {ok:false as const,error:"ZIP_ARCHIVE_INVALID"}}
 const entries=Object.entries(zip.files).filter(([,entry])=>!entry.dir);
 if(entries.length<2||entries.length>MAX_ENTRIES)return {ok:false as const,error:"ZIP_ENTRY_COUNT_INVALID"};
 const names=new Set<string>();
 let unpacked=0;
 const sources:Array<{name:string;entry:JSZip.JSZipObject;size:number}>=[];
 const guides:Array<{name:string;entry:JSZip.JSZipObject;size:number}>=[];
 for(const [key,entry] of entries){
  const meta=entry as unknown as ZipEntryMeta;
  const name=String(meta.unsafeOriginalName||key);
  const normalized=name.replace(/\\/g,"/");
  const parts=normalized.split("/");
  if(!name||name.length>240||normalized.startsWith("/")||parts.some(x=>x===".."||x==="")||
    normalized.includes("\\0")||normalized.startsWith("__MACOSX/")||normalized.endsWith("/.DS_Store"))
   return {ok:false as const,error:"ZIP_PATH_INVALID"};
  const folded=normalized.toLowerCase();
  if(names.has(folded))return {ok:false as const,error:"ZIP_DUPLICATE_PATH"};
  names.add(folded);
  const mode=typeof meta.unixPermissions==="string"?parseInt(meta.unixPermissions,8):Number(meta.unixPermissions||0);
  if((mode&0o170000)===0o120000)return {ok:false as const,error:"ZIP_SYMLINK_FORBIDDEN"};
  const ext=extname(normalized).toLowerCase();
  if(!ALLOWED_EXTENSIONS.has(ext))return {ok:false as const,error:"ZIP_FILE_TYPE_FORBIDDEN"};
  const size=Number(meta._data?.uncompressedSize);
  if(!Number.isSafeInteger(size)||size<0||size>20*1024*1024)return {ok:false as const,error:"ZIP_ENTRY_SIZE_INVALID"};
  unpacked+=size;
  if(unpacked>MAX_UNPACKED_BYTES)return {ok:false as const,error:"ZIP_UNPACKED_SIZE_LIMIT"};
  if(ext===".mq5")sources.push({name:normalized,entry,size});
  if((ext===".md"||ext===".txt")&&/(readme|install|guide|manual|说明|教程)/i.test(normalized))
   guides.push({name:normalized,entry,size});
 }
 if(sources.length!==1)return {ok:false as const,error:"ONE_9_5_SOURCE_REQUIRED"};
 const source=sources[0];
 if(source.size<100||source.size>5*1024*1024)return {ok:false as const,error:"SOURCE_SIZE_INVALID"};
 let sourceText="";
 try{sourceText=(await source.entry.async("nodebuffer")).toString("utf8").replace(/^\\uFEFF/,"")}
 catch{return {ok:false as const,error:"SOURCE_READ_FAILED"}}
 if(!/#property\\s+version\\s+["']9\\.50["']/i.test(sourceText)||
   !/\\bOnTick\\s*\\(/.test(sourceText))
  return {ok:false as const,error:"COPERNICUS_9_5_SOURCE_MISMATCH"};
 const guide=guides.sort((a,b)=>b.size-a.size)[0];
 if(!guide||guide.size<160||guide.size>512*1024)return {ok:false as const,error:"INSTALL_GUIDE_REQUIRED"};
 let guideText="";
 try{guideText=(await guide.entry.async("nodebuffer")).toString("utf8")}
 catch{return {ok:false as const,error:"INSTALL_GUIDE_READ_FAILED"}}
 if(!/(安装|install)/i.test(guideText)||!/(编译|compile)/i.test(guideText))
  return {ok:false as const,error:"INSTALL_AND_COMPILE_GUIDE_REQUIRED"};
 return {ok:true as const,sourceName:source.name,guideName:guide.name,entryCount:entries.length,unpackedBytes:unpacked};
}

export async function GET(){
 const user=await reviewer();
 if(!user)return reply({error:"NOT_FOUND"},404);
 try{
  const admin=createAdminClient();
  const ids=SASI_SOFTWARE_CATALOG.map(x=>x.id);
  const {data,error}=await admin.from("sasi_software_packages")
   .select("product_id,price_cny,price_usd,bucket,sale_ready,verified_at,sha256")
   .in("product_id",ids);
  if(error)return reply({error:"PACKAGE_STATUS_UNAVAILABLE"},503);
  const rows=new Map((data||[]).map(x=>[x.product_id,x]));
  return reply({products:SASI_SOFTWARE_CATALOG.map(product=>{
   const row=rows.get(product.id);
   return {productId:product.id,title:product.titleZh,priceCny:product.priceCny,priceUsd:product.priceUsd,
    exists:Boolean(row),saleReady:Boolean(row?.sale_ready),verifiedAt:row?.verified_at||null,
    sha256Prefix:row?.sha256&&row.sha256!=="0".repeat(64)?String(row.sha256).slice(0,12):null,
    priceMatches:Boolean(row&&Number(row.price_cny)===product.priceCny&&Number(row.price_usd)===product.priceUsd),
    privateBucket:row?.bucket===BUCKET};
  })});
 }catch{return reply({error:"PACKAGE_STATUS_UNAVAILABLE"},503)}
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return reply({error:"INVALID_ORIGIN"},403);
 const user=await reviewer();
 if(!user)return reply({error:"NOT_FOUND"},404);
 const guard=await enforceAbuseGuard(req,{scope:"sasi-first-party-package-upload",userId:user.id,accountLimit:4,ipLimit:8});
 if(!guard.ok)return reply({error:guard.error},guard.status);
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>MAX_FILE_BYTES+512*1024)
  return reply({error:"PACKAGE_TOO_LARGE"},413);
 const form=await req.formData().catch(()=>null);
 if(!form)return reply({error:"MULTIPART_REQUIRED"},400);
 const productId=String(form.get("productId")||"");
 const product=SASI_SOFTWARE_CATALOG.find(x=>x.id===productId);
 const candidate=form.get("package");
 if(!product)return reply({error:"SOURCE_PRODUCT_ONLY"},400);
 if(!candidate||typeof candidate==="string"||typeof (candidate as File).arrayBuffer!=="function")
  return reply({error:"PACKAGE_FILE_REQUIRED"},400);
 const file=candidate as File;
 if(!file.name.toLowerCase().endsWith(".zip")||file.size<100||file.size>MAX_FILE_BYTES)
  return reply({error:"ZIP_REQUIRED_MAX_30MB"},400);
 let bytes:Buffer;
 try{bytes=Buffer.from(await file.arrayBuffer())}
 catch{return reply({error:"PACKAGE_READ_FAILED"},400)}
 if(bytes.length!==file.size)return reply({error:"PACKAGE_SIZE_MISMATCH"},400);
 const inspected=await inspectPackage(bytes);
 if(!inspected.ok)return reply({error:inspected.error},422);
 const sha256=createHash("sha256").update(bytes).digest("hex");
 const objectPath=`first-party/${product.id}/${sha256}.zip`;
 try{
  const admin=createAdminClient();
  const {data:record,error:recordError}=await admin.from("sasi_software_packages")
   .select("product_id,price_cny,price_usd,bucket,sale_ready")
   .eq("product_id",product.id).maybeSingle();
  if(recordError||!record)return reply({error:"PACKAGE_RECORD_MISSING"},503);
  if(record.bucket!==BUCKET||Number(record.price_cny)!==product.priceCny||Number(record.price_usd)!==product.priceUsd)
   return reply({error:"PACKAGE_PRICE_OR_BUCKET_MISMATCH"},409);
  if(record.sale_ready)return reply({error:"PACKAGE_ALREADY_ACTIVE"},409);

  const storage=admin.storage.from(BUCKET);
  let stored=await storage.download(objectPath);
  if(stored.error){
   const uploaded=await storage.upload(objectPath,bytes,{contentType:"application/zip",cacheControl:"0",upsert:false});
   if(uploaded.error)return reply({error:"PRIVATE_PACKAGE_UPLOAD_FAILED"},502);
   stored=await storage.download(objectPath);
  }
  if(stored.error||!stored.data)return reply({error:"PRIVATE_PACKAGE_READBACK_FAILED"},502);
  const readback=Buffer.from(await stored.data.arrayBuffer());
  const verifiedHash=createHash("sha256").update(readback).digest("hex");
  if(readback.length!==bytes.length||verifiedHash!==sha256)
   return reply({error:"PRIVATE_PACKAGE_HASH_MISMATCH"},502);

  const verifiedAt=new Date().toISOString();
  const {data:updated,error:updateError}=await admin.from("sasi_software_packages")
   .update({object_path:objectPath,sha256,sale_ready:true,verified_at:verifiedAt,updated_at:verifiedAt})
   .eq("product_id",product.id).eq("sale_ready",false)
   .eq("price_cny",product.priceCny).eq("price_usd",product.priceUsd)
   .select("product_id,sale_ready,verified_at,sha256").maybeSingle();
  if(updateError||!updated)return reply({error:"PACKAGE_READY_STATE_UPDATE_FAILED"},409);
  return reply({ok:true,productId:product.id,sha256,sizeBytes:bytes.length,verifiedAt:updated.verified_at,
   saleReady:true,sourceName:inspected.sourceName,guideName:inspected.guideName});
 }catch{return reply({error:"PACKAGE_UPLOAD_NOT_READY"},503)}
}
