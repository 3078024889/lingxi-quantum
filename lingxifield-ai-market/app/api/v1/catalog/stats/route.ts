import {NextResponse} from 'next/server';
import {entries} from '../../../../../lib/catalog-store';
import {catalogQuality} from '../../../../../lib/catalog-quality.mjs';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({version:'2.7',...catalogQuality(entries)},{headers:{'Cache-Control':'public, s-maxage=300'}})}
