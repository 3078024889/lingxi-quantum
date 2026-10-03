import type{ProviderRefundObservation,ProviderRefundRequest}from"./types";

export interface MoneyRefundProviderAdapter{
  readonly id:string;
  createRefund(request:ProviderRefundRequest):Promise<ProviderRefundObservation>;
  queryRefund(request:ProviderRefundRequest&{providerRefundId?:string|null}):Promise<ProviderRefundObservation>;
}

/**
 * Provider integrations are deliberately isolated behind this interface.
 * V52A does not fabricate success and does not call a provider without a real
 * configured adapter. V52B supplies WeChat / Alipay / PayPal implementations.
 */
export function requireProviderAdapter(
  provider:string,
  adapters:ReadonlyMap<string,MoneyRefundProviderAdapter>
):MoneyRefundProviderAdapter{
  const adapter=adapters.get(provider);
  if(!adapter)throw new Error("MONEY_PROVIDER_ADAPTER_UNAVAILABLE");
  return adapter;
}
