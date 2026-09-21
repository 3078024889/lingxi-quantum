#!/usr/bin/env node
/** Resilient multi-source wholesale → batch-multi-002 (real fetch only; no fabrication) */
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

/** fetch with AbortController timeout (ms) */
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
    "https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,area,timezones,cca2";
  const res = await fetchTimeout(url, { timeoutMs: 45000 });
  if (!res.ok) throw new Error("restcountries HTTP " + res.status);
  const raw = await res.json();
  // handle BOTH raw array AND {data:[...]} wrapper; surface deprecation when data=null
  if (raw && raw.success === false) {
    const msg = raw.errors?.[0]?.message || JSON.stringify(raw).slice(0, 200);
    throw new Error("restcountries deprecated/blocked: " + msg);
  }
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;
  if (!list) throw new Error("restcountries: unexpected shape (not array or {data:[]}) keys=" + (raw && typeof raw === "object" ? Object.keys(raw).join(",") : typeof raw));
  const out = [];
  for (const c of list.slice(100, 220)) {
    const name = c.name?.common || c.name?.official;
    if (!name) continue;
    const caps = Array.isArray(c.capital) ? c.capital.join("、") : "";
    const tz = Array.isArray(c.timezones) ? c.timezones.slice(0, 2).join("、") : "";
    const prop = `${name}（${c.cca2}）面积约 ${c.area ?? "未列"} km²；首都${caps || "未列"}；时区示例 ${tz || "未列"}；属 ${c.region || "未知"}${c.subregion ? "/" + c.subregion : ""}。`;
    const it = item({
      prop,
      ctx: `RestCountries open data slice 100-219 · ${c.cca2}`,
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
    "Q913", "Q11424", "Q39886", "Q5891", "Q13191", "Q2013", "Q83310", "Q7187",
    "Q79913", "Q11033", "Q184556", "Q2539", "Q11028", "Q8134", "Q234869",
    "Q735", "Q188", "Q1321", "Q150", "Q1860",
  ];
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${clean.join("|")}&props=labels|descriptions&languages=zh|en&format=json`;
  const res = await fetchTimeout(url, { timeoutMs: 30000 });
  if (!res.ok) throw new Error("wikidata HTTP " + res.status);
  const data = await res.json();
  const discGuess = {
    Q913: "cs", Q11424: "film", Q39886: "psychology", Q5891: "linguistics", Q13191: "music",
    Q2013: "cs", Q83310: "physics", Q7187: "biology", Q79913: "medicine", Q11033: "cs",
    Q184556: "music", Q2539: "physics", Q11028: "cs", Q8134: "math", Q234869: "medicine",
    Q735: "art", Q188: "linguistics", Q1321: "linguistics", Q150: "linguistics", Q1860: "linguistics",
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
      ctx: `Wikidata entity ${id} (multi-002b)`,
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
  for (let page = 4; page <= 6; page++) {
    const url = `https://gutendex.com/books/?page=${page}`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 25000 });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      for (const b of data.results || []) {
        const authors = (b.authors || []).map((a) => a.name).join("、") || "佚名";
        const langs = (b.languages || []).join(",");
        const prop = `公共领域书目《${b.title}》，作者 ${authors}，语言 ${langs || "未列"}，Gutenberg id=${b.id}，下载数约 ${b.download_count ?? "未列"}。`;
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
    "psychology", "economics", "chemistry", "engineering", "anthropology",
    "linguistics", "music", "ecology", "geology", "architecture",
  ];
  const out = [];
  for (const sub of subjects) {
    const url = `https://openlibrary.org/subjects/${encodeURIComponent(sub)}.json?limit=12&offset=12`;
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
          ctx: `Open Library subject=${sub} limit=12 offset=12`,
          evid: `https://openlibrary.org${key}`,
          disc: sub,
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
  const queries = ["cs.LG", "cs.CL", "stat.ML", "econ.EM", "physics.soc-ph"];
  const out = [];
  for (const q of queries) {
    const url = `http://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(q)}&start=15&max_results=10`;
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
          : q.startsWith("econ")
            ? "economics"
            : q.startsWith("stat")
              ? "math"
              : "physics";
        const it = item({
          prop,
          ctx: `arXiv cat=${q} start=15 max_results=10`,
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

async function fromWikipediaSummaryBatch() {
  const titles = [
    { t: "量子力学", lang: "zh", disc: "physics" },
    { t: "细胞", lang: "zh", disc: "biology" },
    { t: "微积分", lang: "zh", disc: "math" },
    { t: "神经网络", lang: "zh", disc: "cs" },
    { t: "通货膨胀", lang: "zh", disc: "economics" },
    { t: "热力学", lang: "zh", disc: "physics" },
    { t: "Evolution", lang: "en", disc: "biology" },
    { t: "Galaxy", lang: "en", disc: "astronomy" },
    { t: "Periodic_table", lang: "en", disc: "chemistry" },
    { t: "Photosynthesis", lang: "en", disc: "biology" },
    { t: "Blockchain", lang: "en", disc: "cs" },
    { t: "Cognitive_bias", lang: "en", disc: "psychology" },
  ];
  const out = [];
  const errors = [];
  for (const { t, lang, disc } of titles) {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`;
    try {
      const res = await fetchTimeout(url, { timeoutMs: 15000, headers: { ...UA, Accept: "application/json" } });
      if (!res.ok) {
        // one polite retry on 429
        if (res.status === 429) {
          await sleep(5000);
          const res2 = await fetchTimeout(url, { timeoutMs: 15000, headers: { ...UA, Accept: "application/json" } });
          if (res2.ok) {
            const j2 = await res2.json();
            const extract2 = j2.extract || j2.description;
            if (extract2 && extract2.length >= 40) {
              const prop2 = `${j2.title || t}：${extract2.slice(0, 500)}`;
              const it2 = item({
                prop: prop2,
                ctx: `Wikipedia ${lang} summary API · multi-002b`,
                evid: j2.content_urls?.desktop?.page || url,
                disc,
                src: "open_encyclopedia",
                url: j2.content_urls?.desktop?.page || url,
                title: j2.title || t,
                conf: 0.85,
                tier: "silver",
              });
              if (it2) out.push(it2);
              await sleep(1800);
              continue;
            }
          }
          errors.push({ title: t, reason: "HTTP 429 (retry failed)" });
          await sleep(1800);
          continue;
        }
        errors.push({ title: t, reason: "HTTP " + res.status });
        await sleep(1800);
        continue;
      }
      const j = await res.json();
      const extract = j.extract || j.description;
      if (!extract || extract.length < 40) {
        errors.push({ title: t, reason: "short/empty" });
        await sleep(1800);
        continue;
      }
      const prop = `${j.title || t}：${extract.slice(0, 500)}`;
      const it = item({
        prop,
        ctx: `Wikipedia ${lang} summary API · multi-002b`,
        evid: j.content_urls?.desktop?.page || url,
        disc,
        src: "open_encyclopedia",
        url: j.content_urls?.desktop?.page || url,
        title: j.title || t,
        conf: 0.85,
        tier: "silver",
      });
      if (it) out.push(it);
    } catch (e) {
      errors.push({ title: t, reason: String(e.message || e) });
    }
    await sleep(1800);
  }
  return { items: out, errors };
}

const all = [];
const errors = [];
const runners = [
  ["restcountries", fromRestCountries],
  ["wikidata", fromWikidata],
  ["gutendex_p4_6", fromGutendex],
  ["openlibrary", fromOpenLibrary],
  ["arxiv", fromArxiv],
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
    // RestCountries fail → continue other sources
  }
}

try {
  console.log("[start] wikipedia_summary");
  const { items: wItems, errors: wErr } = await fromWikipediaSummaryBatch();
  console.log(`[ok] wikipedia_summary +${wItems.length} fail=${wErr.length}`);
  all.push(...wItems);
  errors.push(...wErr.map((e) => ({ source: "wikipedia", ...e })));
} catch (e) {
  errors.push({ source: "wikipedia_summary", reason: String(e.message || e) });
}

// dedupe against prior batches
const priorHashes = new Set();
for (const f of ["batch-multi-001.json", "batch-wiki-001.json", "batch-wiki-002.json", "batch-pilot-001.json"]) {
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
  id: `tg-multi2-${String(i + 1).padStart(4, "0")}`,
}));

const outPath = resolve(root, "batches/batch-multi-002.json");
mkdirSync(dirname(outPath), { recursive: true });
const batch = {
  batch: "multi-002",
  script: "wholesale-multi-002b.mjs",
  fetched_at: new Date().toISOString(),
  sources: [...runners.map((r) => r[0]), "wikipedia_summary"],
  counts: { ok: items.length, raw: all.length, skipped_prior: skippedPrior, fail: errors.length },
  errors,
  items,
};
writeFileSync(outPath, JSON.stringify(batch, null, 2));
const by_disc = items.reduce((a, i) => ((a[i.discipline] = (a[i.discipline] || 0) + 1), a), {});
const stats = {
  batch: "multi-002",
  script: "wholesale-multi-002b.mjs",
  items: items.length,
  counts: { ok: items.length, raw: all.length, skipped_prior: skippedPrior, fail: errors.length },
  skipped_prior: skippedPrior,
  by_disc,
  errors: errors.length,
  error_details: errors.slice(0, 30),
};
writeFileSync(resolve(root, "batches/multi-002-stats.json"), JSON.stringify(stats, null, 2));
console.log(`[done] ok=${items.length} raw=${all.length} skipped_prior=${skippedPrior} fail=${errors.length} → ${outPath}`);
console.log("[by_disc]", JSON.stringify(by_disc));
