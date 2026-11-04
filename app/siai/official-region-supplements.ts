/**
 * Additional official region-policy observations researched 2026-11-04.
 *
 * IMPORTANT: A platform's export-law terms, license scope, service plan, and
 * a published country allowlist are FOUR different things. These entries are
 * source-scoped observations, NOT confirmation of live signup, checkout, VPN
 * reachability, successful generation or availability in every other country.
 *
 * Historical candidate batch-001/002/003 observations remain immutable and
 * their original provenance counts do not silently change.
 */
import type {LingxiLang} from "@/lib/lingxi-i18n";

export type RegionPolicySupplement={
 source:string;
 checkedAt:"2026-11-04";
 scope:"official_policy_no_full_country_list"|"contract_worldwide_not_checkout";
 localized:Readonly<Record<LingxiLang,string>>;
};
export const OFFICIAL_REGION_SUPPLEMENTS:Readonly<Record<string,RegionPolicySupplement>>={
 "notion-ai":{
  source:"https://www.notion.com/help/notion-ai-faqs",checkedAt:"2026-11-04",scope:"official_policy_no_full_country_list",
  localized:{
   zh:"Notion 官方说明：AI 完整功能面向 Business／Enterprise 方案，Free／Plus 可有限试用。该说明没有发布逐国注册、付款与模型可用名单；不能据此断言全球无限制。",
   en:"Notion AI is offered on Business/Enterprise; Free/Plus have limited trials. The official FAQ does not provide a country-by-country signup, checkout or model-availability list.",
   ja:"Notion AI は Business／Enterprise 向け、Free／Plus は限定試用。公式 FAQ に国別の登録・決済・モデル提供一覧はありません。",
   ko:"Notion AI는 Business/Enterprise에서 제공되며 Free/Plus는 제한적으로 체험할 수 있습니다. 공식 FAQ에는 국가별 가입·결제·모델 지원 목록이 없습니다.",
   fr:"Notion AI est proposé aux offres Business/Enterprise, avec essai limité en Free/Plus. La FAQ officielle ne publie pas de liste de pays pour l'inscription, le paiement ou les modèles.",
   de:"Notion AI ist in Business/Enterprise verfügbar; Free/Plus bieten eine begrenzte Probephase. Die offizielle FAQ enthält keine Länderliste für Anmeldung, Bezahlung oder Modelle.",
   es:"Notion AI está disponible en Business/Enterprise; Free/Plus incluyen una prueba limitada. La ayuda oficial no publica países admitidos para registro, pago o modelos.",
   pt:"Notion AI está nos planos Business/Enterprise, com teste limitado em Free/Plus. O FAQ oficial não publica a lista de países para cadastro, pagamento ou modelos.",
   ar:"تتوفر مزايا Notion AI في خطط Business وEnterprise، مع تجربة محدودة في Free وPlus. لا ينشر الدليل الرسمي قائمة بالدول للتسجيل أو الدفع أو النماذج."
  }
 },
 "devin-desktop":{
  source:"https://cognition.com/legal/platform-terms-of-service",checkedAt:"2026-11-04",scope:"official_policy_no_full_country_list",
  localized:{
   zh:"Cognition 官方平台条款第 12.10 节规定受美国出口管制和制裁限制，受禁运地或限制名单主体不可违规使用；未公布 Devin Desktop 的完整逐国可用与付款名单。Devin Security 的独立国家清单不能套用到 Desktop。",
   en:"Cognition Platform Terms §12.10 prohibit use in breach of U.S. export controls or sanctions; they do not publish a Devin Desktop country-by-country availability/checkout list. Devin Security country lists apply to different features.",
   ja:"Cognition 規約 §12.10 は米国の輸出規制と制裁を要求。Devin Desktop の国別利用・決済一覧はありません。Devin Security の地域制限は別機能です。",
   ko:"Cognition 약관 §12.10은 미국 수출 통제 및 제재 준수를 요구합니다. Devin Desktop의 국가별 이용·결제 목록은 없으며 Devin Security 제한은 별도입니다.",
   fr:"Les conditions Cognition §12.10 imposent le respect des sanctions et contrôles à l'exportation américains. Pas de liste pays/paiement pour Devin Desktop; Devin Security est distinct.",
   de:"Cognition-Bedingungen §12.10 verlangen die Einhaltung von US-Exportkontrollen und Sanktionen. Keine Länderliste für Devin Desktop; Devin Security ist gesondert geregelt.",
   es:"Los términos de Cognition §12.10 exigen cumplir los controles de exportación y sanciones de EE. UU. No hay lista completa por país para Devin Desktop; Devin Security es distinto.",
   pt:"Os termos da Cognition §12.10 exigem cumprir controles de exportação e sanções dos EUA. Sem lista completa para Devin Desktop; Devin Security tem regras separadas.",
   ar:"تُلزم شروط Cognition في القسم 12.10 بالقيود الأمريكية على التصدير والعقوبات. ولا تنشر قائمة دول Devin Desktop؛ قيود Devin Security منفصلة."
  }
 },
 "freepik-ai":{
  source:"https://www.magnific.com/legal/ai-products",checkedAt:"2026-11-04",scope:"official_policy_no_full_country_list",
  localized:{
   zh:"Magnific 官方 AI 产品条款明确：部分功能使用第三方模型，使用者须同时遵守第三方模型许可与限制。该条款未列出逐国可生成、注册或付款名单，不能写成全球不限地区。",
   en:"Magnific's AI product terms incorporate third-party model restrictions. The policy does not provide a full country list for registration, generation or checkout; worldwide access is not confirmed.",
   ja:"Magnific AI 利用規約には第三者モデルの制限が適用されます。国別の登録・生成・決済可能地域一覧は公表されていません。",
   ko:"Magnific AI 약관에는 제3자 모델 제한이 적용됩니다. 국가별 가입·생성·결제 지원 목록은 공표되어 있지 않습니다.",
   fr:"Les conditions Magnific intègrent les restrictions des modèles tiers. Aucune liste exhaustive des pays pour inscription, génération et paiement n'est publiée.",
   de:"Für Magnific AI gelten auch Beschränkungen von Drittanbietermodellen. Eine vollständige Länderliste für Anmeldung, Generierung und Bezahlung fehlt.",
   es:"Las condiciones de Magnific incluyen restricciones de modelos externos. No se publica una lista completa de países para registro, generación y pago.",
   pt:"Os termos da Magnific incluem limites de modelos de terceiros. Não há lista completa de países para cadastro, geração e pagamento.",
   ar:"تخضع أدوات Magnific أيضًا لقيود نماذج الجهات الخارجية. ولا توجد قائمة كاملة منشورة بالدول المسموح فيها بالتسجيل والتوليد والدفع."
  }
 },
 "synthesia":{
  source:"https://www.synthesia.io/legal/acceptable-use-policy",checkedAt:"2026-11-04",scope:"official_policy_no_full_country_list",
  localized:{
   zh:"Synthesia 官方可接受使用政策要求遵守所有适用的出口管制等法律；该政策未公布完整的 Studio 可用国家或结账名单。活动报名排除国家不能直接视为 Studio 整体禁用国家。",
   en:"Synthesia's official policy requires export-control compliance, but does not provide a complete Studio country/checkout list. Competition exclusions must not be treated as universal Studio bans.",
   ja:"Synthesia の公式ポリシーは輸出管理法への準拠を要求しますが、Studio の国別提供・決済一覧はありません。コンテスト対象外の国を全機能の制限と混同しません。",
   ko:"Synthesia 공식 정책은 수출 통제법 준수를 요구하지만 Studio 국가별 지원·결제 목록을 제공하지 않습니다. 이벤트 제외 국가를 서비스 전체 제한으로 해석하지 않습니다.",
   fr:"Synthesia exige le respect des contrôles à l'exportation sans publier de liste exhaustive des pays pour Studio ou le paiement. Les exclusions d'un concours ne s'appliquent pas à tout le service.",
   de:"Synthesia verlangt die Einhaltung von Exportkontrollen, veröffentlicht aber keine vollständige Studio-Länder- oder Zahlungsliste. Wettbewerbs-Ausschlüsse sind nicht allgemeine Dienstsperren.",
   es:"Synthesia exige cumplir controles de exportación, pero no publica una lista global de países para Studio o pagos. Las exclusiones de concursos no son vetos generales.",
   pt:"Synthesia exige cumprir controles de exportação, mas não publica uma lista completa de países para Studio ou pagamentos. Exclusões de concursos não são proibições gerais.",
   ar:"تفرض Synthesia الالتزام بضوابط التصدير، لكنها لا تنشر قائمة شاملة بدول Studio أو الدفع. استثناءات المسابقات ليست حظرًا عامًا للمنصة."
  }
 },
 "scite":{
  source:"https://www.researchsolutions.com/scite-terms-and-conditions",checkedAt:"2026-11-04",scope:"contract_worldwide_not_checkout",
  localized:{
   zh:"Scite 母公司官方企业条款第 1 节向合同客户授予全球范围的软件访问许可；这不等于所有国家个人账号都能注册、支付或调用完整服务。个人地区及收款名单未列明。",
   en:"Scite's official B2B agreement grants contracted customers a worldwide software license (§1), not a guarantee of individual signup, billing or feature availability in every country.",
   ja:"Scite の企業向け契約 §1 は契約顧客に全世界の利用ライセンスを付与しますが、個人の国別登録・決済や機能提供を保証しません。",
   ko:"Scite 기업 계약 §1은 계약 고객에게 전 세계 사용권을 부여하지만 모든 국가의 개인 가입·결제·기능 제공을 보장하지 않습니다.",
   fr:"Le contrat B2B de Scite (§1) concède une licence mondiale aux clients sous contrat, sans garantir l'inscription individuelle, le paiement ou toutes les fonctions dans chaque pays.",
   de:"Scite gewährt Vertragskunden laut B2B-Bedingungen §1 eine weltweite Lizenz, garantiert aber keine individuelle Registrierung, Zahlung oder Funktionen in jedem Land.",
   es:"El contrato B2B de Scite (§1) concede licencia mundial a clientes contratados, sin garantizar registro individual, pago o funciones en todos los países.",
   pt:"O contrato B2B da Scite (§1) concede licença mundial a clientes contratados, mas não garante cadastro individual, pagamento ou recursos em todos os países.",
   ar:"تمنح اتفاقية Scite للشركات (§1) ترخيصًا عالميًا للعملاء المتعاقدين، ولا تضمن تسجيل الأفراد أو الدفع أو توفر جميع الميزات في كل بلد."
  }
 }
};
export function supplementalRegionFor(id:string,lang:LingxiLang):string|null{
 return OFFICIAL_REGION_SUPPLEMENTS[id]?.localized[lang]??null;
}
