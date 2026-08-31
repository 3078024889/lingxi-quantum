import { calculateAnimalTrace } from "./animal";
import { calculateObjectTrace } from "./object";
import type {
  TargetTraceInput,
  TargetTraceOptions,
  TargetTraceResult,
} from "./types";

export async function calculateTargetTrace(
  input: TargetTraceInput,
  options: TargetTraceOptions = {},
): Promise<TargetTraceResult> {
  if (input.targetKind === "animal") {
    return calculateAnimalTrace(input, options);
  }
  return calculateObjectTrace(input, options);
}


