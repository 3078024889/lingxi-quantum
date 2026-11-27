export const dynamic="force-dynamic";
function retired(){return Response.json({error:"SASI_CREATION_RETIRED",replacement:"/sasi"},{status:410,headers:{"Cache-Control":"no-store"}});}
export const GET=retired;
export const POST=retired;
