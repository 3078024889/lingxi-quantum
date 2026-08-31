import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptMiniSecret } from "@/lib/mini/crypto";

export const runtime = "nodejs";
const BUCKET = "report-pdfs";
const MAX_BYTES = 48 * 1024 * 1024;

const cleanName = (value: unknown) => typeof value === "string"
  ? value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim().slice(0, 96) || "灵犀场报告.pdf"
  : "灵犀场报告.pdf";

async function ensureBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    const created = await admin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: MAX_BYTES, allowedMimeTypes: ["application/pdf"] });
    if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
  }
  return admin;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请重新进入已开启的场域档案" }, { status: 401 });
  try {
    const body = await req.json() as { action?: unknown; fileName?: unknown; size?: unknown; path?: unknown };
    const fileName = cleanName(body.fileName);
    const admin = await ensureBucket();
    if (body.action === "prepare") {
      const size = Number(body.size);
      if (!Number.isFinite(size) || size < 100 || size > MAX_BYTES) return NextResponse.json({ error: "PDF 文件大小超出微信保存范围" }, { status: 400 });
      const path = `${user.id}/${Date.now()}-${randomUUID()}.pdf`;
      const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data?.token) throw error ?? new Error("missing upload token");
      return NextResponse.json({ bucket: BUCKET, path, token: data.token }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action === "finalize" && typeof body.path === "string" && body.path.startsWith(`${user.id}/`) && body.path.endsWith(".pdf")) {
      const ticket = encryptMiniSecret(JSON.stringify({ bucket: BUCKET, path: body.path, fileName, userId: user.id, expiresAt: Date.now() + 10 * 60 * 1000 }));
      const origin = new URL(req.url).origin;
      return NextResponse.json({ downloadUrl: `${origin}/api/wechat/mini/pdf-download?ticket=${encodeURIComponent(ticket)}` }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "PDF 中转请求无效" }, { status: 400 });
  } catch (error) {
    console.error("[pdf transfer] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "PDF 已生成，但微信保存通道暂未完成" }, { status: 500 });
  }
}
