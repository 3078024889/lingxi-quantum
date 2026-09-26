export type KnowledgeIntent = "definition" | "causal" | "procedure" | "comparison" | "timeline" | "summary" | "fact";

export function classifyKnowledgeIntent(question: string): KnowledgeIntent {
  if (/总结|摘要|概括|overview|summary|summarize/i.test(question)) return "summary";
  if (/区别|不同|比较|相比|versus|\bvs\b|compare|difference/i.test(question)) return "comparison";
  if (/时间线|先后|什么时候|哪一年|history|timeline|when/i.test(question)) return "timeline";
  if (/为什么|原因|为何|why|reason|cause/i.test(question)) return "causal";
  if (/如何|怎么|步骤|方法|流程|how|steps|procedure/i.test(question)) return "procedure";
  if (/是什么|什么是|定义|含义|what is|definition|means/i.test(question)) return "definition";
  return "fact";
}
