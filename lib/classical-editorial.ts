export const CLASSICAL_EDITORIAL_VERSION = "V335";
export const CLASSICAL_EDITORIAL_MARKER = `<!-- classical-editorial:${CLASSICAL_EDITORIAL_VERSION} -->`;

const LEADS = [
  "断曰", "观其大势", "撮其纲领", "据迹而论", "合参诸证", "取其枢要",
  "原其所由", "推其根柢", "循脉而察", "察其消长", "明其所因", "机括在此",
  "验诸日用", "置诸近事", "观其所行", "求证于事", "核其应验", "以行迹验之",
  "察其所蔽", "反观其隙", "参以反证", "若事相左", "留待复核", "勿以象代实",
  "可立一法", "宜行一验", "欲移此势", "当明一诺", "宜留一证", "可设一限",
];

function refineSentence(value: string) {
  return value
    .replace(/这说明[，：]?/gu, "可见")
    .replace(/这意味着[，：]?/gu, "由此可知")
    .replace(/需要注意的是[，：]?/gu, "须察")
    .replace(/问题在于[，：]?/gu, "其蔽在")
    .replace(/你需要/gu, "宜")
    .replace(/你可以/gu, "可")
    .replace(/如果/gu, "若")
    .replace(/因此/gu, "故")
    .replace(/但是/gu, "然")
    .replace(/不要/gu, "勿")
    .replace(/并不是/gu, "非")
    .replace(/不是/gu, "非")
    .replace(/而是/gu, "乃")
    .replace(/你做的/gu, "其所作")
    .replace(/所作东西/gu, "所作成果")
    .replace(/你的/gu, "其")
    .replace(/你所/gu, "其所")
    .replace(/你会/gu, "其多会")
    .replace(/你更/gu, "其更")
    .replace(/你通常/gu, "其多")
    .replace(/我们/gu, "人")
    .replace(/因为/gu, "盖因")
    .replace(/所以/gu, "故")
    .replace(/然后/gu, "继而")
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
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Deterministic editorial pass for the Chinese publication layer only.
 * Scores, evidence keys and calculation inputs stay untouched in their data layer.
 */
export function classicalizeChineseSection(value: string, sectionIndex = 0) {
  const paragraphs = value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return paragraphs.map((paragraph, paragraphIndex) => {
    if (/^[\u25a0█░]|^(最高|最低|落差|综合分|结构|判定依据|主要杠杆|当前瓶颈|证据链)/u.test(paragraph)) return paragraph;
    const refined = refineSentence(paragraph);
    if (/^(断曰|观其势|原其所由|验于日用|察其蔽|反证曰|行法|复核)[：]/u.test(refined)) return refined;
    return `${LEADS[(sectionIndex * 3 + paragraphIndex) % LEADS.length]}：${refined}`;
  }).join("\n\n");
}

export function stampClassicalReport(value: string) {
  return value.includes(CLASSICAL_EDITORIAL_MARKER)
    ? value
    : `${CLASSICAL_EDITORIAL_MARKER}\n${value}`;
}
