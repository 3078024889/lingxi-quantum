import type { SasiArtifact, SasiCapabilityContext, SasiExecutionEvent, SasiKernelResult, SasiKernelTask } from "./types";

export type SasiGraphNode = {
  id: string;
  dependsOn?: string[];
  maxRetries?: number;
  timeoutMs?: number;
  run: (ctx: SasiCapabilityContext, artifacts: ReadonlyMap<string, SasiArtifact[]>) => Promise<SasiArtifact[]>;
  validate?: (artifacts: SasiArtifact[]) => string | null;
};
export type SasiExecutionGraph = { id: string; nodes: SasiGraphNode[] };

function validateGraph(graph: SasiExecutionGraph) {
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (!node.id || ids.has(node.id)) throw new Error(`GRAPH_NODE_DUPLICATE:${node.id}`);
    ids.add(node.id);
  }
  for (const node of graph.nodes) for (const dep of node.dependsOn ?? []) if (!ids.has(dep)) throw new Error(`GRAPH_NODE_MISSING:${dep}`);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, id: string) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`GRAPH_NODE_TIMEOUT:${id}`)), timeoutMs);
    promise.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
  });
}

export async function executeGraph(input: { task: SasiKernelTask; graph: SasiExecutionGraph; ctx: SasiCapabilityContext; capability: string }): Promise<SasiKernelResult> {
  validateGraph(input.graph);
  const artifacts = new Map<string, SasiArtifact[]>();
  const done = new Set<string>();
  const pending = new Map(input.graph.nodes.map(node => [node.id, node]));
  const history: SasiExecutionEvent[] = [];
  const record = (event: string, node?: string, attempt?: number, data?: Record<string, unknown>) => {
    history.push({ at: input.ctx.now().toISOString(), event, node, attempt, data });
    input.ctx.log(event, { taskId: input.task.id, graph: input.graph.id, node, attempt, ...(data ?? {}) });
  };
  while (pending.size) {
    if (input.ctx.signal?.aborted) throw new Error("TASK_ABORTED");
    const ready = [...pending.values()].filter(node => (node.dependsOn ?? []).every(dep => done.has(dep)));
    if (!ready.length) throw new Error(`GRAPH_CYCLE_OR_BLOCKED:${[...pending.keys()].join(",")}`);
    const outputs = await Promise.all(ready.map(async node => {
      const retries = Math.max(0, Math.min(3, node.maxRetries ?? 0));
      let last: unknown;
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        record("graph.node.start", node.id, attempt);
        try {
          const output = await withTimeout(node.run(input.ctx, artifacts), node.timeoutMs ?? 0, node.id);
          const error = node.validate?.(output) ?? null;
          if (error) throw new Error(`GRAPH_VALIDATION_FAILED:${node.id}:${error}`);
          record("graph.node.done", node.id, attempt, { artifacts: output.length });
          return { node, output };
        } catch (error) {
          last = error;
          record("graph.node.failed", node.id, attempt, { error: error instanceof Error ? error.message : String(error) });
        }
      }
      throw last instanceof Error ? last : new Error(`GRAPH_NODE_FAILED:${node.id}`);
    }));
    for (const { node, output } of outputs) { artifacts.set(node.id, output); done.add(node.id); pending.delete(node.id); }
  }
  return { ok: true, taskId: input.task.id, engine: "sasi-kernel", capability: input.capability, artifacts: [...artifacts.values()].flat(), history };
}
