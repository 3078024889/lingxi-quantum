#!/usr/bin/env node
/** Incremental public skills metadata index — review only, NO install */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const skillsDir = resolve(root, "sources/skills");
const UA = {
  "User-Agent": "LingxiField-TongshiBot/1.0 (educational; metadata-index-only)",
  Accept: "application/vnd.github+json",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTimeout(url, { timeoutMs = 25000, headers = UA } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(url, { headers, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[mm[1]] = v;
  }
  return out;
}

const priorPath = resolve(skillsDir, "public-skills-index-2026-09-10-1800.json");
const prior = existsSync(priorPath) ? JSON.parse(readFileSync(priorPath, "utf8")) : { new_entries: [] };
const known = new Set((prior.new_entries || []).map((e) => `${e.repo}::${e.path}`));
const knownNames = new Set((prior.new_entries || []).map((e) => e.name).filter(Boolean));

const catalog_pointers = [
  { url: "https://agentskills.io", note: "Agent Skills open format home" },
  { url: "https://agentskills.io/specification", note: "SKILL.md frontmatter spec" },
  { url: "https://agentskills.io/llms.txt", note: "docs index" },
  { url: "https://skills.sh/anthropics/skills", note: "skills.sh mirror pointer" },
];

const repos = [
  { repo: "anthropics/skills", tree: "main" },
  { repo: "vercel-labs/agent-skills", tree: "main" },
  { repo: "supabase/agent-skills", tree: "main" },
  { repo: "ComposioHQ/awesome-claude-skills", tree: "master" },
  { repo: "travisvn/awesome-claude-skills", tree: "main" },
];

const fetch_errors = [];
const new_entries = [];
const review_queue = [];

for (const { repo, tree } of repos) {
  try {
    console.log(`[tree] ${repo}`);
    const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${tree}?recursive=1`;
    const res = await fetchTimeout(treeUrl);
    if (!res.ok) {
      fetch_errors.push({ repo, reason: "tree HTTP " + res.status });
      console.error("tree fail", repo, res.status);
      await sleep(800);
      continue;
    }
    const data = await res.json();
    const skillFiles = (data.tree || []).filter(
      (n) => n.type === "blob" && /SKILL\.md$/i.test(n.path) && !n.path.includes("node_modules")
    );
    let stars = 0;
    try {
      const r2 = await fetchTimeout(`https://api.github.com/repos/${repo}`);
      if (r2.ok) {
        const j2 = await r2.json();
        stars = j2.stargazers_count || 0;
      }
    } catch {}
    let added = 0;
    for (const f of skillFiles.slice(0, 50)) {
      const key = `${repo}::${f.path}`;
      if (known.has(key)) continue;
      let fm = {};
      const raw_url = `https://raw.githubusercontent.com/${repo}/${tree}/${f.path}`;
      try {
        const r3 = await fetchTimeout(raw_url, {
          timeoutMs: 15000,
          headers: { "User-Agent": UA["User-Agent"], Accept: "text/plain" },
        });
        if (r3.ok) {
          const md = await r3.text();
          fm = parseFrontmatter(md);
        }
      } catch (e) {
        fetch_errors.push({ repo, path: f.path, reason: String(e.message || e) });
      }
      const name =
        fm.name ||
        f.path.split("/").filter(Boolean).slice(-2, -1)[0] ||
        f.path;
      const entry = {
        repo,
        path: f.path,
        name,
        description: (fm.description || "").slice(0, 500),
        license: fm.license || "unknown",
        stars,
        url: `https://github.com/${repo}/blob/${tree}/${f.path}`,
        raw_url,
        source_batch: "2026-09-10-1827",
        status: "indexed_metadata_only",
      };
      new_entries.push(entry);
      known.add(key);
      knownNames.add(name);
      added++;
      if (
        /creat|install|payment|secret|credential|browser|scrape|auth/i.test(name + " " + (fm.description || "")) &&
        review_queue.length < 8
      ) {
        review_queue.push({
          name,
          repo,
          path: f.path,
          reason: "keyword_review_queue",
          status: "queued_for_audit",
        });
      }
      await sleep(200);
      if (added >= 25) break;
    }
    console.log(`[ok] ${repo} +${added} (files=${skillFiles.length})`);
  } catch (e) {
    fetch_errors.push({ repo, reason: String(e.message || e) });
    console.error("[fail]", repo, e.message || e);
  }
  await sleep(600);
}

const cycle = "2026-09-10-1827";
const out = {
  cycle,
  generated_at: new Date().toISOString(),
  timezone: "Asia/Shanghai",
  policy: "PUBLIC metadata index only. Do NOT install unaudited skills. No secrets/payments.",
  standard: "agentskills.io SKILL.md",
  catalog_pointers,
  prior_known: {
    "anthropics/skills": 20,
    prior_cycle_new_entries: (prior.new_entries || []).length,
    note: "deduped against 2026-09-10-1800 index",
  },
  github_api_note: "Trees via unauthenticated api.github.com; frontmatter via raw.githubusercontent.com. Code search skipped.",
  new_entries,
  fetch_errors,
  review_queue,
};

mkdirSync(skillsDir, { recursive: true });
writeFileSync(resolve(skillsDir, `public-skills-index-${cycle}.json`), JSON.stringify(out, null, 2), "utf8");
const stats = {
  cycle,
  new_entries: new_entries.length,
  prior_cycle_entries: (prior.new_entries || []).length,
  review_queue: review_queue.length,
  fetch_errors: fetch_errors.length,
  policy: out.policy,
};
writeFileSync(resolve(skillsDir, `public-skills-index-${cycle}-stats.json`), JSON.stringify(stats, null, 2), "utf8");
const rqMd = [
  `# Public skills review queue · ${cycle}`,
  ``,
  `Policy: metadata index only — **do NOT runtime-install** unaudited skills.`,
  ``,
  `## Queued (${review_queue.length})`,
  ...review_queue.map((r) => `- \`${r.name}\` · ${r.repo}/${r.path} · ${r.reason}`),
  ``,
  `## New indexed this cycle: ${new_entries.length}`,
  ...new_entries.slice(0, 60).map((e) => `- ${e.name} (${e.repo})`),
].join("\n");
writeFileSync(resolve(skillsDir, `public-skills-review-queue-${cycle}.md`), rqMd, "utf8");
console.log(`[done] +${new_entries.length} review=${review_queue.length} errors=${fetch_errors.length}`);
