"use client";
import {useEffect,useState} from "react";

export default function AlipayHandoff({gatewayUrl,amount}:{gatewayUrl:string;amount:string}){
 const [copied,setCopied]=useState(false);
 const [link,setLink]=useState("");
 const [inWechat,setInWechat]=useState(true);
 useEffect(()=>{setInWechat(/MicroMessenger/i.test(navigator.userAgent))},[]);
 async function copy(){
  const url=window.location.href;setLink(url);
  try{await navigator.clipboard.writeText(url);setCopied(true)}catch{setCopied(false)}
 }
 return <main style={{maxWidth:480,margin:"40px auto",padding:24,color:"#162033",background:"white",borderRadius:24}}>
  <p>灵犀场 · 支付宝</p><h1>确认付款</h1><p style={{fontSize:32,fontWeight:700}}>¥{amount}</p>
  {inWechat?<><p>请复制付款链接，在手机浏览器打开后继续付款。</p>
   <button type="button" onClick={copy} style={{padding:16,width:"100%"}}>{copied?"付款链接已复制":"一键复制付款链接"}</button>
   {link&&<input aria-label="付款链接" readOnly value={link} onFocus={e=>e.currentTarget.select()} style={{width:"100%",marginTop:16}}/>}
   <p>也可以从右上角菜单选择在浏览器打开。</p></>:
   <a href={gatewayUrl} style={{display:"block",padding:16,textAlign:"center",background:"#1677ff",color:"white",borderRadius:12}}>前往支付宝付款</a>}
  <p>请在支付宝核对金额。付款结果以订单记录为准。</p>
 </main>;
}
