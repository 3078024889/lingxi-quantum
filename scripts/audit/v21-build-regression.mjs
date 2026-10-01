import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const t=fs.readFileSync("lib/tools/autonomous/transcribe-local.ts","utf8");
must(t.includes("const copy=new Uint8Array(bytes.byteLength)"),"TRANSCRIBE_ARRAYBUFFER_COPY_MISSING");
must(t.includes('new File([copy.buffer],"audio.wav"'),"TRANSCRIBE_BLOBPART_FIX_MISSING");
must(!t.includes('new File([bytes],"audio.wav"'),"OLD_BLOBPART_TYPE_BUG_REMAINS");
const p=JSON.parse(fs.readFileSync("lib/tools/commerce/pricing-policy.json","utf8"));
const s=p.tools["sasi-video-generate"];
must(JSON.stringify(s.supportedResolutions)==='["720p","1080p"]',"SASI_SUPPORTED_RESOLUTIONS_WRONG");
must(s.unsupportedResolutions.includes("480p"),"SASI_480P_NOT_DISABLED");
console.log("TRANSCRIBE_BLOBPART_TYPE_FIX=PASS");
console.log("SASI_VIDEO_SUPPORTED_RESOLUTIONS=720P,1080P");
console.log("SASI_VIDEO_480P=DISABLED");
console.log("V21_BUILD_REGRESSION_AUDIT=PASS");
