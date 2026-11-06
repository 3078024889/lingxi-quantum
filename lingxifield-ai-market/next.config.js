/** @type {import('next').NextConfig} */
const isEcsCandidate = process.env.LINGXI_MARKET_ECS_CANDIDATE === "1";
module.exports = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Produces an independent Node.js release artifact only for the ECS gate.
  // The existing Vercel project retains its original build behavior.
  ...(isEcsCandidate ? { output: "standalone" } : {}),
};
