#!/usr/bin/env node
import fs from "node:fs";const catalog=fs.readFileSync("lib/tools/engine/catalog.ts","utf8"),licenses=fs.readFileSync("lib/tools/engine/license-registry.ts","utf8");
const must=["codeLicense","modelLicense","datasetLicense","commercialUse","networkCopyleft","artifactSha256","ffmpeg-review","gfpgan-review","gotenberg-review","realesrgan-review","kokoro-review","apache2-or-mpl2","agpl-deny"];
for(const x of must)if(!licenses.includes(x))throw new Error(`LICENSE_FIELD_MISSING:${x}`);
for(const x of ["ghostscript","mupdf-pymupdf","ultralytics-yolo"])if(!catalog.includes(x))throw new Error(`BLOCKLIST_MISSING:${x}`);
if(!catalog.includes('license:L["realesrgan-review"]'))throw new Error("REALESRGAN_LICENSE_GATE_MISSING");
if(!catalog.includes('license:L["kokoro-review"]'))throw new Error("KOKORO_LICENSE_GATE_MISSING");
console.log("LICENSE_REGISTRY_V1593=PASS");
