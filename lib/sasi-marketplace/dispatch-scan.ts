import "server-only";
/**
 * GitHub repository_dispatch only executes after the workflow is installed
 * on the default branch and its isolated scanner environment is configured.
 * Missing/failed dispatch leaves the listing QUARANTINED for manual retry.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function dispatchMarketplaceScan(listingId:string):Promise<boolean>{
 const token=process.env.GITHUB_MARKET_SCAN_DISPATCH_TOKEN?.trim();
 if(!token||!UUID.test(listingId))return false;
 try{
  const response=await fetch("https://api.github.com/repos/3078024889/lingxi-quantum/dispatches",{
   method:"POST",
   headers:{
    Authorization:"Bearer "+token,
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2022-11-28",
    "Content-Type":"application/json"
   },
   body:JSON.stringify({event_type:"sasi-market-scan",client_payload:{listing_id:listingId}}),
   cache:"no-store",signal:AbortSignal.timeout(7000)
  });
  return response.status===204;
 }catch{return false;}
}
