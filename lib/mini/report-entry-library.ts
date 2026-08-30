export type ReportSignal={id:string;zh:string;en:string;score:number;meaningZh:string;meaningEn:string;actionZh:string;actionEn:string};
export type DendriteReportEntry={id:string;chapterId:string;chapterZh:string;chapterEn:string;titleZh:string;titleEn:string;briefZh:string;evidenceNodeIds:string[];confidence:"clear"|"developing"|"open";structureZh:string;structureEn:string;mechanismZh:string;mechanismEn:string;realityZh:string;realityEn:string;costZh?:string;costEn?:string;strengthZh?:string;strengthEn?:string;actionZh:string;actionEn:string;observationZh:string;observationEn:string};
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

const PRODUCT_BRIEFS:Record<string,string[]>={
"life-map-report":"见其自然本色，不以角色代本心|辨其生命自发之力与长久所向|察外界由何门先入其心|看所见如何沉淀为所断|寻念头成为现实的完整路径|辨真实节律与现实角色的距离|看何种结构足以托住所长|见已有其力而尚无其位之处|明两股生命力量如何相牵|找出此刻最值得移动的一轴|旧路受阻时辨认可续生的新径".split("|"),
"relationship-resonance:deep":"辨相引之处与相遇所照|察亲近如何被双方允许|见一进一退的真实节律|寻未言之需如何暗中行事|辨所言与所受为何错开|亲而不失己的边界何在|争端之下真正被保护的东西|看裂隙之后能否重新相接|听见沉默中久伏未出的言语|计算维系此缘真实所费|辨继续、重建或止步的条件".split("|"),
"relationship-resonance:business":"看何事足以使二人结盟|辨双方之利是否真正同向|厘清谁主何事、谁承何责|见异议时决定如何形成|计算成败风险由谁承担|看人财时与能力如何互换|辨信任因何而立、因何而损|见利益相异时盟约如何承压|事急之时看双方各守何位|核算合作久行的隐形代价|列明继续、重组与退出之界".split("|"),
"relationship-resonance:other":"回到此缘最初生成之处|辨彼此名义与实际位置|寻找久处而不伤的自然距离|看所予是否被受、所需是否能得|追问期待来自当下还是旧缘|辨帮助何时越过责任之界|听见未尽之言留下的回声|看旧角色为何仍自行运转|分清情分之外的现实牵连|找出仍可移动的一处关系接口|为此关系定下合宜的远近".split("|"),
"resilience-report":"见受冲而不散的内在源点|察压力初至时身心先动何处|列出失衡由先至后的次序|寻找最先有效的恢复之门|看事急反明所凭何力|辨变化来时如何重新成序|见少回报时仍能持续的根|量出久承而不伤本的上限|核算表面复起之后所欠|找到由强转折的脆弱位置|为下一周期补回再生之源".split("|"),
"romance-report":"见吸引未经经营时从何处生|看他人最先接收到你的哪一面|辨已有其美却尚未显形之处|察有意靠近时谁先发出信号|看何种确认足以打开关系之门|分清真实标准与防御性筛选|辨反复被吸引的对象之共性|见有情而未成关系的中间结构|寻找相引却不能相承的差处|列明吸引进入现实关系的条件|移动一处即可改变整个连接场".split("|"),
"wealth-report":"见财富最稳定的起源|看何事经你之手而真正增值|辨想法如何化成可交付之物|分清可取之机与应舍之机|看有限资源如何依序入位|检验价值能否被看见并交换|量出所得增加后的承接空间|辨冒险何时成进、何时成耗|找出所创之财无声流失之处|发现可以一次创造、反复使用的杠杆|为下一阶段只留一条财富主轴".split("|"),
"daily-tide-report":"定今日一切行动所随的主潮|看晨起之力宜如何安放|辨何时宜察而不急断|找出今日判断较明的窗口|找出一动最易成事的时段|量出今日可用于关系的容量|看今日何处宜算、宜收、宜缓|预见最易过载的压力潮位|只选一件顺势可进之事|只止一件会耗散全局之事|以一项现实动作收束今日".split("|"),
"tarot-reading":"先把事实从解释中分出|看明面问题究竟在问什么|寻未言之力如何暗中牵动|辨旧事为何借新境重来|把已在眼前却未计入的事实带回|看情绪正在守护什么重要之物|分清对方真实回应与自身投影|见两种需要为何不能并行|寻找惯性之外尚未被看见的路|把不属于自己的责任归还原位|从镜像之后打开一扇现实之门".split("|"),
"qian-reading":"听见问题之下真正所求|看此刻诸象如何聚成一势|辨自己正站在何种位置|明可借之力与可顺之势|明强行则耗的逆势所在|看忧惧究竟指向何种代价|分清外阻与内守|识别初萌而尚未显形的机会|察近时将变的细微信号|只取当下真正可行的一事|得言之后仍以现实为守".split("|"),
};

const structureWriters=[
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`观其全卷，「${p.zh}」最先自发，「${s.zh}」继而承形；「${c.zh}」声较微。此非优劣，乃此刻诸力出场之序。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`「${p.zh}」在前，不待催而动；「${s.zh}」在后，能使其落地。惟「${c.zh}」未得其位，故有力而未必有终。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`一势起于「${p.zh}」，一势应于「${s.zh}」；二者相逢则通。「${c.zh}」若久伏，通处亦可能转为耗处。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`所见不在表面强弱：遇事先现「${p.zh}」，临界方见「${s.zh}」，而「${c.zh}」多在事后才有声音。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`此篇之轴有三：以「${p.zh}」发端，以「${s.zh}」成事，以「${c.zh}」校偏。今前二者明，第三者尚隐。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`「${p.zh}」如源，「${s.zh}」如渠；源盛而渠窄，力多外溢。「${c.zh}」正是尚未修整的承接之岸。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`诸答互照，反复相应者为「${p.zh}」与「${s.zh}」；相逆处落在「${c.zh}」。故其真相在相接处，也在相逆处。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`表层常见「${p.zh}」，深处实由「${s.zh}」推动；「${c.zh}」并非没有，只是多被前势遮住。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`若只看「${p.zh}」，所得未全；合看「${s.zh}」，方知其所以然；再以「${c.zh}」反照，才见边界。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`目前可调用之力在「${p.zh}」，可转化之门在「${s.zh}」，最易失衡之处则系于「${c.zh}」。`,
(p:ReportSignal,s:ReportSignal,c:ReportSignal)=>`旧势由「${p.zh}」维持，新路从「${s.zh}」初开；「${c.zh}」若能入场，二者不必互相废弃。`,
];

const mechanismWriters=[
(p:ReportSignal,s:ReportSignal)=>`其所以然：${p.meaningZh}${s.meaningZh}二力相续，则内意有路、外事有承；中途相离，往往不是无能，而是传递断于半途。`,
(p:ReportSignal,s:ReportSignal)=>`察其运行，「${p.zh}」负责开门，「${s.zh}」负责使门后之事成形。开而不承，则多起少成；承而无始，则久候不发。`,
(p:ReportSignal,s:ReportSignal)=>`此处不由一答而立。异境数见「${p.zh}」与「${s.zh}」相随，方知前者不是偶发，后者也不是装饰。`,
(p:ReportSignal,s:ReportSignal)=>`内里先有「${p.zh}」之动，现实再以「${s.zh}」收束。若现实接口含混，原本可用之力便会折返为反复思量。`,
(p:ReportSignal,s:ReportSignal)=>`一念之成，须经起、承、落三关。「${p.zh}」已能起之，「${s.zh}」能否承之，正决定此篇所论能否落地。`,
(p:ReportSignal,s:ReportSignal)=>`力并非越强越好；「${p.zh}」需有「${s.zh}」为器。器合则力聚，器狭则力散，所耗常生于不相称。`,
(p:ReportSignal,s:ReportSignal)=>`多处回答虽言辞各异，所指却同：先由「${p.zh}」定向，再由「${s.zh}」决定现实能走多远。`,
(p:ReportSignal,s:ReportSignal)=>`表象似由「${p.zh}」主事，深层却仰赖「${s.zh}」供给节律。只修表象，短期可见；兼顾深层，方能久行。`,
(p:ReportSignal,s:ReportSignal)=>`两力并观可见因果：没有「${p.zh}」，事情不起；没有「${s.zh}」，事情虽起而难以被现实接住。`,
(p:ReportSignal,s:ReportSignal)=>`此轴的关键不在标签，而在调用次序。「${p.zh}」若先被安放，「${s.zh}」便容易出现；次序倒置，则事倍而功半。`,
(p:ReportSignal,s:ReportSignal)=>`旧有惯性多由「${p.zh}」维持，新变化则借「${s.zh}」入场。二者若能共处，改变不必以否定自己为代价。`,
];

const realityWriters=[
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`落于日用，可从「${slot.zh}」最常发生的一幕察之：先出现的是「${p.zh}」，还是「${s.zh}」？先后不同，所得与所费亦不同。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`近三次与「${slot.zh}」有关的真实事件，若皆由「${p.zh}」起而由「${s.zh}」收，则此轴可暂立；若不然，宁留其空。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`不必认领抽象形容。只看「${slot.zh}」临到时，你是否先动用「${p.zh}」，又是否真的让「${s.zh}」参与结果。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`此论可验于一个具体转折：与「${slot.zh}」相关之事由意向转入行动时，「${p.zh}」给了方向，「${s.zh}」是否给了边界。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`若要辨真伪，回看最近一次「${slot.zh}」：事情未成，是「${p.zh}」未发，还是「${s.zh}」未承？两者不可混作一因。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`现实里的证据很朴素：同样面对「${slot.zh}」，有无清楚接口时，「${p.zh}」与「${s.zh}」所结之果是否不同。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`把「${slot.zh}」放回真实关系与时间表中：谁先回应、何处停顿、何时改道，皆比自我评价更可信。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`此篇只问一事：每当「${slot.zh}」重来，「${p.zh}」是否被外界看见，「${s.zh}」是否得到现实位置。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`可取一件已完成之事反照「${slot.zh}」：成处往往是「${p.zh}」与「${s.zh}」相接；耗处则常见一力独任。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`现实判断不看你如何描述自己，只看「${slot.zh}」发生之后，是否留下由「${p.zh}」通向「${s.zh}」的可见结果。`,
(slot:ReadingSlot,p:ReportSignal,s:ReportSignal)=>`下一次「${slot.zh}」临界，先不急着解释；记录「${p.zh}」何时出现、「${s.zh}」何时入场，答案便在次序中。`,
];

const actionWriters=[
(p:ReportSignal,s:ReportSignal)=>`${p.actionZh}只取一个现实回声；回声既至，再看「${s.zh}」能否自然承接。`,
(p:ReportSignal,s:ReportSignal)=>`先为「${p.zh}」留一处明确入口，再给「${s.zh}」一个完成标准；今日不求多，只求闭合一次。`,
(p:ReportSignal,s:ReportSignal)=>`择一件久悬未决之事，以「${p.zh}」定其始，以「${s.zh}」定其止，过界则收。`,
(p:ReportSignal,s:ReportSignal)=>`把原本含混的一步写成可见动作：${p.actionZh}完成后只问「${s.zh}」是否因此更易出现。`,
(p:ReportSignal,s:ReportSignal)=>`今日先减一层解释，直接完成最小一步；若「${s.zh}」没有随之入位，便改接口，不再加力。`,
(p:ReportSignal,s:ReportSignal)=>`为「${p.zh}」设界，为「${s.zh}」留时。二者各得其位，再决定是否继续扩大。`,
(p:ReportSignal,s:ReportSignal)=>`先做一件外界可感知的小事，不向内证明自己；只观察它是否唤起「${s.zh}」的现实回应。`,
(p:ReportSignal,s:ReportSignal)=>`${p.actionZh}随后暂停一次惯性补偿，让「${s.zh}」有机会以自己的节律出现。`,
(p:ReportSignal,s:ReportSignal)=>`把选择缩至两项，用「${p.zh}」辨方向，用「${s.zh}」辨代价；不能同时满足者，明言取舍。`,
(p:ReportSignal,s:ReportSignal)=>`在未来七日固定一个承接点，使「${p.zh}」每次发动都能落到同一现实位置，而非四处散开。`,
(p:ReportSignal,s:ReportSignal)=>`不推翻旧路，只添一条新径：${p.actionZh}若能带来「${s.zh}」的新证，便保留；否则即止。`,
];

const observationWriters=[
(p:ReportSignal,s:ReportSignal)=>`观三次同类事件：何者先至、何处转折、结果由谁承接。三次同象可暂立，一证相反便留其隙。`,
(p:ReportSignal,s:ReportSignal)=>`只记事实，不记愿望：起点、停顿、反馈各一行；看「${p.zh}」与「${s.zh}」是否真有相续。`,
(p:ReportSignal,s:ReportSignal)=>`七日后复看：所费是否下降，所得是否可见，未被照顾之处是否仍以同一方式回来。`,
(p:ReportSignal,s:ReportSignal)=>`若行动之后只有自我感觉而无外部变化，此证未成；若边界、回应或结果之一改变，方可记入。`,
(p:ReportSignal,s:ReportSignal)=>`同境再来时，若次序改变而结果亦变，便知可移动处确在其中；若无变化，须另寻其因。`,
(p:ReportSignal,s:ReportSignal)=>`记下完成所需的时间、他人回应与后续负担；能成而不透支，才算真正可用。`,
(p:ReportSignal,s:ReportSignal)=>`不要追求句句相合。只保留最近三个月可举例者；举不出实例的判断，暂不归入自身。`,
(p:ReportSignal,s:ReportSignal)=>`观察未被催促时会否仍然发生；只有无需表演也会复现的部分，才接近稳定结构。`,
(p:ReportSignal,s:ReportSignal)=>`比较一次成功与一次失衡：二者相差的那一环，往往比最高分更接近真正转轴。`,
(p:ReportSignal,s:ReportSignal)=>`以现实后果校文：关系是否更明、行动是否更省、结果是否更稳。三者皆无，则此论应撤。`,
(p:ReportSignal,s:ReportSignal)=>`新路须经时间。七日见其可行，三十日见其可续；未有长期证据之前，不作定论。`,
];

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
 const{key,slots}=readingSlotsFor(productId,relationshipType);const briefs=PRODUCT_BRIEFS[key]??[];if(slots.length!==11||briefs.length!==11||ordered.length<3)return[];
 return slots.map((slot,index)=>{const{primary,support,counter,picked}=distinct(ordered,index,leaves);const evidenceNodeIds=[...new Set([primary.id,support.id,counter.id,...picked.flatMap(x=>x.nodeIds)])];
 return{id:`${key}-${String(index+1).padStart(2,"0")}`,chapterId:`${key}-reading-${index+1}`,chapterZh:slot.zh,chapterEn:slot.en,titleZh:slot.zh,titleEn:slot.en,briefZh:briefs[index],evidenceNodeIds,confidence:confidence(Math.round((primary.score+support.score)/2)),
 structureZh:structureWriters[index](primary,support,counter),structureEn:`${primary.en} leads, ${support.en} carries it, while ${counter.en} participates less. This concerns sequence, not identity.`,
 mechanismZh:mechanismWriters[index](primary,support),mechanismEn:`Independent contexts connect ${primary.en} with ${support.en}; no single answer forms this reading.`,
 realityZh:realityWriters[index](slot,primary,support),realityEn:`Test this in daily life by observing the sequence of ${primary.en} and ${support.en}.`,
 actionZh:actionWriters[index](primary,support),actionEn:`${primary.actionEn} Record one observable response, then see whether ${support.en} enters more clearly.`,
 observationZh:observationWriters[index](primary,support),observationEn:`Across three comparable situations, record sequence, cost, and outcome; preserve counterevidence.`};});
}
