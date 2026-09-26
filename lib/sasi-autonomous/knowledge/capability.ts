import type { Capability, SasiArtifact, SasiTask } from "../types";
import { executeGraph, type ExecutionGraph } from "../graph";
import { HybridEvidenceIndex, type EvidenceInput, type RankedEvidence } from "./hybrid-index";
import { synthesizeEvidenceAnswer } from "./answer";

function jsonValue<T>(artifacts: ReadonlyMap<string, SasiArtifact[]>, node: string, name: string): T {
  const hit = artifacts.get(node)?.find((artifact) => artifact.type === "json" && artifact.name === name);
  if (!hit) throw new Error(`ARTIFACT_MISSING:${node}:${name}`);
  return hit.value as T;
}

type Payload = { question: string; evidence: EvidenceInput[]; mode?: "book"|"learning"|"research" };

function buildKnowledgeGraph(task: SasiTask): ExecutionGraph {
  const input = (task.input ?? {}) as Partial<Payload>;
  const question = String(input.question ?? "").trim().slice(0, 4000);
  const evidence = Array.isArray(input.evidence) ? input.evidence.slice(0, 24) : [];
  return { id: "knowledge-answer-v2", nodes: [
    {
      id: "retrieve", maxRetries: 1, timeoutMs: 4000,
      async run() {
        if (!question || !evidence.length) throw new Error("INVALID_INPUT");
        const ranked = new HybridEvidenceIndex(evidence).searchExpanded(question, task.intelligence === "high" ? 14 : task.intelligence === "light" ? 5 : 9);
        return [{ type:"json", name:"ranked-evidence", value: ranked }];
      },
      validate(output) { return Array.isArray(output[0]?.value) ? null : "RETRIEVAL_INVALID"; },
    },
    {
      id: "synthesize", dependsOn:["retrieve"], timeoutMs: 4000,
      async run(_ctx, artifacts) {
        const ranked = jsonValue<RankedEvidence[]>(artifacts,"retrieve","ranked-evidence");
        const result = synthesizeEvidenceAnswer({ question, evidence: ranked, intelligence: task.intelligence, mode: input.mode });
        return [{ type:"json", name:"answer", value:{ ...result, evidence: ranked.map((x)=>({ index:x.index,title:x.title,locator:x.locator??"",score:Number(x.score.toFixed(4)),matchedTerms:x.matchedTerms })) } }];
      },
      validate(output) { const value=output[0]?.value as {answer?:unknown}|undefined; return typeof value?.answer === "string" && value.answer.trim() ? null : "ANSWER_EMPTY"; },
    },
  ]};
}

export const knowledgeAnswerCapability: Capability = {
  id:"knowledge.answer",
  canRun(task){ return task.kind==="knowledge" && task.action==="answer"; },
  async run(task,ctx){ return executeGraph({task,ctx,capability:"knowledge.answer",graph:buildKnowledgeGraph(task)}); },
};

export const knowledgeSummaryCapability: Capability = {
  id:"knowledge.summary",
  canRun(task){ return task.kind==="knowledge" && task.action==="summary"; },
  async run(task,ctx){
    const raw=(task.input??{}) as Record<string,unknown>;
    const evidence=Array.isArray(raw.evidence)?raw.evidence:[];
    return executeGraph({ task:{...task,input:{...raw,question:String(raw.question||"总结这批资料"),evidence,mode:raw.mode||"book"}}, ctx, capability:"knowledge.summary", graph:buildKnowledgeGraph({...task,input:{...raw,question:String(raw.question||"总结这批资料"),evidence,mode:raw.mode||"book"}}) });
  },
};
