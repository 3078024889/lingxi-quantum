/** @type {import('next').NextConfig} */
const isEcsCandidate=process.env.LINGXI_MARKET_ECS_CANDIDATE==="1";
module.exports={
 outputFileTracingRoot:__dirname,
 reactStrictMode:true,
 poweredByHeader:false,
 productionBrowserSourceMaps:false,
 async redirects(){
  // Host-specific canonical redirect: never run on .cn or workers.dev.
  // Next.js supports statusCode 301 with a host matcher.
  return [{
   source:'/:path*',
   has:[{type:'host',value:'www.globalsiai.com'}],
   destination:'https://globalsiai.com/:path*',
   statusCode:301
  }];
 },

 ...(isEcsCandidate?{output:"standalone"}:{})
};
