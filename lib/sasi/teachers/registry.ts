import type { SasiModelProvider } from "@/lib/sasi/models/model-mesh";

export type SasiTeacherRole =
  | "extractor"
  | "reasoner"
  | "critic"
  | "fact-checker"
  | "domain-expert"
  | "synthesizer";

export type SasiTeacherProfile = {
  id: string;
  provider: SasiModelProvider;
  model: string;
  enabled: boolean;
  verified: boolean;
  byok: boolean;
  roles: SasiTeacherRole[];
  domains: string[];
  reliability: number;
  costWeight: number;
  latencyWeight: number;
};

export type SasiTeacherTask = {
  role: SasiTeacherRole;
  domain?: string;
  requireVerified?: boolean;
  preferByok?: boolean;
};

export function selectTeacher(
  teachers: SasiTeacherProfile[],
  task: SasiTeacherTask,
) {
  return teachers
    .filter((teacher) => teacher.enabled)
    .filter((teacher) => teacher.roles.includes(task.role))
    .filter((teacher) => !task.requireVerified || teacher.verified)
    .filter(
      (teacher) =>
        !task.domain ||
        teacher.domains.length === 0 ||
        teacher.domains.includes(task.domain),
    )
    .map((teacher) => {
      const score =
        Math.max(0, Math.min(1, teacher.reliability)) * 0.7 +
        (task.preferByok && teacher.byok ? 0.1 : 0) -
        Math.max(0, Math.min(1, teacher.costWeight)) * 0.12 -
        Math.max(0, Math.min(1, teacher.latencyWeight)) * 0.08;
      return { teacher, score };
    })
    .sort((a, b) => b.score - a.score)[0] ?? null;
}
