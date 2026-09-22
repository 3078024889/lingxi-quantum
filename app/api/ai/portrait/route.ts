import { NextResponse } from 'next/server';
export const runtime='nodejs'; export const maxDuration=120;
export async function POST(req:Request){
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'OPENAI_NOT_CONFIGURED'},{status:503});
  const inForm=await req.formData(); const file=inForm.get('file'); const style=String(inForm.get('style')||'professional studio portrait');
  if(!(file instanceof File))return NextResponse.json({error:'FILE_REQUIRED'},{status:400});
  const out=new FormData(); out.set('model',process.env.OPENAI_IMAGE_MODEL||'gpt-image-2'); out.set('image',file,file.name); out.set('prompt',`Create a polished ${style}. Preserve the same person and recognizable facial identity. Natural skin texture, clean lighting, no logos, no text.`); out.set('size','1024x1024');
  const r=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:out}); const data=await r.json(); if(!r.ok)return NextResponse.json({error:'IMAGE_FAILED',detail:data},{status:502});
  const item=data.data?.[0]; return NextResponse.json({b64:item?.b64_json||null,url:item?.url||null});
}
