import Link from "next/link";
import {vendorEnquiryHref} from "../../lib/ai-discovery/evidence-status";
export default function InformationStatus({product}: {product: string}) {
 return <section aria-label={`${product} 使用前须知`}><h3>使用前先看这三点</h3><ol><li>先看官网当前价格，确认按月、按年还是按次收费。</li><li>免费额度还需确认，使用前留意试用次数、到期时间和水印限制。</li><li>确认你的地区能否注册、使用和付款。</li></ol><p>建议先用小任务试试，确认效果满意后再付费。</p><details><summary>资料不全或有变化？</summary><p>我们还没有确认最新价格、免费额度和地区条件。这不表示该产品不支持相关功能。</p><a href={vendorEnquiryHref(product,"correction")}>免费提供官方资料</a> · <Link href="/ai/vendors">我是厂商，管理或推广产品</Link></details></section>;
}
