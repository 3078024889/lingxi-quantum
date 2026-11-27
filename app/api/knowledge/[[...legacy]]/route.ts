const retired = () => new Response(
  JSON.stringify({ error: "KNOWLEDGE_MODULE_RETIRED", replacement: "/tools" }),
  {
    status: 410,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  },
);
export const GET = retired;
export const HEAD = retired;
export const POST = retired;
export const PUT = retired;
export const PATCH = retired;
export const DELETE = retired;
export const OPTIONS = retired;
