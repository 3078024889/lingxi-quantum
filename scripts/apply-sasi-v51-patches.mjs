import fs from "node:fs";

const prod="lib/sasi/production.ts";
let src=fs.readFileSync(prod,"utf8");

if(!src.includes('from "@/lib/sasi-v5/visual/validate"')){
  const importNeedle='import { billableWholeSeconds, readMp4DurationSeconds } from "@/lib/sasi/mp4-duration";';
  if(!src.includes(importNeedle)) throw new Error("PATCH_EXPECTED_TEXT_NOT_FOUND:production-import");
  src=src.replace(
    importNeedle,
    importNeedle+'\nimport { validateVideoDelivery } from "@/lib/sasi-v5/visual/validate";\nimport { recordVisualValidation } from "@/lib/sasi-v5/visual-repository";'
  );
}

const needle = `    const downloaded = await downloadTrustedVideo(job.provider, provider.videoUrl);
    const measuredDurationSeconds = readMp4DurationSeconds(downloaded.bytes);`;

if(!src.includes("SASI_V5_VIDEO_QUALITY_REJECTED")){
  if(!src.includes(needle)) throw new Error("PATCH_EXPECTED_TEXT_NOT_FOUND:production-validation");
  const injected = `    const downloaded = await downloadTrustedVideo(job.provider, provider.videoUrl);
    const tier = job.input.quality === "cinema" ? "premium" : job.input.quality === "balanced" ? "standard" : "fast";
    const v5Validation = await validateVideoDelivery(downloaded.bytes, {
      instruction: String(job.input.prompt ?? ""),
      tier,
      identityCritical: Boolean(job.input.identityCritical),
    });
    void recordVisualValidation({
      userId: job.user_id,
      projectId: job.project_id,
      taskId: null,
      kind: "video",
      tier,
      passed: v5Validation.pass,
      vector: v5Validation.quality,
      reasons: v5Validation.reasons,
      technical: v5Validation.technical,
      semanticModel: v5Validation.semantic?.model ?? null,
    });
    if (!v5Validation.pass) {
      throw new Error(\`SASI_V5_VIDEO_QUALITY_REJECTED:\${v5Validation.reasons.slice(0,3).join("|")}\`);
    }
    const measuredDurationSeconds = readMp4DurationSeconds(downloaded.bytes);`;
  src=src.replace(needle,injected);
}

fs.writeFileSync(prod,src,"utf8");
console.log("SASI_V51_PATCHES=PASS");
