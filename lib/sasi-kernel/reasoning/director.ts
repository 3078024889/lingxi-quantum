export type DirectorBrief = {
  title?: string;
  story: string;
  durationSec?: number;
  ratio?: "9:16" | "16:9" | "1:1";
  tone?: string;
  audience?: string;
};

export function buildDirectorReasoningPrompt(input: DirectorBrief) {
  const duration = Math.max(5, Math.min(300, Number(input.durationSec) || 30));
  const ratio = input.ratio ?? "9:16";
  return [
    "你是灵犀场 SASI 的导演规划核心。",
    "你的任务不是复述故事，而是把故事理解成可执行的影视创作计划。",
    "只输出严格 JSON，不输出 Markdown。",
    "必须包含：logline、characters、locations、props、beats、shots、continuity、risks。",
    "shots 每项包含：id、durationSec、purpose、subject、action、location、framing、camera、lighting、mood、dialogue、visualPrompt、continuityRefs。",
    "镜头要遵循空间建立→人物关系→动作推进→情绪变化→信息揭示，不得机械轮换景别。",
    "同一人物必须维持外貌、服装、年龄、发型和关键道具一致。",
    `目标时长约 ${duration} 秒，画幅 ${ratio}。`,
    input.tone ? `整体气质：${input.tone}` : "",
    input.audience ? `目标观众：${input.audience}` : "",
    `故事：${input.story.slice(0, 16000)}`,
  ].filter(Boolean).join("\n");
}

export function parseDirectorJson(text: string) {
  const trimmed = String(text ?? "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim() ?? trimmed;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("SASI_DIRECTOR_JSON_MISSING");
  const parsed = JSON.parse(fenced.slice(start, end + 1)) as Record<string, unknown>;
  if (!Array.isArray(parsed.shots) || parsed.shots.length === 0) throw new Error("SASI_DIRECTOR_SHOTS_MISSING");
  return parsed;
}
