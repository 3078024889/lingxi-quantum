import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({error: "VIDEO_BYOK_REQUIRED", destination: "/sasi/drama"}, {status: 410});
}
