// Read-only isolated Worker to reproduce the exact public catalog fetch outside OpenNext.
import {publicMarketListings} from "../../scripts/cloudflare/public-market-listings.mjs";
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path!=="/market"||request.method!=="GET")return new Response("Not found",{status:404});
  const pub=new Request("https://lingxifield.com/api/sasi/marketplace/listings",{method:"GET"});
  return await publicMarketListings(pub,env);
 }
};
