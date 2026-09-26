export type SasiResourceSnapshot = {
  availableRamMb: number;
  cpuLoad: number;
  queueDepth: number;
  ingestWorkers: number;
  computeWorkers: number;
};

export type SasiResourceDecision = {
  pauseIngest: boolean;
  reduceIngestWorkers: boolean;
  preferBrowserExecution: boolean;
  allowHeavyLocalCompute: boolean;
};

export function decideSasiResources(s: SasiResourceSnapshot): SasiResourceDecision {
  const ram = Number.isFinite(s.availableRamMb) ? Math.max(0, s.availableRamMb) : 0;
  const cpu = Number.isFinite(s.cpuLoad) ? Math.max(0, s.cpuLoad) : 1;
  const queue = Number.isFinite(s.queueDepth) ? Math.max(0, s.queueDepth) : 0;

  return {
    pauseIngest: ram < 2048,
    reduceIngestWorkers: ram < 4096 || cpu > 0.9 || queue > 10000,
    preferBrowserExecution: ram < 4096 || cpu > 0.8,
    allowHeavyLocalCompute: ram >= 4096 && cpu <= 0.9 && queue <= 10000,
  };
}
