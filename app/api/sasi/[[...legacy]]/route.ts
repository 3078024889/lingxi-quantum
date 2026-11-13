const retired = () => Response.json(
  { error: "SASI_CREATION_RETIRED", replacement: "/sasi" },
  { status: 410, headers: { "cache-control": "no-store" } }
);

const retiredHead = () => new Response(null, {
  status: 410,
  headers: { "cache-control": "no-store" }
});

export const GET = retired;
export const POST = retired;
export const PUT = retired;
export const PATCH = retired;
export const DELETE = retired;
export const OPTIONS = retired;
export const HEAD = retiredHead;
