import { NextResponse } from 'next/server';
import { platforms } from '../../../../lib/data';
export const revalidate = 86400;
export function GET(){return NextResponse.json({data:platforms.map(({id,name,company,category,website,features,year,location})=>({id,name,company,category,website,features,year,location})),count:platforms.length,ranking:false,disclaimer:'Catalog order is not a verified ranking.'});}
