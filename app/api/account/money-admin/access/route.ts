import {NextResponse} from 'next/server';
import {moneyAdministrator} from '@/lib/money/operator-settings';
export const dynamic='force-dynamic';
export async function GET(){
 try{return NextResponse.json({isAdmin:Boolean(await moneyAdministrator())},{headers:{'Cache-Control':'private, no-store'}});}
 catch{return NextResponse.json({isAdmin:false},{status:503,headers:{'Cache-Control':'private, no-store'}});}
}
