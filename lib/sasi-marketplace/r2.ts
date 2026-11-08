import "server-only";
import {randomUUID} from "node:crypto";
import {presignSasiArtifact,sasiArtifactR2Ready} from "@/lib/sasi-kernel/artifact-store/r2";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TYPES:Readonly<Record<string,string>>={
  png:"image/png",jpg:"image/jpeg",webp:"image/webp",zip:"application/zip"
};
export type MarketplaceUploadKind="cover"|"detail"|"software";
const max:Record<MarketplaceUploadKind,number>={cover:1024*1024,detail:1024*1024,software:30*1024*1024};
export const MARKET_MEDIA_IMAGE_LIMIT=8;
export function marketplaceR2Ready(){return sasiArtifactR2Ready()}
export function marketplaceUploadLimit(kind:MarketplaceUploadKind){return max[kind];}
export function marketplaceMime(extension:string){return TYPES[extension.toLowerCase()]||null;}

export function newMarketplaceObjectKey(userId:string,listingId:string,kind:MarketplaceUploadKind,extension:string){
 if(!UUID.test(userId)||!UUID.test(listingId))throw Error("INVALID_MARKET_OWNER");
 const ext=extension.toLowerCase();
 if(kind==="software"&&ext!=="zip")throw Error("SOFTWARE_ZIP_ONLY");
 if(kind!=="software"&&!["png","jpg","webp"].includes(ext))throw Error("INVALID_IMAGE_TYPE");
 return `sasi/${userId}/market/${listingId}/${kind==="software"?"quarantine":"images"}/${randomUUID()}.${ext}`;
}
export function marketplaceOwnedKey(userId:string,listingId:string,key:string){
 if(!UUID.test(userId)||!UUID.test(listingId))throw Error("INVALID_MARKET_OWNER");
 const start=`sasi/${userId}/market/${listingId}/`;
 if(!key.startsWith(start)||key.includes("..")||key.includes("\\")||key.length>350)
 throw Error("MARKET_OBJECT_NOT_OWNED");
 return key;
}
export function signedMarketplaceUpload(key:string,seconds=180){
 return presignSasiArtifact(key,seconds,"PUT");
}
export function signedMarketplaceDownload(key:string,seconds=60){
 return presignSasiArtifact(key,seconds,"GET");
}
export async function marketplaceObjectHead(key:string){
 const url=presignSasiArtifact(key,45,"HEAD");
 const reply=await fetch(url,{method:"HEAD",cache:"no-store",signal:AbortSignal.timeout(7000)});
 if(!reply.ok)return null;
 const size=Number(reply.headers.get("content-length")||0);
 const type=reply.headers.get("content-type")||"";
 const sha256=reply.headers.get("x-amz-meta-sha256")||null;
 if(!Number.isSafeInteger(size)||size<1)return null;
 return {size,contentType:type,sha256};
}
