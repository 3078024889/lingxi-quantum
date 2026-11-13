const retired=()=>Response.json(
 {error:"SASI_CREATION_RETIRED"},
 {status:410,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow, noarchive"}}
);
export const GET=retired;
export const POST=retired;
export const PUT=retired;
export const PATCH=retired;
export const DELETE=retired;
export const OPTIONS=retired;
export const HEAD=()=>new Response(null,{status:410,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow, noarchive"}});
