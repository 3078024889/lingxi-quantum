// ┌──────────────────────────────────────────────────────────────┐
// │  审核模式开关                                                  │
// │  true  = 暂时解锁全部内容（绕过付费墙），付费按钮显示「审核中」 │
// │         —— 给你检查里面的内容和图片用                          │
// │  false = 恢复正常收费（审查完毕、准备正式上线时改这里）        │
// └──────────────────────────────────────────────────────────────┘
// Review bypasses are development-only. A public build can never unlock paid
// content, even if the environment variable is accidentally enabled.
export const REVIEW_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_REVIEW_MODE === "true";
