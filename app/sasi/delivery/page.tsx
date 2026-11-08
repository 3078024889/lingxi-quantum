import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
export const metadata:Metadata={title:"SASI 智能软件交付说明｜灵犀场",description:"MT5 智能软件的只读模拟账户、文件交付、授权验证与售后说明。"};
export default function Page(){return <><Nav/><main className="lx11-page"><div style={{width:"min(900px,100%)",margin:"0 auto",padding:"22px 12px 56px"}}><Link href="/sasi" style={{fontSize:13,color:"#316da7"}}>← 返回 SASI 智能软件</Link><h1 style={{fontSize:32,margin:"24px 0 10px"}}>SASI · 智能软件交付说明</h1><p style={{color:"var(--lx-muted)",lineHeight:1.85}}>所有软件仅在正式支付及交付验收通过后开放购买。正式产品使用说明以商品订单页和交付协议为准。</p><div style={{display:"grid",gap:14,marginTop:24}}>
{[
["产品","哥白尼 SI 9.5 MT5 软件仅提供 ¥6,900 源码授权版，不提供非源码版本。"],
["演示","模拟账户的服务器与只读观察凭证将在产品详情页公开，供购买前查看。"],
["交付","仅向已核验付款且具有订单授权的账户提供限时下载链接；软件、参数手册、安装说明及校验信息随订单交付。"],
["安全","仅按订单约定授予源码使用许可；私有交付文件与用户专属下载链接不向公众公开。"],
["风险与售后","EA 自动交易不保证任何收益。数字软件的退款、故障处理和消费者法定权益，按实际销售地区的适用规则与订单条款处理。"],
["历史业务","原 SASI 生成服务产生的订单、作品、已购买的权益仍保留查询和售后，不与新版软件商品混同。"]
].map(([h,t])=><section key={h} style={{border:"1px solid var(--lx-line)",background:"var(--lx-panel)",borderRadius:14,padding:20}}><h2 style={{fontSize:17,marginBottom:8}}>{h}</h2><p style={{lineHeight:1.9,fontSize:14}}>{t}</p></section>)}</div></div></main><Footer/></>}
