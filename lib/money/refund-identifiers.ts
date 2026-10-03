export function wechatRefundNoFromRequestKey(providerRequestKey:string){
 return providerRequestKey
  .replace(/^lf-refund-/,"LFR")
  .replace(/[^A-Za-z0-9_\-|*@]/g,"")
  .slice(0,64);
}

export function providerRequestKeyFromWechatRefundNo(outRefundNo:string){
 const value=String(outRefundNo||"").trim();
 if(!value.startsWith("LFR"))return null;
 const candidate=`lf-refund-${value.slice(3)}`;
 return wechatRefundNoFromRequestKey(candidate)===value?candidate:null;
}

export function wechatRefundNotifyUrl(){
 const explicit=process.env.WECHAT_REFUND_NOTIFY_URL?.trim();
 const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com").trim().replace(/\/+$/,"");
 const value=explicit||`${base}/api/pay/wechat/refund-notify`;
 try{
  const url=new URL(value);
  if(url.protocol!=="https:"||url.search||url.hash)return null;
  return url.toString();
 }catch{return null}
}
