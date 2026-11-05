import {publishTelegramSlot} from "@/lib/telegram/publisher";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request:Request){return publishTelegramSlot(request,"comparison")}
