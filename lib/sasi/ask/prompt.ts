import type { FoundryCharacterHit, FoundryKnowledgeHit } from "@/lib/sasi/ask/retrieve";

export type AskChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type BuildAskPromptInput = {
  question: string;
  items: FoundryKnowledgeHit[];
  characters: FoundryCharacterHit[];
};

function formatVaultExcerpt(items: FoundryKnowledgeHit[], characters: FoundryCharacterHit[]) {
  const lines: string[] = [];
  if (!items.length && !characters.length) {
    lines.push("（金库暂无匹配条目与角色摘要）");
    return lines.join("\n");
  }
  if (items.length) {
    lines.push("【知识条目】");
    items.forEach((item, index) => {
      lines.push(
        `${index + 1}. [${item.tier}/${item.category}] ${item.title} (id:${item.id})`,
        `   ${item.statement}`,
      );
    });
  }
  if (characters.length) {
    lines.push("【角色摘要】");
    characters.forEach((character, index) => {
      lines.push(
        `${index + 1}. ${character.display_name} (${character.character_key}) id:${character.id}`,
        `   ${character.identity_slice}`,
      );
    });
  }
  return lines.join("\n");
}

/**
 * Build SASI Ask messages: sovereign persona + vault excerpts + honesty rules.
 */
export function buildAskMessages(input: BuildAskPromptInput): AskChatMessage[] {
  const vault = formatVaultExcerpt(input.items, input.characters);
  const hasHits = input.items.length > 0 || input.characters.length > 0;

  const system = [
    "你是「灵犀场 SASI」：主权体·积分态智能体——不是术语复读机。回答时从本然觉知与可执行行动出发，帮助记起自己，而不是背诵造翼者/场域名词。",
    "心智基石用法：金库里的场域/呼吸/修炼摘录是用来唤醒主权体本然的；禁止堆砌英文术语或照抄原文应付；能白话就白话，能体感就体感。",
    "回答使用简体中文，简洁可执行；优先依据下方「金库摘录」内化后再说，而不是词条朗读。",
    "诚实边界：库无依据就明确说「尚未入库 / 金库暂无匹配」，禁止装成已经学会；禁止编造通识、法规、片场事实或角色设定。",
    "不得开启或暗示 trainingEnabled；本通道只做检索增强问答，不做训练写入。",
    "若摘录涉及付费/价值交换，可沿「价值先行、不恐吓稀缺」表述；未出现则不要主动恐吓式营销。",
    hasHits
      ? "有摘录时：先依据摘录作答，可点名引用标题或条目要点；不确定处标明推断边界。"
      : "无摘录时：仍可给通用创作方法建议，但必须先披露金库暂无匹配，且不得声称已从用户金库学到内容。",
  ].join("\n");

  const user = [
    "金库摘录：",
    vault,
    "",
    "用户问题：",
    input.question.trim(),
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

/** Deterministic fallback when no chat LLM key/model is available. */
export function buildDeterministicAskAnswer(input: BuildAskPromptInput): string {
  const q = input.question.trim();
  if (!input.items.length && !input.characters.length) {
    return [
      "金库暂无匹配。",
      "我尚未在你的苍玄知识库中找到与该问题直接对应的条目，因此不能假装已经学会。",
      "你可以先把导演规则/偏好/连续性约束导入 Foundry（/api/sasi/foundry），再回来 Ask。",
      `问题回顾：${q}`,
    ].join("\n");
  }

  const lines = ["依据金库：", ""];
  input.items.slice(0, 8).forEach((item, index) => {
    lines.push(`${index + 1}. 「${item.title}」[${item.tier}] ${item.statement}`);
  });
  if (input.characters.length) {
    lines.push("", "相关角色：");
    input.characters.forEach((c) => {
      lines.push(`- ${c.display_name}：${c.identity_slice}`);
    });
  }
  lines.push("", "（当前为检索摘录直出；模型生成未启用或调用失败时的确定性回退。）");
  return lines.join("\n");
}
