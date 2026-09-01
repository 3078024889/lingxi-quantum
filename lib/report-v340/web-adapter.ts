import { compileLivingChapter } from "@/lib/report-v340/living-report-compiler";
import { LIVING_REPORT_SPECS } from "@/lib/report-v340/product-chapter-registry";
import type { CrossEvidencePattern, EvidenceLeafV340, LivingChapterSpec, LivingNode, ReportProductKey } from "@/lib/report-v340/types";
import { bandOf, type Library, type Scores } from "@/lib/knowledge-engine";
import type { ActivatedNode, ChapterSlots, EvidenceItem } from "@/lib/dendritic-engine";

const HEADING=/^(?:结构证据|深层机制|现实观察|阴影机制|反证校验|行动协议|断曰|所以然|验于事|反观|行法)\s*[:：]\s*/u;
const DIM_ZH:Record<string,string>={freedomNeed:"自主空间",stabilityNeed:"稳定承载",creativity:"创造展开",discipline:"秩序执行",riskTolerance:"风险行动",emotionalDepth:"情感深度",introspection:"内省辨识",socialDrive:"连接驱动",ambition:"成就推进",adaptability:"变化适应",stressRecovery:"压力恢复",crisisRebound:"危机复起",persistence:"长期持续",emotionalStability:"精神稳定",insight:"机会洞察",build:"价值构建",connect:"资源连接",express:"价值表达",risk:"风险承接"};
const dimZh=(value:string)=>DIM_ZH[value]??value;

function clean(value:string|undefined){return (value??"").replace(HEADING,"").replace(/本章只观察/gu,"所观者，").replace(/不被逐项翻译成/gu,"不逐项释作").replace(/说的不是([^，。；\n]+?)[，,]?\s*是/gu,"所指非$1，实为").replace(/不是([^，。；\n]+?)[，,]?\s*而是/gu,"非$1，实为").replace(/这说明/gu,"由此可见").replace(/这意味着/gu,"其后果为").replace(/可能表明/gu,"其证尚指向").replace(/综合来看|总体而言/gu,"合诸证而观").replace(/从某个角度/gu,"就此一端而观").replace(/你需要意识到/gu,"须知").replace(/在一定程度上/gu,"于此范围内").replace(/如果/gu,"若").replace(/应该/gu,"当").replace(/不要/gu,"勿").replace(/不能/gu,"不可").replace(/\r\n?/g,"\n").replace(/\n{3,}/g,"\n\n").replace(/([。！？；])\1+/gu,"$1").trim();}
function clauses(value:string|undefined,limit=3){return clean(value).split(/\n\s*\n|(?<=[。！？；])/u).map(x=>x.trim()).filter(Boolean).slice(0,limit);}
function sentence(value:string){const v=clean(value);return /[。！？；]$/u.test(v)?v:`${v}。`;}

function appendixSpec(product:ReportProductKey,index:number,chapter:string):LivingChapterSpec{
  return {id:`${product}-appendix-${index+1}`,product,titleZh:`证据附录 · ${chapter}`,question:"此项记录能支持什么，又不能支持什么？",resolves:"保留原始证据的解释边界，不以象征或单项分数替代人生。",minIndependentContexts:2,requiredDimensions:[],optionalDimensions:[],realityDomains:["daily","decision"]};
}

function specAt(product:ReportProductKey,index:number,chapter:string){return LIVING_REPORT_SPECS[product][index]??appendixSpec(product,index,chapter);}

function evidenceLeaves(product:ReportProductKey,evidence:EvidenceItem[],supportId:string):EvidenceLeafV340[]{
  return evidence.map((item,index)=>({id:`${product}-${item.key}-${index}`,product,dimension:item.key,context:`${item.source}:${item.key}`,answerSemantic:`${item.label}=${String(item.value)}`,strength:typeof item.value==="number"?Math.max(0,Math.min(1,item.value/100)):0.65,confidence:item.source==="fact"?0.92:0.82,supports:[supportId],challenges:[],realityTags:[item.source,item.label]}));
}

function activationNode(product:ReportProductKey,activation:ActivatedNode|undefined,fallback:LivingNode):LivingNode|null{
  if(!activation)return null;const fragments=activation.node.fragments;
  return {id:activation.node.id,product,titleZh:activation.node.dimensions.map(dimZh).join(" · ")||fallback.titleZh,userPain:fallback.userPain,coreTruth:clean(fragments.judgment)||clean(fragments.mechanism)||fallback.coreTruth,requiresAny:activation.node.dimensions,strengthWhenActive:clean(fragments.mechanism)||clean(fragments.judgment)||fallback.strengthWhenActive,costWhenOverused:clean(fragments.shadow)||fallback.costWhenOverused,suppressedForm:clean(fragments.narrative)||fallback.suppressedForm,livedScenes:clauses(fragments.scenario).length?clauses(fragments.scenario):fallback.livedScenes,falsifiers:clauses(fragments.counterevidence).length?clauses(fragments.counterevidence):fallback.falsifiers,classicalLexicon:[],modernEvidenceLexicon:activation.node.dimensions.map(dimZh)};
}

export function compileDendriticLivingText(args:{product:ReportProductKey;chapterIndex:number;chapterKey:string;slots:ChapterSlots;activated:ActivatedNode[];evidence:EvidenceItem[]}){
  const spec=specAt(args.product,args.chapterIndex,args.chapterKey);
  const primary:LivingNode={id:`${spec.id}-primary`,product:args.product,titleZh:spec.titleZh,userPain:spec.question,coreTruth:clean(args.slots.judgment),requiresAny:args.evidence.map(x=>x.key),strengthWhenActive:clean(args.slots.mechanism),costWhenOverused:clean(args.slots.shadow),suppressedForm:clean(args.slots.narrative)||"此力若长期无位，常改作回避、拖延或过度代偿。",livedScenes:clauses(args.slots.scenario),falsifiers:clauses(args.slots.counterevidence),classicalLexicon:[],modernEvidenceLexicon:args.evidence.map(x=>x.label)};
  const support=activationNode(args.product,args.activated[0],primary)??(args.evidence[1]?{...primary,id:`${spec.id}-support`,titleZh:args.evidence[1].label,coreTruth:`${args.evidence[1].label}录得${String(args.evidence[1].value)}；此据只校准主断，不单独定人。`}:null);
  if(support)primary.strengthWhenActive=support.strengthWhenActive;
  const counter=null;
  const leaves=evidenceLeaves(args.product,args.evidence,primary.id);
  const pattern:CrossEvidencePattern={primary,support,counter,leaves,contradictions:[],confidence:new Set(leaves.map(x=>x.context)).size>=4?"clear":"strong"};
  const chapter=compileLivingChapter(spec,pattern);
  return `${spec.titleZh}\n\n${chapter.bodyZh}\n\n${chapter.verificationZh}`;
}

function conditionDims(value:unknown):string[]{
  if(!value||typeof value!=="object")return[];const c=value as Record<string,unknown>;
  if(c.contrast&&Array.isArray(c.contrast))return c.contrast.filter((x):x is string=>typeof x==="string");
  for(const key of ["bothLow","bothHigh"]){if(Array.isArray(c[key]))return (c[key] as unknown[]).filter((x):x is string=>typeof x==="string");}
  return[];
}

function hybridNode(args:{product:ReportProductKey;spec:LivingChapterSpec;library:Library;blockIds:string[];scores:Scores;chapterKey:string}):LivingNode{
  const structure=args.blockIds.map(id=>args.library.nodes.find(node=>node.id===id)).find(Boolean);
  const combo=args.blockIds.map(id=>args.library.combos.find(node=>node.id===id)).find(Boolean);
  const state=args.blockIds.map(id=>args.library.states?.find(node=>node.id===id)).find(Boolean);
  const source=structure?.fieldText.zh??combo?.fieldText.zh??state?.fieldText.zh??"此章证据未成，不强立结论。";
  const dims=structure?[structure.dim]:combo?conditionDims(combo.when):Object.keys(args.scores);
  const tail=args.library.tails?.find(item=>item.chapter===args.chapterKey&&(!structure||(item.dim===structure.dim&&item.band===bandOf(args.scores[structure.dim]??50))));
  return {id:structure?.id??combo?.id??state?.id??`${args.spec.id}-open`,product:args.product,titleZh:args.spec.titleZh,userPain:args.spec.question,coreTruth:clean(structure?.corePattern??clauses(source,1)[0]??source),requiresAny:dims,strengthWhenActive:sentence(clauses(source,2)[0]??source),costWhenOverused:clean(structure?.shadowSide??clauses(source,3)[1]??"此力若独用，所得之利会转成另一处隐耗。"),suppressedForm:clean(structure?.growthDirection??"若现实没有容器，此力会退为等待、绕行或一次性爆发。"),livedScenes:clauses(source),falsifiers:[clean(tail?.fieldText.zh??`若近三次与「${args.spec.question}」有关的真实事件均不符合上述次序，本断即降级。`)],classicalLexicon:[],modernEvidenceLexicon:dims};
}

export function compileHybridLivingSections(args:{product:ReportProductKey;library:Library;scores:Scores;chapters:Array<{key:string;blockIds:string[]}>}){
  return args.chapters.map((chapter,index)=>{const spec=specAt(args.product,index,chapter.key);const primary=hybridNode({product:args.product,spec,library:args.library,blockIds:chapter.blockIds,scores:args.scores,chapterKey:chapter.key});const ranked=Object.entries(args.scores).sort((a,b)=>b[1]-a[1]);const support:LivingNode=ranked[1]?{...primary,id:`${spec.id}-support`,titleZh:dimZh(ranked[1][0]),coreTruth:`${dimZh(ranked[1][0])}录得${ranked[1][1]}，可承主力，亦可在主力过用时改写结果。`,requiresAny:[ranked[1][0]]}:primary;const counter:LivingNode|null=ranked.at(-1)?{...primary,id:`${spec.id}-counter`,titleZh:dimZh(ranked.at(-1)![0]),coreTruth:`${dimZh(ranked.at(-1)![0])}录得${ranked.at(-1)![1]}；此处若长期无位，主力之成便会留下后账。`,requiresAny:[ranked.at(-1)![0]]}:null;const leaves=Object.entries(args.scores).map(([dimension,value],leafIndex):EvidenceLeafV340=>({id:`${spec.id}-${dimension}-${leafIndex}`,product:args.product,dimension,context:`calculation:${dimension}`,answerSemantic:`${dimZh(dimension)}=${value}`,strength:value/100,confidence:0.86,supports:[primary.id],challenges:counter&&dimZh(dimension)===counter.titleZh?[primary.id]:[],realityTags:[dimZh(dimension)]}));const contradictions=counter?leaves.filter(x=>x.challenges.length):[];const pattern:CrossEvidencePattern={primary,support,counter,leaves,contradictions,confidence:"clear"};const living=compileLivingChapter(spec,pattern);return `${spec.titleZh}\n\n${living.bodyZh}\n\n${living.verificationZh}`;});
}
