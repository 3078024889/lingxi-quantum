import { submitNativeJob } from "@/lib/sasi-kernel/compute/native-client";
import { buildDirectorReasoningPrompt } from "@/lib/sasi-kernel/reasoning/director";
import type { SasiCapability, SasiKernelResult } from "@/lib/sasi-kernel/types";

function owner(task: { ownerId?: string | null }) {
  if (!task.ownerId) throw new Error("SASI_NATIVE_OWNER_REQUIRED");
  return task.ownerId;
}

function queuedResult(taskId: string, capability: string, job: Awaited<ReturnType<typeof submitNativeJob>>): SasiKernelResult {
  return {
    ok: true,
    taskId,
    engine: "sasi-kernel",
    capability,
    artifacts: [{
      type: "json",
      name: "native-job.json",
      mime: "application/json",
      value: job,
      metadata: { state: job.state, jobId: job.id },
    }],
    history: [{ at: new Date().toISOString(), event: "native.job.queued", data: { jobId: job.id, kind: job.kind } }],
  };
}

export const nativeReasonCapability: SasiCapability = {
  manifest: {
    id: "reason.native",
    version: "1.0.0",
    executionClass: "semantic-generation",
    runtimeTargets: ["worker"],
    localFirst: true,
    deterministic: false,
    browserEligible: false,
    externalOptional: true,
    fallbackIds: ["knowledge.answer"],
    resources: { cpu: "heavy", memoryMb: 8192, gpu: "required" },
  },
  canRun(task) {
    return (task.kind === "knowledge" || task.kind === "code" || task.kind === "website") && task.action === "reason";
  },
  async execute(task) {
    const raw = (task.input ?? {}) as Record<string, unknown>;
    const prompt = String(raw.prompt ?? raw.question ?? "").trim();
    if (!prompt) throw new Error("SASI_NATIVE_REASON_PROMPT_REQUIRED");
    const job = await submitNativeJob({
      taskId: task.id,
      ownerId: owner(task),
      projectId: task.projectId,
      kind: "reason",
      input: {
        prompt: prompt.slice(0, 24000),
        mode: raw.mode === "deep" ? "deep" : "standard",
        responseFormat: raw.responseFormat === "json" ? "json" : "text",
        system: typeof raw.system === "string" ? raw.system.slice(0, 8000) : undefined,
      },
    });
    return queuedResult(task.id, "reason.native", job);
  },
};

export const nativeDirectorCapability: SasiCapability = {
  manifest: {
    id: "director.native",
    version: "1.0.0",
    executionClass: "semantic-generation",
    runtimeTargets: ["worker"],
    localFirst: true,
    deterministic: false,
    browserEligible: false,
    externalOptional: true,
    fallbackIds: ["video.plan"],
    resources: { cpu: "heavy", memoryMb: 8192, gpu: "required" },
  },
  canRun(task) { return task.kind === "video" && task.action === "direct"; },
  async execute(task) {
    const raw = (task.input ?? {}) as Record<string, unknown>;
    const story = String(raw.story ?? raw.script ?? "").trim();
    if (!story) throw new Error("SASI_DIRECTOR_STORY_REQUIRED");
    const prompt = buildDirectorReasoningPrompt({
      title: typeof raw.title === "string" ? raw.title : undefined,
      story,
      durationSec: Number(raw.durationSec) || 30,
      ratio: raw.ratio === "16:9" || raw.ratio === "1:1" ? raw.ratio : "9:16",
      tone: typeof raw.tone === "string" ? raw.tone : undefined,
      audience: typeof raw.audience === "string" ? raw.audience : undefined,
    });
    const job = await submitNativeJob({
      taskId: task.id,
      ownerId: owner(task),
      projectId: task.projectId,
      kind: "reason",
      input: { prompt, mode: "deep", responseFormat: "json", director: true },
    });
    return queuedResult(task.id, "director.native", job);
  },
};

export const nativeImageCapability: SasiCapability = {
  manifest: {
    id: "image.generate.native",
    version: "1.0.0",
    executionClass: "semantic-generation",
    runtimeTargets: ["worker"],
    localFirst: true,
    deterministic: false,
    browserEligible: false,
    externalOptional: true,
    fallbackIds: ["image.render"],
    resources: { cpu: "heavy", memoryMb: 16384, gpu: "required" },
  },
  canRun(task) { return task.kind === "image" && task.action === "generate"; },
  async execute(task) {
    const raw = (task.input ?? {}) as Record<string, unknown>;
    const prompt = String(raw.prompt ?? "").trim();
    if (!prompt) throw new Error("SASI_IMAGE_PROMPT_REQUIRED");
    const job = await submitNativeJob({
      taskId: task.id,
      ownerId: owner(task),
      projectId: task.projectId,
      kind: "image",
      input: {
        prompt: prompt.slice(0, 4000),
        negativePrompt: typeof raw.negativePrompt === "string" ? raw.negativePrompt.slice(0, 2000) : "",
        ratio: ["1:1", "16:9", "9:16"].includes(String(raw.ratio)) ? raw.ratio : "1:1",
        seed: Number.isFinite(Number(raw.seed)) ? Number(raw.seed) : undefined,
        steps: Math.max(1, Math.min(8, Number(raw.steps) || 4)),
      },
    });
    return queuedResult(task.id, "image.generate.native", job);
  },
};

export const nativeVideoCapability: SasiCapability = {
  manifest: {
    id: "video.generate.native",
    version: "1.0.0",
    executionClass: "semantic-generation",
    runtimeTargets: ["worker"],
    localFirst: true,
    deterministic: false,
    browserEligible: false,
    externalOptional: true,
    fallbackIds: ["video.storyboard", "video.compose"],
    resources: { cpu: "heavy", memoryMb: 24576, gpu: "required" },
  },
  canRun(task) { return task.kind === "video" && task.action === "generate"; },
  async execute(task) {
    const raw = (task.input ?? {}) as Record<string, unknown>;
    const prompt = String(raw.prompt ?? raw.visualPrompt ?? "").trim();
    if (!prompt) throw new Error("SASI_VIDEO_PROMPT_REQUIRED");
    const job = await submitNativeJob({
      taskId: task.id,
      ownerId: owner(task),
      projectId: task.projectId,
      kind: "video",
      input: {
        prompt: prompt.slice(0, 5000),
        negativePrompt: typeof raw.negativePrompt === "string" ? raw.negativePrompt.slice(0, 2000) : "",
        ratio: ["16:9", "9:16", "1:1"].includes(String(raw.ratio)) ? raw.ratio : "16:9",
        durationSec: Math.max(2, Math.min(10, Number(raw.durationSec) || 5)),
        seed: Number.isFinite(Number(raw.seed)) ? Number(raw.seed) : undefined,
      },
    });
    return queuedResult(task.id, "video.generate.native", job);
  },
};
