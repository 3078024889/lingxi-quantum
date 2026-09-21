#!/usr/bin/env node
/** Resilient multi-source wholesale → batch-multi-003 (real fetch only; no fabrication; skip Wikipedia live) */
import { createHash } from "crypto";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = {
  "User-Agent": "LingxiField-TongshiBot/1.0 (educational; lingxifield.com)",
  Accept: "application/json",
};

function item({ prop, ctx, evid, disc, src, url, title, conf = 0.8, tier = "bronze" }) {
  const proposition = String(prop).replace(/\s+/g, " ").trim().slice(0, 1000);
  if (proposition.length < 20) return null;
  return {
    id: "",
    proposition,
    event_or_context: String(ctx).slice(0, 1200),
    evidence: String(evid).slice(0, 1200),
    discipline: disc,
    tier,
    confidence: conf,
    source_class: src,
    source_url: url || "",
    source_title: title || "",
    content_hash: sha(`${disc}|${proposition}`),
  };
}

async function fetchTimeout(url, { timeoutMs = 30000, headers = UA } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: ac.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function fromRestCountries() {
  const url =
    "https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,area,timezones,cca2,currencies,languages";
  const res = await fetchTimeout(url, { timeoutMs: 45000 });
  if (!res.ok) throw new Error("restcountries HTTP " + res.status);
  const raw = await res.json();
  if (raw && raw.success === false) {
    const msg = raw.errors?.[0]?.message || JSON.stringify(raw).slice(0, 200);
    throw new Error("restcountries deprecated/blocked: " + msg);
  }
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;
  if (!list) throw new Error("restcountries: unexpected shape keys=" + (raw && typeof raw === "object" ? Object.keys(raw).join(",") : typeof raw));
  const out = [];
  for (const c of list.slice(220, 340)) {
    const name = c.name?.common || c.name?.official;
    if (!name) continue;
    const caps = Array.isArray(c.capital) ? c.capital.join("、") : "";
    const tz = Array.isArray(c.timezones) ? c.timezones.slice(0, 2).join("、") : "";
    const langs = c.languages ? Object.values(c.languages).slice(0, 3).join("、") : "";
    const curs = c.currencies ? Object.keys(c.currencies).slice(0, 2).join("、") : "";
    const prop = `${name}（${c.cca2}）人口约 ${c.population ?? "未列"}；面积约 ${c.area ?? "未列"} km²；首都${caps || "未列"}；语言示例 ${langs || "未列"}；货币 ${curs || "未列"}；时区 ${tz || "未列"}；属 ${c.region || "未知"}${c.subregion ? "/" + c.subregion : ""}。`;
    const it = item({
      prop,
      ctx: `RestCountries open data slice 220-339 · ${c.cca2}`,
      evid: `restcountries.com · ${name}`,
      disc: "geography",
      src: "open_data",
      url: `https://restcountries.com/v3.1/alpha/${c.cca2}`,
      title: name,
      conf: 0.86,
    });
    if (it) out.push(it);
  }
  return out;
}

async function fromWikidata() {
  const clean = [
    "Q395", "Q11173", "Q413", "Q420", "Q199", "Q23444", "Q11023", "Q8162",
    "Q11216", "Q11303", "Q132196", "Q163547", "Q11451", "Q12136", "Q5891",
    "Q21198", "Q7150", "Q42848", "Q11358", "Q8087",
  ];
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${clean.join("|")}&props=labels|descriptions&languages=zh|en&format=json`;
  const res = await fetchTimeout(url, { timeoutMs: 30000 });
  if (!res.ok) throw new Error("wikidata HTTP " + res.status);
  const data = await res.json();
  const discGuess = {
    Q395: "math", Q11173: "chemistry", Q413: "physics", Q420: "biology", Q199: "history",
    Q23444: "geology", Q11023: "engineering", Q8162: "linguistics", Q11216: "medicine",
    Q11303: "economics", Q132196: "psychology", Q163547: "astronomy", Q11451: "sports",
    Q12136: "medicine", Q5891: "linguistics", Q21198: "cs", Q7150: "biology",
    Q42848: "music", Q11358: "physics", Q8087: "math",
  };
  const out = [];
  for (const [id, ent] of Object.entries(data.entities || {})) {
    if (ent.missing !== undefined) continue;
    const label = ent.labels?.zh?.value || ent.labels?.en?.value;
    const desc = ent.descriptions?.zh?.value || ent.descriptions?.en?.value;
    if (!label || !desc) continue;
    const prop = `${label}：${desc}。`;
    const it = item({
      prop,
      ctx: `Wikidata entity ${id} (multi-003)`,
      evid: `https://www.wikidata.org/wiki/${id}`,
      disc: discGuess[id] || "general",
      src: "open_data",
      url: `https://www.wikidata.org/wiki/${id}`,
      title: label,
      conf: 0.88,
      tier: "silver",
    });
    if (it) out.push(it);
  }
  return out;
}

async function fromGutendex() {
  const out = [];
  const pageErrors = [];
  for (let page = 7; page <= 9; page++) {
    const url = `https://gutendex.com/books/?page=${page}`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 25000 });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      for (const b of data.results || []) {
        const authors = (b.authors || []).map((a) => a.name).join("、") || "佚名";
        const langs = (b.languages || []).join(",");
        const subjects = (b.subjects || []).slice(0, 2).join("；");
        const prop = `公共领域书目《${b.title}》，作者 ${authors}，语言 ${langs || "未列"}，主题片段 ${subjects || "未列"}，Gutenberg id=${b.id}，下载数约 ${b.download_count ?? "未列"}。`;
        const it = item({
          prop,
          ctx: `Project Gutenberg / Gutendex page ${page}`,
          evid: `https://www.gutenberg.org/ebooks/${b.id}`,
          disc: "literature",
          src: "open_data",
          url: `https://www.gutenberg.org/ebooks/${b.id}`,
          title: b.title,
          conf: 0.84,
        });
        if (it) out.push(it);
      }
    } catch (e) {
      pageErrors.push({ page, reason: String(e.message || e) });
      console.error(`[gutendex page ${page} fail]`, e.message || e);
    }
    await sleep(450);
  }
  if (out.length === 0 && pageErrors.length) {
    throw new Error("gutendex all pages failed: " + pageErrors.map((e) => `p${e.page}:${e.reason}`).join("; "));
  }
  return out;
}

async function fromOpenLibrary() {
  const subjects = [
    "philosophy", "history", "astronomy", "medicine", "mathematics",
    "oceanography", "agriculture", "law", "education", "design",
  ];
  const out = [];
  for (const sub of subjects) {
    const url = `https://openlibrary.org/subjects/${encodeURIComponent(sub)}.json?limit=12&offset=24`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 20000 });
      if (!res.ok) {
        console.error("OL fail", sub, res.status);
        continue;
      }
      const data = await res.json();
      for (const w of data.works || []) {
        const authors = (w.authors || []).map((a) => a.name).join("、") || "未知作者";
        const prop = `开放图书馆主题「${sub}」作品《${w.title}》，作者：${authors}${w.first_publish_year ? "，首版约 " + w.first_publish_year : ""}。`;
        const key = w.key || "";
        const it = item({
          prop,
          ctx: `Open Library subject=${sub} limit=12 offset=24`,
          evid: `https://openlibrary.org${key}`,
          disc: sub === "mathematics" ? "math" : sub === "astronomy" ? "astronomy" : sub === "medicine" ? "medicine" : sub === "philosophy" ? "philosophy" : sub === "history" ? "history" : sub,
          src: "open_data",
          url: `https://openlibrary.org${key}`,
          title: w.title,
          conf: 0.78,
        });
        if (it) out.push(it);
      }
    } catch (e) {
      console.error("OL error", sub, e.message || e);
    }
    await sleep(400);
  }
  return out;
}

async function fromArxiv() {
  const queries = ["q-bio.NC", "cs.AI", "math.CO", "astro-ph.GA", "cond-mat.soft"];
  const out = [];
  for (const q of queries) {
    const url = `http://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(q)}&start=25&max_results=10`;
    try {
      const res = await fetchTimeout(url, {
        timeoutMs: 30000,
        headers: { "User-Agent": UA["User-Agent"] },
      });
      if (!res.ok) {
        console.error("arxiv fail", q, res.status);
        continue;
      }
      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);
      for (const e of entries) {
        const title = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.replace(/\s+/g, " ").trim();
        const summary = (e.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.replace(/\s+/g, " ").trim();
        const id = (e.match(/<id>([\s\S]*?)<\/id>/) || [])[1]?.trim();
        if (!title || !summary) continue;
        const prop = `arXiv《${title}》：${summary.slice(0, 400)}`;
        const disc = q.startsWith("cs")
          ? "cs"
          : q.startsWith("math")
            ? "math"
            : q.startsWith("astro")
              ? "astronomy"
              : q.startsWith("q-bio")
                ? "biology"
                : "physics";
        const it = item({
          prop,
          ctx: `arXiv cat=${q} start=25 max_results=10`,
          evid: id || "arxiv.org",
          disc,
          src: "open_data",
          url: id,
          title,
          conf: 0.8,
        });
        if (it) out.push(it);
      }
    } catch (e) {
      console.error("arxiv error", q, e.message || e);
    }
    await sleep(900);
  }
  return out;
}

/** OpenAlex works — public scholarly metadata (no Wikipedia) */
async function fromOpenAlex() {
  const topics = [
    { q: "photosynthesis", disc: "biology" },
    { q: "plate tectonics", disc: "geology" },
    { q: "reinforcement learning", disc: "cs" },
    { q: "cognitive load", disc: "psychology" },
    { q: "circular economy", disc: "economics" },
  ];
  const out = [];
  for (const { q, disc } of topics) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=8&page=2&mailto=tongshi@lingxifield.com`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 25000 });
      if (!res.ok) {
        console.error("openalex fail", q, res.status);
        continue;
      }
      const data = await res.json();
      for (const w of data.results || []) {
        const title = w.display_name || w.title;
        const year = w.publication_year || "";
        const cite = w.cited_by_count ?? "";
        const abs = typeof w.abstract_inverted_index === "object" && w.abstract_inverted_index
          ? Object.entries(w.abstract_inverted_index)
              .flatMap(([word, idxs]) => idxs.map((i) => [i, word]))
              .sort((a, b) => a[0] - b[0])
              .map((x) => x[1])
              .join(" ")
              .slice(0, 280)
          : "";
        if (!title) continue;
        const prop = `OpenAlex《${title}》${year ? "（" + year + "）" : ""}${cite !== "" ? "，被引约 " + cite : ""}${abs ? "。摘要片段：" + abs : "。"}`;
        const it = item({
          prop,
          ctx: `OpenAlex search=${q} page=2 per_page=8`,
          evid: w.id || "openalex.org",
          disc,
          src: "open_data",
          url: w.id || w.doi || "",
          title,
          conf: 0.82,
          tier: "silver",
        });
        if (it) out.push(it);
      }
    } catch (e) {
      console.error("openalex error", q, e.message || e);
    }
    await sleep(500);
  }
  return out;
}

/** Crossref sample — public DOI metadata */
async function fromCrossref() {
  const queries = ["ocean acidification", "urban heat island", "graph neural network"];
  const out = [];
  for (const q of queries) {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=8&offset=10&mailto=tongshi@lingxifield.com`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 25000 });
      if (!res.ok) {
        console.error("crossref fail", q, res.status);
        continue;
      }
      const data = await res.json();
      for (const w of data.message?.items || []) {
        const title = (w.title && w.title[0]) || "";
        const year = w.published?.["date-parts"]?.[0]?.[0] || w.created?.["date-parts"]?.[0]?.[0] || "";
        const journal = (w["container-title"] && w["container-title"][0]) || "";
        if (!title) continue;
        const prop = `Crossref《${title}》${year ? "（" + year + "）" : ""}${journal ? "，刊于 " + journal : ""}；DOI ${w.DOI || "未列"}。`;
        const disc = q.includes("ocean") || q.includes("heat") ? "ecology" : "cs";
        const it = item({
          prop,
          ctx: `Crossref query=${q} rows=8 offset=10`,
          evid: w.DOI ? `https://doi.org/${w.DOI}` : "crossref.org",
          disc,
          src: "open_data",
          url: w.DOI ? `https://doi.org/${w.DOI}` : "",
          title,
          conf: 0.81,
        });
        if (it) out.push(it);
      }
    } catch (e) {
      console.error("crossref error", q, e.message || e);
    }
    await sleep(400);
  }
  return out;
}

const all = [];
const errors = [];
const runners = [
  ["restcountries", fromRestCountries],
  ["wikidata", fromWikidata],
  ["gutendex_p7_9", fromGutendex],
  ["openlibrary", fromOpenLibrary],
  ["arxiv", fromArxiv],
  ["openalex", fromOpenAlex],
  ["crossref", fromCrossref],
];

for (const [name, fn] of runners) {
  try {
    console.log(`[start] ${name}`);
    const part = await fn();
    console.log(`[ok] ${name} +${part.length}`);
    all.push(...part);
  } catch (e) {
    console.error(`[fail] ${name}`, e.message || e);
    errors.push({ source: name, reason: String(e.message || e) });
  }
}

const priorHashes = new Set();
for (const f of [
  "batch-multi-001.json",
  "batch-multi-002.json",
  "batch-wiki-001.json",
  "batch-wiki-002.json",
  "batch-pilot-001.json",
]) {
  const p = resolve(root, "batches", f);
  if (!existsSync(p)) continue;
  try {
    const j = JSON.parse(readFileSync(p, "utf8"));
    for (const it of j.items || []) if (it.content_hash) priorHashes.add(it.content_hash);
  } catch {}
}

const uniq = new Map();
let skippedPrior = 0;
for (const it of all) {
  if (priorHashes.has(it.content_hash)) {
    skippedPrior++;
    continue;
  }
  if (!uniq.has(it.content_hash)) uniq.set(it.content_hash, it);
}
const items = [...uniq.values()].map((it, i) => ({
  ...it,
  id: `tg-multi3-${String(i + 1).padStart(4, "0")}`,
}));

const outPath = resolve(root, "batches/batch-multi-003.json");
mkdirSync(dirname(outPath), { recursive: true });
const batch = {
  batch: "multi-003",
  script: "wholesale-multi-003.mjs",
  fetched_at: new Date().toISOString(),
  sources: runners.map((r) => r[0]),
  note: "Wikipedia live skipped (prior 429). OpenAlex+Crossref added.",
  counts: { ok: items.length, raw: all.length, skipped_prior: skippedPrior, fail: errors.length },
  errors,
  items,
};
writeFileSync(outPath, JSON.stringify(batch, null, 2), "utf8");
const by_disc = items.reduce((a, i) => ((a[i.discipline] = (a[i.discipline] || 0) + 1), a), {});
const by_tier = items.reduce((a, i) => ((a[i.tier] = (a[i.tier] || 0) + 1), a), {});
const stats = {
  batch: "multi-003",
  script: "wholesale-multi-003.mjs",
  items: items.length,
  counts: { ok: items.length, raw: all.length, skipped_prior: skippedPrior, fail: errors.length },
  skipped_prior: skippedPrior,
  by_disc,
  by_tier,
  errors: errors.length,
  error_details: errors.slice(0, 30),
};
writeFileSync(resolve(root, "batches/multi-003-stats.json"), JSON.stringify(stats, null, 2), "utf8");
console.log(`[done] ok=${items.length} raw=${all.length} skipped_prior=${skippedPrior} fail=${errors.length} → ${outPath}`);
console.log("[by_disc]", JSON.stringify(by_disc));
console.log("[by_tier]", JSON.stringify(by_tier));
