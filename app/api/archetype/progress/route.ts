import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureLifeArchetype, LIFE_ARCHETYPE_TRIBUTARIES, listLifeArchetypeSubjects } from "@/lib/mini/life-archetype";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authenticated: false, ready: false, completed: 0, tributaries: LIFE_ARCHETYPE_TRIBUTARIES.map((item) => ({ ...item, completed: false })) });
  try {
    const subjectId = new URL(req.url).searchParams.get("subjectId") || undefined;
    const subjects = await listLifeArchetypeSubjects(user.id);
    return NextResponse.json({ authenticated: true, subjects, ...(await ensureLifeArchetype(user.id, subjectId)) });
  } catch (error) {
    console.error("[archetype progress] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "生命原型进度暂未同步" }, { status: 500 });
  }
}
