export type GroundedEvidence = {
  index: number;
  title: string;
  locator?: string;
  text: string;
};

export type KnowledgeMode = "book" | "learning" | "research";
export type IntelligenceTier = "light" | "standard" | "high";

const POSITIVE = [
  "利多","上涨","走高","反弹","支撑","企稳","突破","回升","上行","转强",
  "降息","利率回落","实际利率回落","美元走弱","美元下跌","避险","买盘","流入",
];
const NEGATIVE = [
  "利空","下跌","走低","回落","压制","跌破","转弱","承压","上升","走强",
  "加息","利率上升","实际利率上升","美元走强","美元上涨","抛售","流出",
];

function normalize(value:string){
  return value.normalize("NFKC").replace(/\s+/g," ").trim();
}
function sentenceSplit(text:string){
  return normalize(text)
    .split(/(?<=[。！？!?；;])|\n+/u)
    .map(x=>x.trim())
    .filter(x=>x.length>=8&&x.length<=900);
}
function tokens(value:string){
  const text=normalize(value).toLowerCase();
  const set=new Set<string>(text.match(/[a-z0-9][a-z0-9_./%-]{1,}|[\u3400-\u9fff]{2,}/g)??[]);
  for(const token of [...set]){
    if(/^[\u3400-\u9fff]+$/.test(token)&&token.length>2){
      for(let i=0;i<token.length-1;i++)set.add(token.slice(i,i+2));
    }
  }
  return [...set].slice(0,96);
}
function overlapScore(sentence:string,question:string){
  const q=new Set(tokens(question));
  const s=tokens(sentence);
  let score=0;
  for(const t of s)if(q.has(t))score+=Math.min(5,t.length);
  if(/\d/.test(sentence))score+=.5;
  return score;
}
function directionalScore(sentence:string){
  let score=0;
  for(const x of POSITIVE)if(sentence.includes(x))score++;
  for(const x of NEGATIVE)if(sentence.includes(x))score--;
  return score;
}
function asksDirection(question:string){
  return /涨还是跌|涨跌|会上涨|会下跌|看涨|看跌|利多|利空|方向|走势|偏多|偏空/.test(question);
}
function assetName(question:string){
  for(const x of ["黄金","白银","原油","美元","欧元","英镑","日元","比特币","BTC","ETH","纳指","标普"]){
    if(question.toUpperCase().includes(x.toUpperCase()))return x;
  }
  return "这个标的";
}

export function buildGroundedReasoningPrompt(input:{
  question:string;
  mode:KnowledgeMode;
  intelligence:IntelligenceTier;
  evidence:GroundedEvidence[];
}){
  const evidence=input.evidence.map(e=>[
    `[${e.index}] ${e.title}${e.locator?` · ${e.locator}`:""}`,
    e.text.slice(0,input.intelligence==="high"?8000:input.intelligence==="standard"?5200:3000),
  ].join("\n")).join("\n\n");

  const depth=input.intelligence==="high"
    ?"先拆问题，再比较证据，检查冲突，形成结论后再自我复核一次。"
    :input.intelligence==="standard"
      ?"综合多条证据，不要逐句复读；先回答，再解释依据与边界。"
      :"快速抓核心，优先给直接答案。";

  return [
    "你是灵犀场 SASI 的资料推理核心。",
    "你的工作不是摘句，也不是把搜索结果编号后重新排列，而是读懂问题、综合证据、给出可核对的答案。",
    depth,
    "硬规则：",
    "1. 只能使用给出的证据支持事实性结论；不能把未提供的信息伪装成事实。",
    "2. 每个关键事实或判断后写 [证据编号]。编号只能来自下方证据。",
    "3. 多条证据方向冲突时，明确说明冲突来自哪里，并解释为什么不能强行合并。",
    "4. 用户问“涨还是跌、利多还是利空、该怎么理解”时，先给条件式方向判断，再解释驱动因素；不要只复制原句。",
    "5. 区分：已发生事实 / 作者判断 / 条件预测。不要把预测写成已经发生。",
    "6. 回答结构自然，不要机械输出十条摘抄。",
    "7. 如果证据不足，直接说还不能确认，并指出缺哪类证据。",
    `模式：${input.mode}；深度：${input.intelligence}`,
    "",
    "用户问题：",
    input.question.slice(0,4000),
    "",
    "证据：",
    evidence,
  ].join("\n");
}

export function validateGroundedAnswer(answer:string,evidence:GroundedEvidence[]){
  const text=String(answer??"").trim();
  if(text.length<20)return{ok:false as const,reason:"ANSWER_TOO_SHORT"};
  const allowed=new Set(evidence.map(e=>e.index));
  const refs=[...text.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]));
  if(!refs.length)return{ok:false as const,reason:"CITATIONS_MISSING"};
  if(refs.some(ref=>!allowed.has(ref)))return{ok:false as const,reason:"CITATION_OUT_OF_RANGE"};
  return{ok:true as const,refs:[...new Set(refs)]};
}

export function deterministicGroundedAnswer(input:{
  question:string;
  mode:KnowledgeMode;
  intelligence:IntelligenceTier;
  evidence:GroundedEvidence[];
}){
  const rows=input.evidence.flatMap((e,rank)=>sentenceSplit(e.text).map(sentence=>({
    evidence:e,
    sentence,
    relevance:overlapScore(sentence,input.question)+(Math.max(0,8-rank)*.25),
    direction:directionalScore(sentence),
  }))).sort((a,b)=>b.relevance-a.relevance);

  const seen=new Set<string>();
  const selected=rows.filter(row=>{
    const key=row.sentence.replace(/[^\p{L}\p{N}]/gu,"").slice(0,100);
    if(!key||seen.has(key))return false;
    seen.add(key);return true;
  }).slice(0,input.intelligence==="high"?10:input.intelligence==="standard"?7:4);

  if(!selected.length){
    return{answer:"现有资料不足以回答这个问题。可以继续加入更相关的原文。",citations:[] as number[],confidence:0,method:"deterministic-grounded-v20"};
  }

  const refs=[...new Set(selected.map(x=>x.evidence.index))];
  const directionAsked=asksDirection(input.question);
  if(directionAsked){
    const score=selected.reduce((sum,row)=>sum+row.direction,0);
    const asset=assetName(input.question);
    const conclusion=score>=2
      ? `${asset}在当前这批资料里整体偏多，但仍是有条件的判断，不等于已经确认单边上涨。`
      : score<=-2
        ? `${asset}在当前这批资料里整体偏空，主要压力因素占上风，但还不能把条件判断写成必然下跌。`
        : `${asset}在当前资料里是多空拉扯，暂时没有足够证据确认单一方向。`;

    const positive=selected.filter(x=>x.direction>0).slice(0,3);
    const negative=selected.filter(x=>x.direction<0).slice(0,3);
    const neutral=selected.filter(x=>x.direction===0).slice(0,2);
    const lines=[conclusion];
    if(positive.length)lines.push("",`支撑方向：${positive.map(x=>`${x.sentence} [${x.evidence.index}]`).join("；")}`);
    if(negative.length)lines.push("",`压力方向：${negative.map(x=>`${x.sentence} [${x.evidence.index}]`).join("；")}`);
    if(neutral.length)lines.push("",`还要结合：${neutral.map(x=>`${x.sentence} [${x.evidence.index}]`).join("；")}`);
    lines.push("","所以更准确的读法是：先看这些条件如何变化，再决定方向，不把资料里的目标位或预测当成已经发生的事实。");
    return{answer:lines.join("\n"),citations:refs,confidence:Math.min(.9,.45+selected.length*.05),method:"deterministic-directional-v20"};
  }

  const lead=input.mode==="research"
    ?"把这些证据放在一起后，核心结论是："
    :input.mode==="learning"
      ?"这批资料可以这样理解："
      :"这批资料真正要表达的是：";
  const body=selected.slice(0,input.intelligence==="light"?3:5).map((x,i)=>`${i+1}. ${x.sentence} [${x.evidence.index}]`).join("\n");
  return{
    answer:`${lead}\n\n${body}\n\n以上只使用你提供的原文；资料没有支持的内容没有补写。`,
    citations:refs,
    confidence:Math.min(.86,.4+selected.length*.055),
    method:"deterministic-grounded-v20",
  };
}
