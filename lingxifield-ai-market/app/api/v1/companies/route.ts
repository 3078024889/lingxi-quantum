import {NextResponse} from 'next/server';
import profiles from '../../../../data/company-profiles.json';
export const revalidate=86400;
export function GET(){return NextResponse.json({data:profiles,count:profiles.length,disclaimer:'Some fields are unverified. Null means no verified report is published.'},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400'}})}
