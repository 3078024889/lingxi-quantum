import {publishTelegramSlot} from "@/lib/telegram/publisher";
export {runtime, dynamic} from "@/lib/telegram/publisher";
export async function GET(request:Request){return publishTelegramSlot(request,"comparison")}
