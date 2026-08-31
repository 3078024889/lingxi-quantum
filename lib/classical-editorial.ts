export const CLASSICAL_EDITORIAL_VERSION = "V336";
export const CLASSICAL_EDITORIAL_MARKER = `<!-- classical-editorial:${CLASSICAL_EDITORIAL_VERSION} -->`;

const CHAPTER_MOVES = ["断曰", "所以然", "验于事", "反观", "行法"] as const;

function refineSentence(value: string) {
  return value
    .replace(/从(.{1,18})来看[，：]?/gu, "观$1，")
    .replace(/这说明[，：]?/gu, "可见")
    .replace(/这意味着[，：]?/gu, "是以可知")
    .replace(/需要注意的是[，：]?/gu, "须察")
    .replace(/问题在于[，：]?/gu, "其蔽在")
    .replace(/最重要的是[，：]?/gu, "要在")
    .replace(/真正的关键(?:是|在于)[，：]?/gu, "其枢在")
    .replace(/关键(?:是|在于)[，：]?/gu, "其枢在")
    .replace(/不在于/gu, "不系于")
    .replace(/取决于/gu, "系于")
    .replace(/你需要做的是/gu, "所宜行者")
    .replace(/你需要/gu, "你宜")
    .replace(/你可以/gu, "你可")
    .replace(/你能够/gu, "你能")
    .replace(/能够/gu, "能")
    .replace(/可能会/gu, "或将")
    .replace(/可能/gu, "或")
    .replace(/如果/gu, "若")
    .replace(/因此/gu, "故")
    .replace(/但是/gu, "然")
    .replace(/不要/gu, "勿")
    .replace(/并不是/gu, "非")
    .replace(/不是/gu, "非")
    .replace(/而是/gu, "乃")
    .replace(/你做的/gu, "你所作")
    .replace(/所作东西/gu, "所作成果")
    .replace(/你会/gu, "你多会")
    .replace(/你更/gu, "你尤")
    .replace(/你通常/gu, "你多")
    .replace(/我们/gu, "吾人")
    .replace(/因为/gu, "盖因")
    .replace(/所以/gu, "故")
    .replace(/然后/gu, "继而")
    .replace(/之后/gu, "其后")
    .replace(/之前/gu, "其前")
    .replace(/开始/gu, "始")
    .replace(/已经/gu, "已")
    .replace(/正在/gu, "正")
    .replace(/往往/gu, "常")
    .replace(/通常/gu, "多")
    .replace(/没有人/gu, "无人")
    .replace(/没有/gu, "未")
    .replace(/把/gu, "将")
    .replace(/当成/gu, "视为")
    .replace(/不差/gu, "不弱")
    .replace(/很容易/gu, "易")
    .replace(/很难/gu, "难")
    .replace(/什么/gu, "何物")
    .replace(/怎样/gu, "如何")
    .replace(/哪里/gu, "何处")
    .replace(/的时候/gu, "时")
    .replace(/的过程/gu, "之程")
    .replace(/进行/gu, "行")
    .replace(/越来越/gu, "日益")
    .replace(/非常/gu, "甚")
    .replace(/更加/gu, "尤")
    .replace(/同时/gu, "且")
    .replace(/以及/gu, "与")
    .replace(/通过/gu, "由")
    .replace(/可以看出/gu, "可见")
    .replace(/的一种/gu, "之一")
    .replace(/的方式/gu, "之法")
    .replace(/的状态/gu, "之态")
    .replace(/的能力/gu, "之能")
    .replace(/，，+/g, "，")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function isEvidenceBlock(value: string) {
  return /^[\u25a0█░]|^(最高|最低|落差|综合分|结构|判定依据|主要杠杆|当前瓶颈|证据链|样本|分数|得分|指数|维度|时间|日期|坐标|方位)/u.test(value)
    || /^[-+]?\d+(?:\.\d+)?\s*(?:%|分|km|公里|°)/iu.test(value);
}

function proseLines(paragraph: string) {
  return paragraph.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => isEvidenceBlock(line) ? line : refineSentence(line)).join("\n");
}

/** Deterministic editorial pass for the Chinese publication layer only.
 * Scores, evidence keys and calculation inputs stay untouched in their data layer.
 */
export function classicalizeChineseSection(value: string, sectionIndex = 0) {
  const paragraphs = value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return paragraphs.map((paragraph, paragraphIndex) => {
    if (isEvidenceBlock(paragraph)) return paragraph;
    if (paragraph.length <= 28 && !/[。！？；]/u.test(paragraph)) return paragraph;
    const refined = proseLines(paragraph);
    if (/^(断曰|所以然|验于事|反观|行法|复核|总断)[：]/u.test(refined)) return refined;
    const move = CHAPTER_MOVES[(sectionIndex + paragraphIndex) % CHAPTER_MOVES.length];
    return `${move}：${refined}`;
  }).join("\n\n");
}

export function stampClassicalReport(value: string) {
  return value.includes(CLASSICAL_EDITORIAL_MARKER)
    ? value
    : `${CLASSICAL_EDITORIAL_MARKER}\n${value}`;
}
