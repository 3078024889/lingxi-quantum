export type SeriesShot = { episode: number; prompt: string; duration: number; assetIds: string[] };
/** Bounds apply before any quote is saved or supplier call is made. */
export function validateSeriesShots(value: unknown, maxDuration: number): SeriesShot[] {
  if (!Array.isArray(value) || !value.length || value.length > 500) throw new Error("SERIES_REQUIRES_1_TO_500_SHOTS");
  let total = 0;
  const episodeSeconds=new Map<number,number>();
  const shots = value.map(s => {
    if (!s || !Number.isInteger(s.episode) || s.episode < 1 || s.episode > 50 || typeof s.prompt !== "string"
      || s.prompt.trim().length < 8 || s.prompt.length > 3000 || !Number.isInteger(s.duration) || s.duration < 4 || s.duration > maxDuration
      || !Array.isArray(s.assetIds ?? []) || (s.assetIds ?? []).some((id: unknown) => typeof id !== "string")) throw new Error("INVALID_SERIES_SHOT");
    total += s.duration;
    const seconds=(episodeSeconds.get(s.episode)||0)+s.duration;
    if(seconds>120)throw new Error('EPISODE_EXCEEDS_120_SECONDS');
    episodeSeconds.set(s.episode,seconds);
    return { episode: s.episode, prompt: s.prompt.trim(), duration: s.duration, assetIds: s.assetIds ?? [] };
  });
  if (total > 3600) throw new Error("SERIES_EXCEEDS_3600_SECONDS");
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
