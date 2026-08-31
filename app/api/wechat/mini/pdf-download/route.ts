import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptMiniSecret } from "@/lib/mini/crypto";

export const runtime = "nodejs";
type Ticket = { bucket: string; path: string; fileName: string; userId: string; expiresAt: number };

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("ticket");
  if (!raw || raw.length > 4096) return NextResponse.json({ error: "PDF 下载凭证无效" }, { status: 400 });
  try {
    const ticket = JSON.parse(decryptMiniSecret(raw)) as Ticket;
    if (ticket.bucket !== "report-pdfs" || ticket.expiresAt < Date.now() || !ticket.path.startsWith(`${ticket.userId}/`) || !ticket.path.endsWith(".pdf")) {
      return NextResponse.json({ error: "PDF 下载凭证已失效" }, { status: 403 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(ticket.bucket).download(ticket.path);
    if (error || !data) throw error ?? new Error("missing pdf");
    const bytes = await data.arrayBuffer();
    const { error: cleanupError } = await admin.storage.from(ticket.bucket).remove([ticket.path]);
    if (cleanupError) console.warn("[mini pdf download] cleanup failed", cleanupError.message);
    return new NextResponse(bytes, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(ticket.fileName)}`,
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Length": String(bytes.byteLength),
    } });
  } catch (error) {
    console.error("[mini pdf download] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "PDF 文件暂不可用" }, { status: 404 });
  }
}
