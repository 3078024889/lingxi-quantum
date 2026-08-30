export type ReportSignal={id:string;zh:string;en:string;score:number;meaningZh:string;meaningEn:string;actionZh:string;actionEn:string};
export type DendriteReportEntry={id:string;chapterId:string;chapterZh:string;chapterEn:string;titleZh:string;titleEn:string;evidenceNodeIds:string[];confidence:"clear"|"developing"|"open";structureZh:string;structureEn:string;mechanismZh:string;mechanismEn:string;realityZh:string;realityEn:string;costZh?:string;costEn?:string;strengthZh?:string;strengthEn?:string;actionZh:string;actionEn:string;observationZh:string;observationEn:string};
export type ReportEvidenceLeaf={sourceProductId?:string;sourceRelationshipType?:"deep"|"business"|"other";questionId:string;evidenceDimension:string;promptZh:string;promptEn:string;answerId:string;answerZh:string;answerEn:string;answerSemantic:string;polarity:"support";nodeIds:string[];counterNodeIds:string[];strength:number};
export type ReadingSlot={zh:string;en:string};
const names=(zh:string,en:string):ReadingSlot[]=>{const z=zh.split("|");const e=en.split("|");return z.map((v,i)=>({zh:v,en:e[i]}))};

/** Ten paid products × eleven independent readings. Relationship variants share S02, never a report skeleton. */
export const PRODUCT_READING_SLOTS:Record<string,ReadingSlot[]>={
"life-map-report":names("生命底色|本源驱动|感知门户|判断成形|行动脉络|内外错位|承载之器|未发之能|生命张力|当前转轴|第二生路","Life Ground|Origin Drive|Perceptual Gate|Judgment Formation|Action Current|Inner Outer Drift|Vessel of Capacity|Latent Capacity|Life Tension|Present Pivot|Second Path"),
"relationship-resonance:deep":names("相遇之因|靠近之法|依恋节律|需求暗线|表达错位|边界结构|冲突原点|修复能力|未说之事|关系代价|关系去向","Reason for Meeting|Way of Approach|Attachment Rhythm|Hidden Needs|Expression Drift|Boundary Structure|Conflict Origin|Repair Capacity|The Unsaid|Relational Cost|Relational Direction"),
"relationship-resonance:business":names("结盟基础|共同利益|权责结构|决策主导|风险承担|资源交换|信任形成|利益冲突|危机中的站位|长期合作成本|继续·重组·退出","Alliance Ground|Shared Interest|Rights and Duties|Decision Lead|Risk Bearing|Resource Exchange|Trust Formation|Interest Conflict|Position in Crisis|Long-term Cost|Continue Rebuild Exit"),
"relationship-resonance:other":names("关系起点|角色位置|自然距离|给予与接收|期待来源|边界摩擦|未尽之言|关系惯性|现实牵连|可修复之处|适宜距离","Relational Origin|Role Position|Natural Distance|Giving and Receiving|Source of Expectation|Boundary Friction|Unfinished Words|Relational Inertia|Real Entanglement|Repairable Point|Fitting Distance"),
"resilience-report":names("韧性源点|压力初反应|失衡顺序|恢复入口|危机启动|变化适应|长期坚持|稳定承载|反弹代价|脆弱断点|再生路径","Source of Resilience|First Stress Response|Order of Imbalance|Recovery Gate|Crisis Mobilization|Adaptation to Change|Long Endurance|Stable Capacity|Cost of Rebound|Fragile Point|Regenerative Path"),
"romance-report":names("吸引源|被看见的部分|隐藏吸引力|主动与被动|靠近门槛|筛选机制|重复对象|暧昧结构|错配来源|关系进入条件|磁场转轴","Source of Attraction|What Is Seen|Hidden Magnetism|Initiative and Receptivity|Threshold of Approach|Selection Pattern|Repeated Attraction|Ambiguity Structure|Source of Mismatch|Conditions for Bond|Magnetic Pivot"),
"wealth-report":names("财富源点|价值发生|创造方式|机会识别|资源调度|交换能力|接收能力|风险方式|财富泄口|放大杠杆|下一阶段财富路径","Source of Wealth|Value Emergence|Creation Mode|Opportunity Sense|Resource Orchestration|Exchange Capacity|Receiving Capacity|Risk Pattern|Leakage Point|Scaling Lever|Next Wealth Path"),
"daily-tide-report":names("今日主潮|晨起之势|感知窗口|判断窗口|行动窗口|关系潮位|财富潮位|压力潮位|宜进|宜止|今日归位","Main Tide|Morning Current|Perceptual Window|Decision Window|Action Window|Relational Tide|Wealth Tide|Pressure Tide|Advance|Pause|Return"),
"tarot-reading":names("镜中之事|显层问题|隐层牵引|重复之因|被忽略的事实|情绪所护|关系投影|现实矛盾|未见之路|归还之物|镜后之门","Matter in the Mirror|Visible Question|Hidden Pull|Cause of Repetition|Neglected Fact|What Emotion Protects|Relational Projection|Real Contradiction|Unseen Path|What to Return|Door Beyond Mirror"),
"qian-reading":names("此问之心|当下之象|所处之位|顺势|逆势|所忧|所阻|未显之机|近时之变|可行之事|签后之守","Heart of the Question|Present Image|Present Position|Following the Current|Against the Current|What Is Feared|What Obstructs|Unseen Opening|Near Change|Possible Action|After the Oracle"),
};

const confidence=(score:number):DendriteReportEntry["confidence"]=>score>=72?"clear":score>=48?"developing":"open";
function distinct(ordered:ReportSignal[],index:number,leaves:ReportEvidenceLeaf[]){
 const picked=[leaves[index%Math.max(1,leaves.length)],leaves[(index*2+5)%Math.max(1,leaves.length)],leaves[(index*3+11)%Math.max(1,leaves.length)]].filter(Boolean);
 const ids=[...new Set(picked.flatMap(x=>[...x.nodeIds,...x.counterNodeIds]))];
 const preferred=ids.map(id=>ordered.find(x=>x.id===id)).filter((x):x is ReportSignal=>Boolean(x));
 const fallback=[ordered[index%ordered.length],ordered[(index*3+1)%ordered.length],ordered[(ordered.length-1-index+ordered.length)%ordered.length]];
 const chosen=[...preferred,...fallback].filter((x,i,a)=>x&&a.findIndex(y=>y.id===x.id)===i);
 return{primary:chosen[0],support:chosen[1]??ordered[1],counter:chosen[2]??ordered.at(-1)!,picked};
}
export function readingSlotsFor(productId:string,relationshipType:"deep"|"business"|"other"|undefined){const key=productId==="relationship-resonance"?`${productId}:${relationshipType??"deep"}`:productId;return{key,slots:PRODUCT_READING_SLOTS[key]??[]}}
export function buildReportEntries(productId:string,relationshipType:"deep"|"business"|"other"|undefined,ordered:ReportSignal[],leaves:ReportEvidenceLeaf[]=[]):DendriteReportEntry[]{
 const{key,slots}=readingSlotsFor(productId,relationshipType);if(slots.length!==11||ordered.length<3)return[];
 return slots.map((slot,index)=>{const{primary,support,counter,picked}=distinct(ordered,index,leaves);const evidenceNodeIds=[...new Set([primary.id,support.id,counter.id,...picked.flatMap(x=>x.nodeIds)])];const supportCount=picked.filter(x=>x.nodeIds.includes(primary.id)||x.nodeIds.includes(support.id)).length;const tension=Math.abs(primary.score-counter.score);
 return{id:`${key}-${String(index+1).padStart(2,"0")}`,chapterId:`${key}-reading-${index+1}`,chapterZh:slot.zh,chapterEn:slot.en,titleZh:slot.zh,titleEn:slot.en,evidenceNodeIds,confidence:confidence(Math.round((primary.score+support.score)/2)),
 structureZh:`其势以「${primary.zh}」为先，「${support.zh}」承之；「${counter.zh}」未与之齐。故此篇所断，在力之先后，不在一时高下。`,structureEn:`${primary.en} leads, ${support.en} carries it, while ${counter.en} participates less. This concerns sequence, not identity.`,
 mechanismZh:`三处异境相参，${supportCount||"尚少"}处同指此轴。${primary.meaningZh}${support.meaningZh}二力相续则事成；相离则意虽明，而现实无所承。`,mechanismEn:`Independent contexts connect ${primary.en} with ${support.en}; no single answer forms this reading.`,
 realityZh:`验之于日用：每逢「${slot.zh}」所涉之事，察「${primary.zh}」与「${support.zh}」孰先至。前者独行，常起而未成；二者相接，则所长可见，所耗亦可计。`,realityEn:`Test this in daily life by observing the sequence of ${primary.en} and ${support.en}.`,
 ...(primary.score>=64?{strengthZh:`可用之长：以「${primary.zh}」开局，以「${support.zh}」落地；此力已有根，只待固定接口。`,strengthEn:`${primary.en} can initiate while ${support.en} gives it a stable interface.`}:{}),
 ...(tension>=18?{costZh:`其耗在「${primary.zh}」久任其事，而「${counter.zh}」少得其位。久之，强者成劳，静者愈隐。`,costEn:`Cost rises when ${primary.en} works continuously while ${counter.en} remains underused.`}:{}),
 actionZh:`今试一事：${primary.actionZh}惟取一次可见反馈，不求自证；再看「${support.zh}」是否随之入位。`,actionEn:`${primary.actionEn} Record one observable response, then see whether ${support.en} enters more clearly.`,
 observationZh:`后遇同类情境，记其先后、所费、所得。三次同象则暂立；一证相反即留其隙。有据则言，无据则止。`,observationEn:`Across three comparable situations, record sequence, cost, and outcome; preserve counterevidence.`};});
}
