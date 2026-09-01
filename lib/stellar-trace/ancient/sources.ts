import type {AncientSystem,EvidenceConfidence} from "./types";
export type SourceRule={id:string;system:AncientSystem;sourceTitle:string;sourceChapter?:string;sourceUrl:string;sourceNoteZh:string;confidence:EvidenceConfidence};
export const SOURCE_RULES:Record<string,SourceRule>={
"QM-XR-NM-001":{id:"QM-XR-NM-001",system:"qimen",sourceTitle:"奇门遁甲元灵经",sourceChapter:"占行人",sourceUrl:"https://zh.wikisource.org/wiki/%E5%A5%87%E9%96%80%E9%81%81%E7%94%B2%E5%85%83%E9%9D%88%E7%B6%93",sourceNoteZh:"以行人年命合局中干支，并以支宫等信息判断行人状态、方位及远近层。",confidence:"text-attested"},
"QM-FQ-XR-002":{id:"QM-FQ-XR-002",system:"qimen",sourceTitle:"奇门法窍",sourceChapter:"占行人",sourceUrl:"https://shuyuan.zhiming.life/read/%E5%A5%87%E9%97%A8%E6%B3%95%E7%AA%8D/18",sourceNoteZh:"以本人年命合当局干支为行人，以支宫为宅舍，并以远近条件判断迟速。",confidence:"text-attested"},
"QM-OBJECT-001":{id:"QM-OBJECT-001",system:"qimen",sourceTitle:"奇门遁甲元灵经",sourceChapter:"卷十八·占失物",sourceUrl:"https://ctext.org/wiki.pl?chapter=807664&if=gb",sourceNoteZh:"失物以甲子戊为财物，以甲子戊落宫定方位；现实接触链不得反写落宫。",confidence:"text-attested"},
"QM-ANIMAL-001":{id:"QM-ANIMAL-001",system:"qimen",sourceTitle:"奇门旨归 / 奇门遁甲秘笈大全",sourceChapter:"占走失六畜",sourceUrl:"https://www.shidianguji.com/zh/book/SDZJ0630/chapter/1lx9g23oqtyya",sourceNoteZh:"六畜依原典用神落宫寻方；当前只对犬与明确的牲畜门类启用，不把猫、泛称鸟类或其他动物强套为六畜。",confidence:"text-attested"},
"LR-ZW-001":{id:"LR-ZW-001",system:"liuren",sourceTitle:"大六壬五变中黄经",sourceUrl:"https://www.shidianguji.com/zh/book/CADAL02055501/chapter/1lai9rmli2yau",sourceNoteZh:"以玄武相关方位推寻踪去向，并讨论远近、里数与久出方位。",confidence:"text-attested"},
"LR-ZZ-002":{id:"LR-ZZ-002",system:"liuren",sourceTitle:"六壬直指御定",sourceUrl:"https://ctext.org/wiki.pl?chapter=143065&if=gb",sourceNoteZh:"保存方位与环境特征并见的案例，如北方、近水等环境象。",confidence:"text-attested"},
"LR-OBJECT-001":{id:"LR-OBJECT-001",system:"liuren",sourceTitle:"六壬指南",sourceChapter:"卷一·亡财",sourceUrl:"https://ctext.org/wiki.pl?chapter=362973&if=en&remap=gb",sourceNoteZh:"亡财察玄武及其阴神以知方所；环境象不等于现实地址。",confidence:"text-attested"},
"TY-XR-001":{id:"TY-XR-001",system:"taiyi",sourceTitle:"太乙统宗宝鉴",sourceChapter:"占望行人 / 讨捕叛亡",sourceUrl:"https://ctext.org/wiki.pl?chapter=258102&if=en&remap=gb",sourceNoteZh:"以太乙体系的内外、主客等关系判断行人、方位与远近层。",confidence:"text-attested"},
"LY-XR-001":{id:"LY-XR-001",system:"liuyao",sourceTitle:"易隐",sourceChapter:"行人占",sourceUrl:"https://book.taiyi.me/%E5%8D%9C/%E6%98%93%E9%9A%90/%E6%98%93%E9%9A%90%28%E5%8D%B7%E4%B8%83%29",sourceNoteZh:"以动爻支神判断转去之位，并以五行数及旺相休囚死修正古法距离数。",confidence:"text-attested"},
"MOD-PALACE-DEG-001":{id:"MOD-PALACE-DEG-001",system:"qimen",sourceTitle:"灵犀场现代坐标归一层",sourceUrl:"internal://stellar-trace/normalization/palace-bearing",sourceNoteZh:"把八宫归一为现代方位角，仅供圆周汇流。",confidence:"interpretive-normalization"},
"MOD-BRANCH-DEG-001":{id:"MOD-BRANCH-DEG-001",system:"liuren",sourceTitle:"灵犀场现代坐标归一层",sourceUrl:"internal://stellar-trace/normalization/branch-bearing",sourceNoteZh:"把十二支归一到30度扇区中心，仅供圆周汇流。",confidence:"interpretive-normalization"}
};
export const sourceRule=(id:keyof typeof SOURCE_RULES)=>SOURCE_RULES[id];
