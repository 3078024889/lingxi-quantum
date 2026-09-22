const base = (process.argv[2] || "https://lingxifield.com").replace(/\/$/, "");

const tests = [
  { path: "/sasi", expect: [200, 302, 307, 308], label: "SASI workspace" },
  { path: "/ai-wallet", expect: [200, 302, 307, 308], label: "AI wallet" },
  { path: "/tools", expect: [200], label: "Tools hub" },
  { path: "/tools/pdf-redact", expect: [200], label: "PDF redact" },
  { path: "/tools/audio-transcription", expect: [200], label: "Audio transcription" },
  { path: "/tools/video-transcription", expect: [200], label: "Video transcription" },
  { path: "/tools/subtitle-translate", expect: [200], label: "Subtitle translate" },
  { path: "/tools/id-photo-ai", expect: [200], label: "AI ID photo" },
  { path: "/api/ai/wallet", expect: [401], label: "Wallet API blocks anonymous" },
  { path: "/api/ai/provider-test?tier=light", expect: [401], label: "Provider test blocks anonymous" },
  { path: "/api/ai/provider-test?tier=standard", expect: [401], label: "Provider standard blocks anonymous" },
  { path: "/api/ai/provider-test?tier=high", expect: [401], label: "Provider high blocks anonymous" },
  { path: "/robots.txt", expect: [200], label: "robots" },
  { path: "/sitemap.xml", expect: [200], label: "sitemap" },
  { path: "/api/pay/alipay/status", expect: [200], label: "Alipay status" },
];

let failed = 0;

for (const t of tests) {
  const url = base + t.path;
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "Lingxifield-V94-Audit/1.0" } });
    const ok = t.expect.includes(res.status);
    console.log(`${ok ? "PASS" : "FAIL"} ${String(res.status).padEnd(3)} ${t.label.padEnd(34)} ${url}`);
    if (!ok) failed++;
  } catch (e) {
    failed++;
    console.log(`FAIL ERR ${t.label.padEnd(34)} ${url}`);
    console.error(e instanceof Error ? e.message : String(e));
  }
}

if (failed) {
  console.error(`\n${failed} production smoke test(s) failed.`);
  process.exit(1);
}
console.log("\nAll non-destructive production smoke tests passed.");
