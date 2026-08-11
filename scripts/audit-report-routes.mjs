#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const routes = [
  { product: "relationship", path: "app/api/relationship/generate-full/route.ts", deterministic: true },
  { product: "resilience", path: "app/api/resilience/generate-full/route.ts", deterministic: true },
  { product: "life-map", path: "app/api/lifemap/generate-full/route.ts", deterministic: true },
  { product: "life-oracle", path: "app/api/qian/generate-full/route.ts", deterministic: true },
  { product: "romance", path: "app/api/romance/generate-full/route.ts", deterministic: true },
  { product: "wealth", path: "app/api/wealth/generate-full/route.ts", deterministic: true },
  { product: "daily-tide", path: "app/api/daily-tide/generate-full/route.ts", deterministic: true },
  { product: "life-mirror", path: "app/api/tarot/reading/generate-full/route.ts", deterministic: true },
];

const forbidden = [
  { label: "network fetch", pattern: /\bfetch\s*\(/ },
  { label: "model endpoint", pattern: /chat\/completions|open\.bigmodel\.cn/i },
  { label: "model credential", pattern: /process\.env\.ZHIPU_|const\s+ZHIPU_(?:ENDPOINT|MODEL)/ },
];

let failed = false;
for (const route of routes) {
  if (!existsSync(route.path)) {
    console.error(`FAIL ${route.product}: missing ${route.path}`);
    failed = true;
    continue;
  }

  const source = readFileSync(route.path, "utf8");
  const hits = forbidden.filter(({ pattern }) => pattern.test(source)).map(({ label }) => label);
  const status = hits.length === 0 ? "local-only" : `external (${hits.join(", ")})`;

  if (route.deterministic && hits.length > 0) {
    console.error(`FAIL ${route.product}: deterministic route contains ${status}`);
    failed = true;
  } else {
    console.log(`${route.deterministic ? "PASS" : "INFO"} ${route.product}: ${status}`);
  }
}

if (failed) process.exit(1);