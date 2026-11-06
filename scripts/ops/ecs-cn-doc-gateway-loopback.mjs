#!/usr/bin/env node
/**
 * CN 3189 standalone bridge: private loopback HTTP -> already verified HTTPS
 * signed document gateway. Never binds a public interface or logs HMAC headers.
 *
 * This is a staging-only compatibility shim for a legacy bundle hardcoded to
 * 127.0.0.1:3100. No production service, database or DNS mutation.
 */
import http from "node:http";
import https from "node:https";
import assert from "node:assert/strict";
import net from "node:net";

const LISTEN_HOST = "127.0.0.1";
const LISTEN_PORT = 3100;
const MAX_INPUT = 50 * 1024 * 1024;
const ALLOWED_HEADERS = [
  "content-type", "content-length",
  "x-lingxifield-ticket-version", "x-lingxifield-filename",
  "x-lingxifield-size", "x-lingxifield-exp",
  "x-lingxifield-nonce", "x-lingxifield-token"
];

function validatedOrigin(raw) {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !host || host === "localhost" ||
      host.endsWith(".localhost") || net.isIP(host) ||
      url.username || url.password || url.search || url.hash ||
      (url.port && url.port !== "443") ||
      (url.pathname !== "/" && url.pathname !== "")) {
    throw new Error("CN_DOCUMENT_BRIDGE_ORIGIN_INVALID");
  }
  return url.origin;
}

function selfTest() {
  assert.equal(validatedOrigin("https://doc.example.com"), "https://doc.example.com");
  for (const bad of [
    "http://doc.example.com", "https://127.0.0.1",
    "https://user:pass@doc.example.com",
    "https://doc.example.com:8443", "https://doc.example.com/redirect",
    "https://doc.example.com/?x=1", "https://[::1]"
  ]) assert.throws(() => validatedOrigin(bad));
  assert.equal(LISTEN_HOST, "127.0.0.1");
  assert.equal(LISTEN_PORT, 3100);
  console.log("CN_DOCUMENT_BRIDGE_ORIGIN_SECURITY_SELFTEST=PASS");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const origin = validatedOrigin(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL || "");
  const server = http.createServer((req, res) => {
    const allowed = (req.method === "GET" && req.url === "/health") ||
                    (req.method === "POST" && req.url === "/convert");
    if (!allowed) { res.writeHead(404); res.end(); req.resume(); return; }

    const declared = req.headers["content-length"];
    if (req.method === "POST" &&
        (typeof declared !== "string" || !/^\d+$/.test(declared) ||
         Number(declared) < 1 || Number(declared) > MAX_INPUT)) {
      res.writeHead(413, {"cache-control": "private, no-store"});
      res.end();
      req.resume();
      return;
    }
    const outbound = {};
    for (const key of ALLOWED_HEADERS) {
      if (typeof req.headers[key] === "string") outbound[key] = req.headers[key];
    }
    const upstream = https.request(new URL(req.url, origin), {
      method: req.method,
      headers: outbound,
      timeout: req.method === "POST" ? 90000 : 6000,
      rejectUnauthorized: true
    }, upstreamResponse => {
      if (res.headersSent) { upstreamResponse.resume(); return; }
      const responseHeaders = {"cache-control": "private, no-store", "x-content-type-options": "nosniff"};
      for (const key of ["content-type", "content-length", "retry-after"]) {
        if (typeof upstreamResponse.headers[key] === "string") {
          responseHeaders[key] = upstreamResponse.headers[key];
        }
      }
      res.writeHead(upstreamResponse.statusCode || 502, responseHeaders);
      upstreamResponse.pipe(res);
    });
    let failed = false;
    const fail = (code) => {
      if (failed) return;
      failed = true;
      upstream.destroy();
      if (!res.headersSent) res.writeHead(code, {"cache-control":"private, no-store"});
      res.end();
      req.resume();
    };
    upstream.setTimeout(req.method === "POST" ? 90000 : 6000, () => fail(504));
    upstream.on("error", () => fail(502));
    req.on("error", () => fail(502));
    res.on("close", () => { if (!res.writableEnded) upstream.destroy(); });
    let total = 0;
    req.on("data", chunk => {
      if (failed) return;
      total += chunk.length;
      if (total > MAX_INPUT) { fail(413); return; }
      if (!upstream.write(chunk)) req.pause();
    });
    upstream.on("drain", () => req.resume());
    req.on("end", () => { if (!failed) upstream.end(); });
  });
  server.requestTimeout = 95000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 100;
  server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log("CN_DOCUMENT_BRIDGE_LOOPBACK_READY=127.0.0.1:3100");
  });
}
