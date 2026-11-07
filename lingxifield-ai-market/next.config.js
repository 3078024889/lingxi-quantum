/** @type {import('next').NextConfig} */
const isEcsCandidate=process.env.LINGXI_MARKET_ECS_CANDIDATE==="1";
module.exports={
 outputFileTracingRoot:__dirname,
 reactStrictMode:true,
 poweredByHeader:false,
 productionBrowserSourceMaps:false,
 ...(isEcsCandidate?{output:"standalone"}:{})
};
