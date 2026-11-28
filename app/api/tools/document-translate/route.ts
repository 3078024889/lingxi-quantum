import {NextResponse} from 'next/server';
export const runtime='nodejs';
/** Old tabs receive a clear retirement response. Never call a cloud model. */
export async function POST(){
 return NextResponse.json({error:'LOCAL_PROCESSING_REQUIRED',message:'请刷新页面，在设备上处理文件。'}, {status:410,headers:{'Cache-Control':'no-store'}});
}
