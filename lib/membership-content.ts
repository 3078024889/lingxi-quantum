export type MembershipBenefit = {
  title: string;
  detail?: string;
  titleEn?: string;
  detailEn?: string;
};

export type MembershipContent = {
  description: string;
  descriptionEn: string;
  benefits: MembershipBenefit[];
  closing?: string;
  closingEn?: string;
  cta: string;
  ctaEn: string;
};

/**
 * Shared user-facing access copy for the website and Mini Program.
 * Keep this file product-oriented and free of retired product concepts.
 */
export const MEMBERSHIP_CONTENT: Record<string, MembershipContent> = {
  day: {
    description: "适合临时使用灵犀场，需要时直接开始。",
    descriptionEn: "For short-term use when you need LINGXIFIELD right away.",
    benefits: [
      {
        title: "当天可用",
        detail: "在有效期内使用对应开放功能。",
        titleEn: "Available for the day",
        detailEn: "Use the included features during the active period."
      }
    ],
    cta: "选择单日使用",
    ctaEn: "CHOOSE ONE DAY"
  },

  month: {
    description: "适合持续使用一个月，处理更多任务与创作。",
    descriptionEn: "For ongoing use across a month of tasks and creation.",
    benefits: [
      {
        title: "30 天持续使用",
        detail: "在有效期内持续使用对应开放功能。",
        titleEn: "30 days of continued access",
        detailEn: "Keep using the included features throughout the active period."
      }
    ],
    cta: "选择月度使用",
    ctaEn: "CHOOSE 30 DAYS"
  },

  year: {
    description: "适合长期使用灵犀场，持续处理工作、学习与创作。",
    descriptionEn: "For long-term use across work, learning and creation.",
    benefits: [
      {
        title: "365 天持续使用",
        detail: "在有效期内持续使用对应开放功能。",
        titleEn: "365 days of continued access",
        detailEn: "Keep using the included features throughout the active period."
      }
    ],
    cta: "选择年度使用",
    ctaEn: "CHOOSE 365 DAYS"
  }
};