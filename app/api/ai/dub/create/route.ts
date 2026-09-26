import {NextResponse} from "next/server";
export async function POST(){return NextResponse.json({error:"THIS_PATH_IS_NO_LONGER_THE_DEFAULT_EXECUTION_PATH"},{status:410})}
export async function GET(){return NextResponse.json({error:"THIS_PATH_IS_NO_LONGER_THE_DEFAULT_EXECUTION_PATH"},{status:410})}
