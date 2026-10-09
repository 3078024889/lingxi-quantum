// Reopen only after platform review and virtual-payment acceptance.
// Ordinary JSAPI payments must not be used as a fallback for digital services.
export const MINI_PAYMENT_PAUSED = {
  error: "小程序内付费暂未开放，免费工具和已有订单仍可查看。",
  code: "MINI_PAYMENT_REVIEW_REQUIRED",
} as const;
