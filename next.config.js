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
      { source: "/tools/url-to-video", destination: "/tools", permanent: true },
      { source: "/:lang(en|ja|ko|fr|de|es|pt|ar)/tools/url-to-video", destination: "/:lang/tools", permanent: true },
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

// Opt in only for the isolated Aliyun standalone artifact job. Normal Next/Cloudflare builds remain unchanged.
if (process.env.LINGXI_SELFHOST_BUILD === "1") nextConfig.output = "standalone";

module.exports = nextConfig;
