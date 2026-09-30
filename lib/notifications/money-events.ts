export type MoneyEvent="topup_paid"|"withdrawal_received"|"withdrawal_completed"|"withdrawal_failed"|"refund_received"|"refund_completed"|"refund_failed";
export const MONEY_NOTICE_ZH:Record<MoneyEvent,{title:string;body:(amount?:string)=>string}>={
 topup_paid:{title:"充值已到账",body:a=>`${a||"充值金额"}已加入你的创作余额。`},
 withdrawal_received:{title:"提现申请已收到",body:a=>`${a||"这笔提现"}正在处理，你可以在账户中查看进度。`},
 withdrawal_completed:{title:"提现处理完成",body:a=>`${a||"这笔提现"}已完成处理，请留意收款账户。`},
 withdrawal_failed:{title:"提现未完成",body:()=>`这笔提现暂未完成，金额不会凭空消失。请在账户中查看最新状态。`},
 refund_received:{title:"退款申请已收到",body:a=>`${a||"这笔退款"}正在处理。`},
 refund_completed:{title:"退款处理完成",body:a=>`${a||"这笔退款"}已完成处理，请留意原支付渠道。`},
 refund_failed:{title:"退款暂未完成",body:()=>`这笔退款仍需处理，请在账户中查看最新状态。`}
};
