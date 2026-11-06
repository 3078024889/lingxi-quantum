/** @type {import('next').NextConfig} */
// First-stage enforced CSP: blocks high-confidence browser injection vectors.
// Keep the detailed site-wide script/connect allowlist in Report-Only until
// checked against PayPal, WeChat, media workers and all nine language routes.
const enforcedCsp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "script-src-attr 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: ["default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'", "form-action 'self'", "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com", "script-src-attr 'none'", "worker-src 'self' blob:", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' data: https://fonts.gstatic.com", "img-src 'self' data: blob: https:", "media-src 'self' blob: https:", "connect-src 'self' https: wss:", "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://open.weixin.qq.com https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google", "upgrade-insecure-requests"].join(String.fromCharCode(59) + " ") },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  // Self-hosted .cn build only: Vercel must keep its regular output mode.
  ...(process.env.LINGXI_SELFHOST_BUILD === "1" ? { output: "standalone" } : {}),
  // The ECS .cn standalone process spawns a separate Node process for engine probes.
  // These runtime imports are intentionally dynamic and cannot be discovered by nft.
  // Copy only lightweight document/web dependencies, never heavyweight Python/ML packages.
  outputFileTracingIncludes:{'/api/tools/engine/health':[
    './node_modules/mammoth/**/*',
    './node_modules/exceljs/**/*',
    './node_modules/@mozilla/readability/**/*',
    './node_modules/dompurify/**/*',
    './node_modules/turndown/**/*',
  ],'/api/sasi/**':['./scripts/runtime/verify-generated-video.cjs','./scripts/runtime/assemble-generated-episode.cjs','./node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js','./node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm'],'/api/internal/sasi/**':['./scripts/runtime/verify-generated-video.cjs','./scripts/runtime/assemble-generated-episode.cjs','./node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js','./node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm']},
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/mini-products/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://mp.weixin.qq.com" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/siai/:lang/:id", destination: "/siai", permanent: true },
      { source: "/tools/image-to-pdf-pro", destination: "/tools/image-to-pdf", permanent: true },
      { source: "/:lang(en|ja|ko|fr|de|es|pt|ar)/tools/image-to-pdf-pro", destination: "/:lang/tools/image-to-pdf", permanent: true },
      { source: "/tools/pdf-sign", destination: "/tools/e-sign-pdf", permanent: true },
      { source: "/tools/pdf-signature", destination: "/tools/e-sign-pdf", permanent: true },
      { source: "/tools/electronic-signature", destination: "/tools/e-sign-pdf", permanent: true },
      { source: "/tools/electronic-seal", destination: "/tools/e-sign-pdf", permanent: true },
      { source: "/tools/pdf-stamp", destination: "/tools/e-sign-pdf", permanent: true },
    ];
  },
};

module.exports = nextConfig;
