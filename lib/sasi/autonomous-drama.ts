export type AutonomousDramaShot = {
  id: string;
  index: number;
  text: string;
  character: string;
  scene: string;
  framing: string;
  camera: string;
  startMs: number;
  endMs: number;
};

function splitBeats(script: string) {
  return script
    .replace(/\r/g, "")
    .split(/(?<=[。！？!?；;])|\n+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 80);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function extractCharacters(script: string) {
  const patterns = [
    /([\u3400-\u9fff]{2,4})(?=[：:])/g,
    /([\u3400-\u9fff]{2,4})(?=(?:说|问|喊|答|笑|哭|看向|走向|拿起|放下|转身))/g,
  ];
  const names: string[] = [];
  for (const re of patterns) {
    for (const m of script.matchAll(re)) {
      const name = m[1];
      if (!/^(然后|但是|所以|因为|如果|已经|突然|一个|这个|那个|他们|她们|我们|自己)$/.test(name)) names.push(name);
    }
  }
  return unique(names).slice(0, 8);
}

function sceneForBeat(beat: string, index: number) {
  const hit = beat.match(/(?:在|来到|走进|回到|进入)([^，。！？!?；;]{2,16})/);
  if (hit?.[1]) return hit[1].trim();
  const keywords = ["房间", "办公室", "学校", "教室", "医院", "街道", "餐厅", "车站", "机场", "公园", "商场", "家里", "公司", "走廊", "电梯", "车里", "夜里"];
  const keyword = keywords.find((x) => beat.includes(x));
  return keyword || `场景 ${index + 1}`;
}

function characterForBeat(beat: string, names: string[]) {
  return names.find((name) => beat.includes(name)) || names[0] || "主要人物";
}

export function buildAutonomousDrama(script: string, opts?: { secondsPerShot?: number }) {
  const text = String(script || "").trim();
  if (!text) throw new Error("SCRIPT_REQUIRED");

  const beats = splitBeats(text);
  if (!beats.length) throw new Error("SCRIPT_HAS_NO_BEATS");
  const characters = extractCharacters(text);
  const seconds = Math.max(2, Math.min(8, Number(opts?.secondsPerShot || 4)));

  const framings = ["中景", "近景", "过肩", "全景", "特写"];
  const cameras = ["缓慢推近", "固定机位", "轻微横移", "跟随人物", "静止后切近景"];

  const shots: AutonomousDramaShot[] = beats.map((beat, index) => {
    const startMs = Math.round(index * seconds * 1000);
    const endMs = Math.round((index + 1) * seconds * 1000);
    return {
      id: `SH${String(index + 1).padStart(2, "0")}`,
      index,
      text: beat,
      character: characterForBeat(beat, characters),
      scene: sceneForBeat(beat, index),
      framing: framings[index % framings.length],
      camera: cameras[index % cameras.length],
      startMs,
      endMs,
    };
  });

  const scenes = unique(shots.map((s) => s.scene));
  const totalMs = shots.at(-1)?.endMs ?? 0;

  return {
    ok: true as const,
    engine: "lingxifield-autonomous-drama-v1",
    externalApiRequired: false,
    characters,
    scenes,
    shots,
    totalMs,
    subtitleSrt: shots
      .map((shot, i) => `${i + 1}\n${srtTime(shot.startMs)} --> ${srtTime(shot.endMs)}\n${shot.text}\n`)
      .join("\n"),
  };
}

function srtTime(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const n = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(n).padStart(3, "0")}`;
}
