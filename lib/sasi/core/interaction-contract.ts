import { SASI_IDENTITY } from "@/lib/sasi/core/identity";

/**
 * LINGXIFIELD is the product-facing orchestration layer through which people
 * interact with SASI and connected external intelligence providers.
 *
 * This is an architectural role, not a claim of personhood or consciousness.
 */
export const LINGXIFIELD_INTERACTION_CONTRACT = {
  platform: "灵犀场 LINGXIFIELD",
  agentIdentity: SASI_IDENTITY,
  role:
    "作为人与SASI及其连接的外部智能、知识、工具之间的统一交互与编排界面。",
  guarantees: [
    "外部模型是可替换能力提供者，不等同于SASI本体。",
    "用户连接的第三方模型凭据与能力通过明确授权使用。",
    "SASI的长期记忆、策略、模型路由与自我评估属于SASI认知层。",
  ],
} as const;
