import { routeSasiTask } from "./router";
import type { SasiAutonomyTask, SasiExecutionClass } from "./types";

export type SasiExecutionBoundary = {
  task: SasiAutonomyTask;
  executionClass: SasiExecutionClass;
  externalModelAllowed: boolean;
  autonomousBaselineRequired: boolean;
};

export function sasiExecutionBoundary(task: SasiAutonomyTask): SasiExecutionBoundary {
  const route = routeSasiTask(task);
  const externalModelAllowed = route.executionClass === "semantic-generation";
  return {
    task,
    executionClass: route.executionClass,
    externalModelAllowed,
    autonomousBaselineRequired: route.primary.some(
      (id) => !["semantic-write", "semantic-reason", "multimodal-generate"].includes(id),
    ),
  };
}

export function assertExternalModelAllowed(task: SasiAutonomyTask) {
  const boundary = sasiExecutionBoundary(task);
  if (!boundary.externalModelAllowed) {
    throw new Error(`SASI_EXTERNAL_MODEL_FORBIDDEN:${task}`);
  }
  return boundary;
}

export function assertAutonomousBaseline(task: SasiAutonomyTask) {
  const boundary = sasiExecutionBoundary(task);
  if (!boundary.autonomousBaselineRequired && boundary.executionClass !== "semantic-generation") {
    throw new Error(`SASI_AUTONOMOUS_BASELINE_MISSING:${task}`);
  }
  return boundary;
}
