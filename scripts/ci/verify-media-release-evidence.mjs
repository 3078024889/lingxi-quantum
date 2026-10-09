import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../../"+path,import.meta.url),"utf8");
const policy=JSON.parse(read("lib/tools/commerce/pricing-policy.json"));
const video=read("components/tools/OptionalAIVideoFrameAnalysis.tsx");
const audio=read("components/tools/OptionalAIVoiceAnalysis.tsx");
const provenance=read("components/tools/C2paProvenanceCheck.tsx");
const media=read("components/tools/MediaOriginStarter.tsx");
for(const tool of ["ai-image-check","ai-video-audio-check"]){
 assert.equal(policy.tools[tool].mode,"disabled-quality-gate",`UNVERIFIED_MEDIA_BILLING_MUST_REMAIN_DISABLED:${tool}`);
}
const match=/const FRAME_POSITIONS=\[([^\]]+)\] as const/.exec(video);
assert.ok(match,"VIDEO_SAMPLE_PLAN_MISSING");
const ratios=match[1].split(",").map(s=>Number(s.trim()));
assert.equal(ratios.length,7,"DISTRIBUTED_VIDEO_SAMPLING_MUST_HAVE_SEVEN_POINTS");
assert.ok(ratios.every((x,i)=>x>0&&x<1&&(i===0||x>ratios[i-1])),"VIDEO_SAMPLE_POSITIONS_INVALID");
assert.ok(ratios[0]<0.1&&ratios.at(-1)>0.9,"VIDEO_SAMPLING_MUST_COVER_BEGINNING_AND_END");
assert.ok(video.includes("for(const ratio of FRAME_POSITIONS)"),"VIDEO_PLAN_NOT_USED");
assert.ok(video.includes("不是逐帧扫描")&&video.includes("not inspect every frame"),"VIDEO_LIMIT_DISCLOSURE_MISSING");
assert.ok(audio.includes("Math.min(decoded.duration,12)"),"AUDIO_COVERAGE_CHANGED_WITHOUT_EVALUATION");
assert.ok(audio.includes("开头最多12秒"),"AUDIO_LIMIT_DISCLOSURE_MISSING");
assert.ok(provenance.includes("Reader.fromBlob(")&&provenance.includes("verifyAfterReading:true"),"C2PA_CRYPTOGRAPHIC_VALIDATION_MISSING");
assert.ok(media.includes("<C2paProvenanceCheck")&&media.includes("<OptionalAIVideoFrameAnalysis"),"PROVENANCE_AND_INFERENCE_MUST_BE_SEPARATE");
console.log("MEDIA_RELEASE_EVIDENCE_PASS: seven distributed video frames; audio first 12s; official C2PA verification separate; charging still disabled");
console.log("QUALITY_OPEN: unseen generators, adversarial edits, calibrated error rates, end-to-end audio/video coverage, account quota, billing idempotency and refund E2E");
