import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: {
    name?: string;
    birthInput?: object;
    facts?: object;
    coreTypeName?: string;
    freeNarrative?: string;
    focus?: string;
    currentState?: string;
    energyLevel?: number;
    clarityLevel?: number;
    alignmentLevel?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("life_map_submissions")
    .insert({
      user_id: user.id,
      name: body.name || null,
      birth_input: body.birthInput,
      facts: body.facts,
      core_type_name: body.coreTypeName,
      free_narrative: body.freeNarrative,
      focus: body.focus,
      current_state: body.currentState,
      energy_level: body.energyLevel,
      clarity_level: body.clarityLevel,
      alignment_level: body.alignmentLevel,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "保存失败，请稍后再试。" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
