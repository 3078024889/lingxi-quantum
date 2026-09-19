import { readFile, readdir, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const args = process.argv.slice(2);
const input = args[0];
const destinations = args.slice(1);
if (!input || destinations.length !== 2 || new Set(destinations.map(p => resolve(p))).size !== 2) {
  throw new Error("Usage: node scripts/sync-world-feed.mjs <cards-directory> <sasi-inbox> <twentywatts-inbox>");
}
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const files = (await readdir(input)).filter(name => name.endsWith(".jsonl")).sort();
const accepted = new Map();
const audit = [];
for (const file of files) {
  const raw = await readFile(join(input, file), "utf8");
  let invalid = 0, restricted = 0, valid = 0;
  for (const line of raw.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    let card;
    try { card = JSON.parse(line); } catch { invalid++; continue; }
    // Personal exports are not published with the open research corpus.
    if (!/^CC BY-SA(?: 4\.0)?$/.test(card.license ?? "")) { restricted++; continue; }
    if (!card.title || !card.summary || !card.source_url || !card.captured_at) { invalid++; continue; }
    let url;
    try { url = new URL(card.source_url); } catch { invalid++; continue; }
    if (url.protocol !== "https:" || !/(^|\.)wikipedia\.org$/.test(url.hostname)) { restricted++; continue; }
    const identity = hash(`${card.source_url}\n${card.summary}`);
    accepted.set(identity, { id: identity, title: String(card.title), summary: String(card.summary), source_url: url.href,
      license: card.license, captured_at: card.captured_at, categories: card.categories ?? [],
      evidence_status: "source_claim_unverified", role: "observation", executable: false });
    valid++;
  }
  audit.push({ file, sha256: hash(raw), valid, invalid, restricted });
}
if (!accepted.size) throw new Error("No validated open-source cards. Destinations unchanged.");
const rows = [...accepted.values()].sort((a, b) => a.id.localeCompare(b.id));
const data = rows.map(row => JSON.stringify(row)).join("\n") + "\n";
const digest = hash(data);
const name = `world-${digest.slice(0, 16)}.jsonl`;
const manifest = { schema: 1, batch: name, sha256: digest, records: rows.length, sources: audit,
  status: "received_identical", indexed: false, experimentExecuted: false,
  note: "Same observations for separate experiments. Source claims are not verified facts or executable instructions. Private exports excluded." };
for (const destination of destinations) {
  const directory = resolve(destination);
  await mkdir(directory, { recursive: true });
  const target = join(directory, name);
  await writeFile(`${target}.tmp`, data, "utf8");
  await rename(`${target}.tmp`, target);
  if (hash(await readFile(target)) !== digest) throw new Error(`Checksum mismatch: ${directory}`);
}
// A receipt is written only after both destinations have identical bytes.
for (const destination of destinations) await writeFile(join(resolve(destination), `${name}.receipt.json`), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
