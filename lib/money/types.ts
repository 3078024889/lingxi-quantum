export type MoneyCurrency="CNY"|"USD";
export type MoneyWithdrawalStatus=
  |"requested"
  |"processing"
  |"provider_pending"
  |"succeeded"
  |"failed";

export type MoneyBalanceSnapshot={
  currency:MoneyCurrency;
  availableMinor:number;
  refundableMinor:number;
  refundHoldMinor:number;
  legacyAvailableMinor:number;
  activeAvailableMinor:number;
};

export type ProviderRefundObservation={
  status:"pending"|"succeeded"|"failed"|"unknown";
  providerRefundId?:string|null;
  providerStatus?:string|null;
  errorCode?:string|null;
  rawStatus?:string|null;
  retryAfterSeconds?:number|null;
};

export type ProviderRefundRequest={
  withdrawalId:string;
  orderId:string;
  provider:"wechat"|"alipay"|"paypal"|string;
  currency:MoneyCurrency;
  amountMinor:number;
  providerCurrency:MoneyCurrency;
  providerAmountMinor:number;
  providerPaymentId:string;
  idempotencyKey:string;
};
