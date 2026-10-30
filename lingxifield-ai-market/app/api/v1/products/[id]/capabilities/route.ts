import {NextResponse} from 'next/server';
import {findPlatform} from '../../../../../lib/platform-repository';
import {capabilityProfile} from '../../../../../lib/capability-profiles';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=7200'};
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id))return NextResponse.json({error:'INVALID_PRODUCT_ID'},{status:400,headers});
 const product=findPlatform(id);
 if(!product)return NextResponse.json({error:'NOT_FOUND'},{status:404,headers});
 const curated=capabilityProfile(id);
 return NextResponse.json({
  productId:id,productName:product.name,
  status:curated?'publisher_sourced_profile':'capability_sources_needed',
  verifiedIndependentBenchmark:false,
  authenticatedUserRequired:false,
  profile:curated||null,
  warning:curated?'Manufacturer features are source-linked, not independent comparative tests.':'Function labels cannot substitute for reviewed first-party source descriptions.'
 },{headers});
}
