import {NextResponse} from 'next/server';
import experiences from '../../../../data/user-experiences.json';
type Experience={id:string;platformId:string;summary:string;sourceUrl:string;publishedOn:string;kind:string;status:string;region:string};
export const revalidate=3600;
export function GET(request:Request){const url=new URL(request.url);const id=url.searchParams.get('platformId');const data=(experiences as Experience[]).filter(x=>x.status==='verified' && (!id||x.platformId===id));return NextResponse.json({data,count:data.length,disclaimer:'Only source-linked, verified experiences are published.'})}
