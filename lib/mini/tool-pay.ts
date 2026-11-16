import {
  miniWechatJsapiConfigured,
  createWechatMiniJsapiOrder,
  buildWechatMiniJsapiInvokeParams,
} from "@/lib/wechatpay";

export function miniJsapiPayConfigured():boolean {
  return miniWechatJsapiConfigured();
}

export async function createMiniJsapiOrder(input:{
  outTradeNo:string;description:string;amountFen:number;notifyUrl:string;openid:string;
}):Promise<string> {
  const result=await createWechatMiniJsapiOrder(input);
  return result.prepayId;
}

export function buildMiniRequestPayment(prepayId:string) {
  return buildWechatMiniJsapiInvokeParams(prepayId);
}
