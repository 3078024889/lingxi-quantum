import Link from "next/link";
import LxText from "@/components/LxText";
import {redirect} from "next/navigation";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";
import {safeMarketProductId} from "@/lib/ai-market-vendor-claims";
import VendorClaimsPanel from "./VendorClaimsPanel";
export const runtime="nodejs";export const dynamic="force-dynamic";
export const metadata={title:"全球 SIAI 厂商认领 | 灵犀场"};
export default async function MarketVendorPage({searchParams}:{searchParams:Promise<{product?:string}>}){
 const query=await searchParams;
 const product=safeMarketProductId(query?.product)||"";
 if(!isSupabasePublicConfigured())return <main className="mx-auto max-w-3xl px-6 py-14"><h1>厂商中心</h1><p>账户服务暂不可用。</p></main>;
 const user=await getServerUser(createClient());
 if(!user?.email_confirmed_at){
  const destination="/account/ai-market"+(product?"?product="+encodeURIComponent(product):"");
  redirect("/account?next="+encodeURIComponent(destination));
 }
 return <main className="mx-auto max-w-3xl px-5 py-12">
  <p className="mb-3"><Link href="/account">← <LxText zh="返回我的灵犀场账户" en="Back to my LINGXIFIELD account" ja="アカウントに戻る" ko="계정으로 돌아가기" fr="Retour à mon compte" de="Zurück zu meinem Konto" es="Volver a mi cuenta" pt="Voltar à minha conta" ar="العودة إلى حسابي"/></Link></p>
  <h1 className="text-3xl font-bold"><LxText zh="全球 SIAI 厂商中心" en="Global SIAI Vendor Center" ja="Global SIAI ベンダーセンター" ko="Global SIAI 공급업체 센터" fr="Espace éditeurs Global SIAI" de="Global SIAI Anbieterportal" es="Portal de proveedores Global SIAI" pt="Portal de fornecedores Global SIAI" ar="بوابة مزودي Global SIAI"/></h1>
  <p className="mt-3 text-sm leading-7"><LxText zh="直接使用现有灵犀场账户，免费认领最多 3 个产品；需企业身份核验。赞助展示与客观排名分开，付款尚未开放。" en="Use your existing LINGXIFIELD account to claim up to three products for free. Company verification is required; sponsored placements are separate from organic rankings and payment is not live." ja="既存のLINGXIFIELDアカウントで最大3製品を無料申請できます。企業審査が必要です。広告と通常順位は別です。" ko="기존 LINGXIFIELD 계정으로 최대 3개 제품을 무료 신청할 수 있습니다. 회사 확인이 필요하며 광고와 일반 순위는 분리됩니다." fr="Utilisez votre compte LINGXIFIELD pour revendiquer jusqu’à trois produits gratuitement. Vérification de l’entreprise obligatoire ; publicité et classement organique restent séparés." de="Mit Ihrem bestehenden LINGXIFIELD-Konto können Sie bis zu drei Produkte kostenlos beanspruchen. Unternehmensprüfung erforderlich; Werbung und organische Platzierung sind getrennt." es="Usa tu cuenta LINGXIFIELD para reclamar hasta tres productos gratis. Se verificará la empresa; los anuncios no alteran la clasificación orgánica." pt="Use sua conta LINGXIFIELD para reivindicar até três produtos gratuitamente. A empresa será verificada; anúncios não alteram o ranking orgânico." ar="استخدم حساب LINGXIFIELD الحالي للمطالبة بما يصل إلى ثلاثة منتجات مجانًا. يلزم التحقق من الشركة، والإعلانات منفصلة عن التصنيف الطبيعي."/></p>
  {user.app_metadata?.ai_market_vendor_reviewer===true&&<p className="my-4"><Link className="underline font-bold" href="/account/ai-market/review">审核厂商认领申请 / Review vendor claims</Link></p>}
  <VendorClaimsPanel initialProduct={product}/>
 </main>
}
