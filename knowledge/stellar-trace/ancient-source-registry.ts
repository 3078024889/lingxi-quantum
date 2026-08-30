/**
 * Source registry for the Ancient Trace Engine.
 *
 * A source appearing here does not make it an active calculator. Each method
 * stays `source-mapped` until its complete chart construction and rule trace
 * have been implemented and blind-tested. This prevents a modern shortcut
 * from being presented as an attested historical method.
 */
export type AncientTraceSource = {
  id: string;
  tradition: "三式" | "易占" | "西方卜问占星" | "印度征兆学";
  title: string;
  sourceUrl: string;
  attestedInputs: string[];
  attestedOutputs: Array<"direction" | "distance-band" | "motion" | "environment" | "return-window">;
  implementation: "source-mapped" | "rule-encoded" | "blind-tested";
  integrationNoteZh: string;
};

export const ANCIENT_TRACE_SOURCES: AncientTraceSource[] = [
  {
    id: "qimen-yuanling-xingren",
    tradition: "三式",
    title: "奇门遁甲元灵经 · 占行人",
    sourceUrl: "https://ctext.org/wiki.pl?chapter=404789&if=gb",
    attestedInputs: ["行人年命", "占问时刻", "阴阳遁局", "九宫星门"],
    attestedOutputs: ["direction", "distance-band", "motion", "return-window"],
    implementation: "source-mapped",
    integrationNoteZh: "须先完成可审计的奇门起局与年命落宫，不以行星角度替代九宫。",
  },
  {
    id: "liuren-xinjing-taowang",
    tradition: "三式",
    title: "六壬心镜 · 逃亡门",
    sourceUrl: "https://ctext.org/wiki.pl?chapter=253554&if=gb",
    attestedInputs: ["逃亡时刻", "月将", "四课三传", "玄武所临"],
    attestedOutputs: ["direction", "distance-band", "motion", "environment"],
    implementation: "source-mapped",
    integrationNoteZh: "文本含方位、地貌与里数法；里数单位未经盲测，不直接换算公里。",
  },
  {
    id: "taiyi-tongzong-xingren",
    tradition: "三式",
    title: "太乙统宗宝鉴 · 占望行人及讨捕叛亡",
    sourceUrl: "https://ctext.org/wiki.pl?chapter=5466483&if=gb",
    attestedInputs: ["占问时刻", "太乙局数", "主客", "天目地目"],
    attestedOutputs: ["direction", "distance-band", "motion", "return-window"],
    implementation: "source-mapped",
    integrationNoteZh: "须完整排定太乙局；OCR 异文须回看影印本后方可编码。",
  },
  {
    id: "yiyin-xingren",
    tradition: "易占",
    title: "易隐 · 行人占",
    sourceUrl: "https://book.taiyi.me/%E5%8D%9C/%E6%98%93%E9%9A%90/%E6%98%93%E9%9A%90%28%E5%8D%B7%E4%B8%83%29",
    attestedInputs: ["本卦", "动爻", "地支五行", "旺相休囚"],
    attestedOutputs: ["direction", "distance-band", "motion", "return-window"],
    implementation: "source-mapped",
    integrationNoteZh: "用户未完成起卦时不得凭姓名哈希伪造卦象。",
  },
  {
    id: "lilly-christian-astrology-absent",
    tradition: "西方卜问占星",
    title: "William Lilly · Christian Astrology (1647)",
    sourceUrl: "https://openlibrary.org/books/OL26480475M/Christian_astrology_..._in_three_books._The_first_containing_the_use_of_an_ephemeris_..._The_second_",
    attestedInputs: ["问占时刻", "问占地点", "宫位", "征象星及其尊贵力量"],
    attestedOutputs: ["direction", "distance-band", "environment", "return-window"],
    implementation: "source-mapped",
    integrationNoteZh: "须计算问时地平坐标与完整宫位，不以出生盘替代卜问盘。",
  },
  {
    id: "brihat-samhita-anga-vidya",
    tradition: "印度征兆学",
    title: "Brihat Samhita · Aṅga-vidyā",
    sourceUrl: "https://www.wisdomlib.org/hinduism/book/brihat-samhita/d/doc229295.html",
    attestedInputs: ["问者动作", "所处方位", "地点征兆", "问占时刻"],
    attestedOutputs: ["direction", "motion", "environment"],
    implementation: "source-mapped",
    integrationNoteZh: "当前星迹表单未采集身体动作与现场征兆，因此只保留规则入口，不虚构输入。",
  },
];
