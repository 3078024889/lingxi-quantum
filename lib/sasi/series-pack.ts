import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

export type SeriesPackSummary = {
  slug: string;
  title: string;
  path: string;
  episodeCount: number;
  hasFoundryIngest: boolean;
};

const ROOT = join(process.cwd(), "content", "cangxuan-feed");

export function listCangxuanSeriesPacks(): SeriesPackSummary[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const path = join(ROOT, d.name);
      const bible = join(path, "00-SERIES-BIBLE.md");
      const episodesDir = join(path, "episodes");
      const title = existsSync(bible)
        ? (readFileSync(bible, "utf8").match(/^#\s*[《]?([^》\n]+)[》]?/)?.[1] ?? d.name)
        : d.name;
      const episodeCount = existsSync(episodesDir)
        ? readdirSync(episodesDir).filter((f) => /^E\d+\.md$/i.test(f)).length
        : 0;
      return {
        slug: d.name,
        title: title.replace(/（.*）/, "").trim(),
        path,
        episodeCount,
        hasFoundryIngest: existsSync(join(path, "foundry-ingest", "00-manifest.json")),
      };
    });
}

export function readSeriesBible(slug: string) {
  const p = join(ROOT, slug, "00-SERIES-BIBLE.md");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

export function readSeriesEpisode(slug: string, episode: number) {
  const p = join(ROOT, slug, "episodes", `E${String(episode).padStart(2, "0")}.md`);
  if (!existsSync(p)) {
    const alt = join(ROOT, slug, "episodes", `E${episode}.md`);
    if (!existsSync(alt)) return null;
    return readFileSync(alt, "utf8");
  }
  return readFileSync(p, "utf8");
}

export function readFoundryIngestJson<T = unknown>(slug: string, file: string): T | null {
  const p = join(ROOT, slug, "foundry-ingest", file);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}
