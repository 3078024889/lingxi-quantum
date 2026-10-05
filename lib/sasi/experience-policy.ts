export const SASI_EXPERIENCE_POLICY={
  version:"2026-10-05-r8r1",
  dailyBudgetSecondsEquivalent:180,
  displayRemainingCountdown:false,
  reset:"daily",
  carryOver:false,
  chargeLocalProcessing:false,
  chargeUploadTime:false,
  chargeReadingTime:false,
  chargeFailedProviderAttempts:false,
  chargeAutomaticFallbackAttempts:false,
  exposeProviderNamesInExperienceUi:false,
} as const;

export type ExperienceTaskClass="light_text"|"grounded_knowledge"|"research"|"website_plan"|"drama_plan";
export const SASI_EXPERIENCE_COST:Record<ExperienceTaskClass,number>={
  light_text:8,
  grounded_knowledge:18,
  research:28,
  website_plan:36,
  drama_plan:32,
};

export function experienceUnitsFor(kind:ExperienceTaskClass){
  return SASI_EXPERIENCE_COST[kind];
}
