import type{SasiSkillDefinition,SasiSkillId,SasiMode}from"./types";

const all:SasiMode[]=["drama","website","book","learning","research"];
const knowledge:SasiMode[]=["book","learning","research"];

export const SASI_SKILLS:Record<SasiSkillId,SasiSkillDefinition>={
 "agent-skill-discovery":{
  id:"agent-skill-discovery",title:"Progressive skill discovery",
  description:"Keep many capabilities available while loading only the skills relevant to the current task.",
  modes:all,triggers:[],priority:100,
  guidance:"Use progressive disclosure: activate only capabilities needed for this request; do not flood context with unrelated procedures.",
  inspiration:["Agent Skills open standard","Haystack SkillToolset"],licensePattern:"open-standard / Apache-2.0-inspired"
 },
 "document-understanding":{
  id:"document-understanding",title:"Document understanding",
  description:"Preserve reading order, structure, tables, and source boundaries when working from user documents.",
  modes:knowledge.concat(["website"]),triggers:["pdf","docx","pptx","xlsx","epub","document","文档","书","论文","表格"],priority:90,
  guidance:"Preserve document structure and source boundaries. Distinguish extracted text, inferred structure, and missing content.",
  inspiration:["Docling","MarkItDown"],licensePattern:"MIT-style projects"
 },
 "semantic-retrieval":{
  id:"semantic-retrieval",title:"Semantic retrieval",
  description:"Route questions to the smallest relevant evidence set before generation.",
  modes:knowledge,triggers:["查找","检索","search","find","compare","对比","证据"],priority:88,
  guidance:"Retrieve before generating. Prefer a small, relevant evidence set and keep source identifiers attached to every excerpt.",
  inspiration:["pgvector","Qdrant","LlamaIndex"],licensePattern:"open-source"
 },
 "evidence-grounding":{
  id:"evidence-grounding",title:"Evidence grounding",
  description:"Answer from supplied evidence and keep claims traceable.",
  modes:knowledge,triggers:[],priority:98,
  guidance:"Never present external knowledge as supplied evidence. Preserve citation identifiers and state evidence gaps explicitly.",
  inspiration:["Haystack context engineering","LlamaIndex RAG patterns"],licensePattern:"open-source patterns"
 },
 "structured-output":{
  id:"structured-output",title:"Structured output",
  description:"Produce predictable schemas for artifacts and machine-consumable results.",
  modes:all,triggers:["json","schema","结构化","表格","清单","计划","outline","spec"],priority:84,
  guidance:"When the task has an explicit structure, produce a stable schema first, then content; validate required fields before delivery.",
  inspiration:["Instructor","JSON Schema patterns"],licensePattern:"permissive open-source patterns"
 },
 "web-research":{
  id:"web-research",title:"Web research",
  description:"Collect fresh public web evidence with explicit provenance when the task permits external research.",
  modes:["research","website"],triggers:["最新","网页","互联网","web","research","搜","新闻","资料"],priority:75,
  guidance:"For external research, separate fetched evidence from model inference, record source provenance, and do not treat inaccessible pages as verified.",
  inspiration:["Crawl4AI","MCP Fetch"],licensePattern:"open-source patterns"
 },
 "browser-execution":{
  id:"browser-execution",title:"Browser execution",
  description:"Use browser automation only when an action truly requires a graphical or authenticated web flow.",
  modes:["website","research"],triggers:["浏览器","网页操作","登录","点击","browser","dashboard","表单"],priority:65,
  guidance:"Prefer APIs and deterministic tools. Use browser execution only when necessary; verify the final page state after actions.",
  inspiration:["Browser Use","Playwright","MCP reference servers"],licensePattern:"open-source patterns"
 },
 "multi-model-routing":{
  id:"multi-model-routing",title:"Multi-model routing",
  description:"Choose capability by task requirements rather than exposing provider mechanics to the user.",
  modes:all,triggers:["模型","视频","图片","音频","model","image","video","audio"],priority:82,
  guidance:"Route by required capability, quality, latency, context size, and user-connected availability. Keep provider mechanics out of normal user-facing copy.",
  inspiration:["LiteLLM","Semantic Router"],licensePattern:"MIT-style patterns"
 },
 "workflow-orchestration":{
  id:"workflow-orchestration",title:"Workflow orchestration",
  description:"Represent complex work as explicit states, steps, retries, and verification gates.",
  modes:all,triggers:["多步骤","流程","项目","workflow","pipeline","批量","series"],priority:86,
  guidance:"For multi-step work, use explicit state transitions, bounded retries, checkpoints, and verification before advancing.",
  inspiration:["LangGraph","Haystack"],licensePattern:"MIT/Apache-2.0 patterns"
 },
 "observability":{
  id:"observability",title:"Observability",
  description:"Attach traceable execution metadata without exposing secrets or internal provider credentials.",
  modes:all,triggers:["失败","错误","重试","trace","debug","监控","audit"],priority:70,
  guidance:"Record step, duration, outcome, and safe error class. Redact secrets and never log raw credentials or sensitive user payloads.",
  inspiration:["OpenTelemetry"],licensePattern:"Apache-2.0 pattern"
 },
 "multimodal-continuity":{
  id:"multimodal-continuity",title:"Multimodal continuity",
  description:"Keep characters, scenes, references, rights, duration, and output specs consistent across short-drama generation.",
  modes:["drama"],triggers:[],priority:96,
  guidance:"Preserve character identity, scene continuity, reference-image binding, rights confirmation, duration, ratio, and resolution constraints across shots.",
  inspiration:["SASI existing production graph","agent workflow patterns"],licensePattern:"native"
 },
 "website-production":{
  id:"website-production",title:"Website production",
  description:"Turn a brief into validated, portable website artifacts with structure, assets, SEO, and deployment readiness.",
  modes:["website"],triggers:[],priority:96,
  guidance:"Produce a complete website artifact: information architecture, accessible markup, reusable sections, metadata, assets, validation, export, and deployment evidence.",
  inspiration:["SASI web builder skill","structured artifact patterns"],licensePattern:"native"
 }
};

export const DEFAULT_MODE_SKILLS:Record<SasiMode,SasiSkillId[]>={
 drama:["agent-skill-discovery","multimodal-continuity","workflow-orchestration","multi-model-routing","observability"],
 website:["agent-skill-discovery","website-production","structured-output","workflow-orchestration","multi-model-routing","observability"],
 book:["agent-skill-discovery","document-understanding","semantic-retrieval","evidence-grounding","structured-output","observability"],
 learning:["agent-skill-discovery","document-understanding","semantic-retrieval","evidence-grounding","structured-output","observability"],
 research:["agent-skill-discovery","document-understanding","semantic-retrieval","evidence-grounding","web-research","structured-output","observability"],
};
