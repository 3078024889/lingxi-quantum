export type SeriesShot = { episode: number; prompt: string; duration: number; assetIds: string[] };
/** Bounds apply before any quote is saved or supplier call is made. */
export function validateSeriesShots(value: unknown, maxDuration: number): SeriesShot[] {
  if (!Array.isArray(value) || !value.length || value.length > 60) throw new Error("SERIES_REQUIRES_1_TO_60_SHOTS");
  let total = 0;
  const shots = value.map(s => {
    if (!s || !Number.isInteger(s.episode) || s.episode < 1 || s.episode > 30 || typeof s.prompt !== "string"
      || s.prompt.trim().length < 8 || s.prompt.length > 3000 || !Number.isInteger(s.duration) || s.duration < 4 || s.duration > maxDuration
      || !Array.isArray(s.assetIds ?? []) || (s.assetIds ?? []).some((id: unknown) => typeof id !== "string")) throw new Error("INVALID_SERIES_SHOT");
    total += s.duration;
    return { episode: s.episode, prompt: s.prompt.trim(), duration: s.duration, assetIds: s.assetIds ?? [] };
  });
  if (total > 600) throw new Error("SERIES_EXCEEDS_600_SECONDS");
  return shots;
}
export function episodeBudgets(shots: { episode: number; duration: number; estimatedFen: number }[]) {
  const result: Record<number, { seconds: number; fen: number; shots: number }> = {};
  for (const s of shots) {
    const e = result[s.episode] ??= { seconds: 0, fen: 0, shots: 0 };
    e.seconds += s.duration; e.fen += s.estimatedFen; e.shots++;
  }
  return result;
}
