export type ProviderExceptionDecision={
  failureCode:string;
  retryAfterSeconds:number;
  providerStatus:string;
  operatorActionRequired:boolean;
};

function codeOf(error:unknown){
  return error instanceof Error?error.message:"UNKNOWN";
}

export function classifyProviderException(error:unknown):ProviderExceptionDecision{
  const code=codeOf(error).slice(0,160);

  if(/^WECHAT_REFUND_403:NOT_ENOUGH$/.test(code)){
    return{
      failureCode:"PROVIDER_FUNDS_REQUIRED",
      retryAfterSeconds:6*60*60,
      providerStatus:code,
      operatorActionRequired:true,
    };
  }

  if(/^WECHAT_REFUND_(429:FREQUENCY_LIMITED|500:SYSTEM_ERROR)$/.test(code)){
    return{failureCode:"PROVIDER_RETRY_PENDING",retryAfterSeconds:120,providerStatus:code,operatorActionRequired:false};
  }
  if(/^PAYPAL_REFUND_(HTTP_5\d\d|HTTP_429|QUERY_HTTP_5\d\d)/.test(code)){
    return{failureCode:"PROVIDER_RETRY_PENDING",retryAfterSeconds:180,providerStatus:code,operatorActionRequired:false};
  }
  if(/^ALIPAY_(HTTP_5\d\d|REFUND_HTTP_5\d\d)/.test(code)){
    return{failureCode:"PROVIDER_RETRY_PENDING",retryAfterSeconds:180,providerStatus:code,operatorActionRequired:false};
  }

  if(/^(WECHAT_REFUND_4\d\d:|PAYPAL_REFUND_HTTP_4\d\d:|ALIPAY_)/.test(code)){
    return{
      failureCode:"PROVIDER_ACTION_REQUIRED",
      retryAfterSeconds:12*60*60,
      providerStatus:code,
      operatorActionRequired:true,
    };
  }

  return{
    failureCode:"PROVIDER_CONFIRMATION_PENDING",
    retryAfterSeconds:5*60,
    providerStatus:code.replace(/[^\w:.-]/g,"_").slice(0,120),
    operatorActionRequired:false,
  };
}
