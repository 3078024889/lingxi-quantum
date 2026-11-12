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
const SOURCE_PRODUCT_ID="sasi-copernicus-si95-source";
const ZERO_SHA256="0".repeat(64);
const MAX_FILE_BYTES=30*1024*1024;
const MAX_UNPACKED_BYTES=60*1024*1024;
const MAX_ENTRIES=100;
const ALLOWED_EXTENSIONS=new Set([".mq5",".mqh",".set",".pdf",".md",".txt"]);
const HEADERS={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:HEADERS});
async function reviewer(){try{return await moneyAdministrator()}catch{return null}}
async function privateBucketReady(admin:ReturnType<typeof createAdminClient>){
 try{
  const {data,error}=await admin.storage.getBucket(BUCKET);
  return !error&&data?.public===false&&Number(data.file_size_limit)>=MAX_FILE_BYTES&&
   Array.isArray(data.allowed_mime_types)&&data.allowed_mime_types.includes("application/zip");
 }catch{return false}
}

type ZipEntryMeta={unsafeOriginalName?:string;unixPermissions?:number|string;_data?:{uncompressedSize?:number}};

async function inspectPackage(bytes:Buffer){
 if(bytes.length<100||bytes.subarray(0,4).toString("hex")!=="504b0304")
  return {ok:false as const,error:"ZIP_SIGNATURE_INVALID"};
 let zip:JSZip;
 try{zip=await JSZip.loadAsync(bytes,{checkCRC32:true,createFolders:false})}
 catch{return {ok:false as const,error:"ZIP_ARCHIVE_INVALID"}}
 const entries=Object.entries(zip.files).filter(([,entry])=>!entry.dir);
 if(entries.length<2||entries.length>MAX_ENTRIES)return {ok:false as const,error:"ZIP_ENTRY_COUNT_INVALID"};
 const names=new Set<string>();
 let unpacked=0;
 const sources:Array<{name:string;entry:JSZip.JSZipObject;size:number}>=[];
 const guides:Array<{name:string;entry:JSZip.JSZipObject;size:number}>=[];
 const whitepapers:Array<{name:string;entry:JSZip.JSZipObject;size:number}>=[];
 for(const [key,entry] of entries){
  const meta=entry as unknown as ZipEntryMeta;
  const name=String(meta.unsafeOriginalName||key);
  const normalized=name.replace(/\\/g,"/");
  const parts=normalized.split("/");
  if(!name||name.length>240||normalized.startsWith("/")||parts.some(x=>x===".."||x==="")||
    normalized.includes(String.fromCharCode(0))||normalized.startsWith("__MACOSX/")||normalized.endsWith("/.DS_Store"))
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
  if(ext===".pdf")whitepapers.push({name:normalized,entry,size});
  if((ext===".md"||ext===".txt")&&/(readme|install|guide|manual|说明|教程)/i.test(normalized))
   guides.push({name:normalized,entry,size});
 }
 if(sources.length!==1)return {ok:false as const,error:"ONE_9_5_SOURCE_REQUIRED"};
 if(whitepapers.length!==1)return {ok:false as const,error:"ONE_WHITEPAPER_PDF_REQUIRED"};
 const source=sources[0];
 const whitepaper=whitepapers[0];
 if(whitepaper.size<256||whitepaper.size>20*1024*1024)return {ok:false as const,error:"WHITEPAPER_SIZE_INVALID"};
 let pdfHeader:Buffer;
 try{pdfHeader=await whitepaper.entry.async("nodebuffer")}
 catch{return {ok:false as const,error:"WHITEPAPER_READ_FAILED"}}
 if(pdfHeader.subarray(0,5).toString("ascii")!=="%PDF-")return {ok:false as const,error:"WHITEPAPER_FORMAT_INVALID"};
 if(source.size<100||source.size>5*1024*1024)return {ok:false as const,error:"SOURCE_SIZE_INVALID"};
 let sourceText="";
 try{sourceText=(await source.entry.async("nodebuffer")).toString("utf8").replace(/^﻿/,"")}
 catch{return {ok:false as const,error:"SOURCE_READ_FAILED"}}
 if(!/#property\s+version\s+["']9\.50["']/i.test(sourceText)||
   !/\bOnTick\s*\(/.test(sourceText))
  return {ok:false as const,error:"COPERNICUS_9_5_SOURCE_MISMATCH"};
 const guide=guides.sort((a,b)=>b.size-a.size)[0];
 if(!guide||guide.size<160||guide.size>512*1024)return {ok:false as const,error:"INSTALL_GUIDE_REQUIRED"};
 let guideText="";
 try{guideText=(await guide.entry.async("nodebuffer")).toString("utf8")}
 catch{return {ok:false as const,error:"INSTALL_GUIDE_READ_FAILED"}}
 if(!/(安装|install)/i.test(guideText)||!/(编译|compile)/i.test(guideText)||!/(授权|许可|license)/i.test(guideText)||!/(F7|参数)/i.test(guideText))
  return {ok:false as const,error:"INSTALL_COMPILE_F7_AND_LICENSE_GUIDE_REQUIRED"};
 return {ok:true as const,sourceName:source.name,whitepaperName:whitepaper.name,guideName:guide.name,entryCount:entries.length,unpackedBytes:unpacked};
}


type PackageRow={product_id:string;price_cny:number|string;price_usd:number|string;bucket:string;sale_ready:boolean;verified_at:string|null;sha256:string|null;object_path:string|null};
async function verifyStoredPackage(admin:ReturnType<typeof createAdminClient>,product:typeof SASI_SOFTWARE_CATALOG[number],row:PackageRow){
 if(!row.verified_at||!row.sha256||row.sha256===ZERO_SHA256||! /^[a-f0-9]{64}$/.test(row.sha256))return null;
 const expectedPath="first-party/"+product.id+"/"+row.sha256+".zip";
 if(row.object_path!==expectedPath||row.bucket!==BUCKET)return null;
 try{
  const {data,error}=await admin.storage.from(BUCKET).download(expectedPath);
  if(error||!data)return null;
  const bytes=Buffer.from(await data.arrayBuffer());
  const actualHash=createHash("sha256").update(bytes).digest("hex");
  if(actualHash!==row.sha256)return null;
  const inspected=await inspectPackage(bytes);
  if(!inspected.ok)return null;
  return {sizeBytes:bytes.length,sourceName:inspected.sourceName,
   whitepaperName:inspected.whitepaperName,guideName:inspected.guideName,};
 }catch{return null}
}

export async function GET(){
 const user=await reviewer();
 if(!user)return reply({error:"NOT_FOUND"},404);
 try{
  const admin=createAdminClient();
  const bucketReady=await privateBucketReady(admin);
  const ids=SASI_SOFTWARE_CATALOG.map(x=>x.id);
  const {data,error}=await admin.from("sasi_software_packages")
   .select("product_id,price_cny,price_usd,bucket,sale_ready,verified_at,sha256,object_path")
   .in("product_id",ids);
  if(error)return reply({error:"PACKAGE_STATUS_UNAVAILABLE"},503);
  const rows=new Map((data||[]).map(x=>[x.product_id,x]));
  const products=[];
  for(const product of SASI_SOFTWARE_CATALOG){
   const row=rows.get(product.id) as PackageRow|undefined;
   const priceMatches=Boolean(row&&Number(row.price_cny)===product.priceCny&&Number(row.price_usd)===product.priceUsd);
   const integrity=row&&bucketReady&&priceMatches?await verifyStoredPackage(admin,product,row):null;
   products.push({productId:product.id,title:product.titleZh,priceCny:product.priceCny,priceUsd:product.priceUsd,
    exists:Boolean(row),saleReady:Boolean(row?.sale_ready),verifiedAt:row?.verified_at||null,
    sha256Prefix:row?.sha256&&row.sha256!==ZERO_SHA256?String(row.sha256).slice(0,12):null,
    priceMatches,privateBucket:row?.bucket===BUCKET&&bucketReady,
    packageVerified:Boolean(integrity),integrityOk:Boolean(integrity),sizeBytes:integrity?.sizeBytes||null});
  }
  return reply({products});
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
 const action=String(form.get("action")||"upload");
 const productId=String(form.get("productId")||"");
 const product=SASI_SOFTWARE_CATALOG.find(x=>x.id===productId&&x.id===SOURCE_PRODUCT_ID&&x.kind==="source");
 if(!product)return reply({error:"SOURCE_PRODUCT_ONLY"},400);
 if(action!=="upload"&&action!=="activate")return reply({error:"ACTION_NOT_SUPPORTED"},400);
 try{
  const admin=createAdminClient();
  if(!await privateBucketReady(admin))return reply({error:"PRIVATE_BUCKET_CONFIG_INVALID"},503);
  const {data:record,error:recordError}=await admin.from("sasi_software_packages")
   .select("product_id,price_cny,price_usd,bucket,sale_ready,verified_at,sha256,object_path")
   .eq("product_id",product.id).maybeSingle();
  if(recordError||!record)return reply({error:"PACKAGE_RECORD_MISSING"},503);
  if(record.bucket!==BUCKET||Number(record.price_cny)!==product.priceCny||Number(record.price_usd)!==product.priceUsd)
   return reply({error:"PACKAGE_PRICE_OR_BUCKET_MISMATCH"},409);
  if(record.sale_ready)return reply({error:"PACKAGE_ALREADY_ACTIVE"},409);

  if(action==="activate"){
   const verified=await verifyStoredPackage(admin,product,record as PackageRow);
   if(!verified)return reply({error:"PRIVATE_PACKAGE_INTEGRITY_CHECK_FAILED"},409);
   const activatedAt=new Date().toISOString();
   const {data:activated,error:activateError}=await admin.from("sasi_software_packages")
    .update({sale_ready:true,updated_at:activatedAt})
    .eq("product_id",product.id).eq("sale_ready",false)
    .eq("sha256",record.sha256).eq("object_path",record.object_path).eq("verified_at",record.verified_at)
    .select("product_id,sale_ready,verified_at,sha256").maybeSingle();
   if(activateError||!activated)return reply({error:"PACKAGE_ACTIVATION_CONFLICT"},409);
   return reply({ok:true,productId:product.id,sha256:activated.sha256,verifiedAt:activated.verified_at,
    packageVerified:true,saleReady:true,sizeBytes:verified.sizeBytes});
  }

  if(record.verified_at||record.sha256!==ZERO_SHA256||String(record.object_path||"").startsWith("first-party/"))
   return reply({error:"PACKAGE_ALREADY_VERIFIED"},409);
  const candidate=form.get("package");
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
  const objectPath="first-party/"+product.id+"/"+sha256+".zip";
  const storage=admin.storage.from(BUCKET);
  let stored=await storage.download(objectPath);
  if(stored.error){
   const uploaded=await storage.upload(objectPath,bytes,{contentType:"application/zip",cacheControl:"0",upsert:false});
   if(uploaded.error){
    stored=await storage.download(objectPath);
    if(stored.error)return reply({error:"PRIVATE_PACKAGE_UPLOAD_FAILED"},502);
   }else{
    stored=await storage.download(objectPath);
   }
  }
  if(stored.error||!stored.data)return reply({error:"PRIVATE_PACKAGE_READBACK_FAILED"},502);
  const readback=Buffer.from(await stored.data.arrayBuffer());
  const verifiedHash=createHash("sha256").update(readback).digest("hex");
  if(readback.length!==bytes.length||verifiedHash!==sha256)
   return reply({error:"PRIVATE_PACKAGE_HASH_MISMATCH"},502);
  const readbackInspection=await inspectPackage(readback);
  if(!readbackInspection.ok)return reply({error:"PRIVATE_PACKAGE_CONTENT_CHECK_FAILED"},502);

  const verifiedAt=new Date().toISOString();
  const {data:updated,error:updateError}=await admin.from("sasi_software_packages")
   .update({object_path:objectPath,sha256,sale_ready:false,verified_at:verifiedAt,updated_at:verifiedAt})
   .eq("product_id",product.id).eq("sale_ready",false).eq("sha256",ZERO_SHA256)
   .is("verified_at",null).eq("object_path",record.object_path)
   .eq("price_cny",product.priceCny).eq("price_usd",product.priceUsd)
   .select("product_id,sale_ready,verified_at,sha256").maybeSingle();
  if(updateError||!updated)return reply({error:"PACKAGE_READY_STATE_UPDATE_FAILED"},409);
  return reply({ok:true,productId:product.id,sha256,sizeBytes:bytes.length,verifiedAt:updated.verified_at,
   packageVerified:true,reviewRequired:true,saleReady:false,sourceName:readbackInspection.sourceName,
    whitepaperName:readbackInspection.whitepaperName,
   guideName:readbackInspection.guideName,});
 }catch{return reply({error:"PACKAGE_UPLOAD_NOT_READY"},503)}
}
