import {NextResponse} from "next/server";
import {getSiaiDirectoryRows} from "@/app/siai/catalog-data";

export const dynamic="force-dynamic";

/** Public, read-only distribution feed: verified catalogue only, never candidate previews. */
export async function GET(){
 const {curated}=getSiaiDirectoryRows();
 const rows=curated.map(row=>({
  id:row.id,
  name:row.name,
  category:row.category,
  website:/^https:\/\/[^\s]+$/i.test(row.website)?row.website:null,
  reviewedAt:row.checkedAt,
  free:row.freeSource?row.free:null,
  price:row.priceSource?row.price:null,
  region:row.regionSource?row.region:null,
  payment:row.paymentSource?row.payment:null
 })).sort((a,b)=>(b.reviewedAt||"").localeCompare(a.reviewedAt||"")||a.name.localeCompare(b.name));
 return NextResponse.json({
  schemaVersion:1,
  publisher:"LINGXIFIELD",
  title:"Global SI / AI / SIAI verified directory",
  site:"https://lingxifield.com/siai",
  total:rows.length,
  rows
 },{
  headers:{
   "Access-Control-Allow-Origin":"*",
   "Cache-Control":"public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
   "X-Content-Type-Options":"nosniff"
  }
 });
}
