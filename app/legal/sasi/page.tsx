import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata: Metadata = {
  title: "SASI 法律与规则 · Legal & Rules",
  description: "灵犀场 SASI 用户服务、AI创作、制作账户、外部能力接入、知识产权与生成内容标识规则。",
};

const sections = [
  {
    titleZh: "一、用户服务协议", titleEn: "1. Terms of Service",
    bodyZh: "SASI 提供文本、图片、音频、视频、短剧工作流、AI 编程、网站与应用构建部署、Skills、意识显化与场域精测等服务。AI 输出可能存在错误、偏差、随机差异、代码缺陷或连续性问题；正式发布、商业使用和上线部署前，用户应完成必要审核。不得出售账户、绕过计费、盗用密钥、传播恶意代码或攻击未经授权的系统。",
    bodyEn: "SASI may provide text, image, audio and video generation, drama workflows, AI coding, website and app delivery, Skills, Manifestation and Field Insights. AI outputs may contain errors, bias, variation, code defects or continuity issues. Users must review work before publication, commercial use or deployment. Account resale, billing evasion, credential theft, malware and unauthorized intrusion are prohibited.",
  },
  {
    titleZh: "二、隐私政策", titleEn: "2. Privacy Policy",
    bodyZh: "为提供服务，平台可能处理账户、订单、项目、用户上传内容和必要技术日志，并仅在完成任务所需范围内把提示词或参考素材发送给所选第三方 Provider。API Key 必须服务端加密、脱敏展示并可删除。平台遵循最小必要原则，并提供依法查询、更正、删除与注销渠道。",
    bodyEn: "To provide the service, the platform may process account, order, project, uploaded-content and necessary technical-log data, and may send prompts or references to the selected provider only as needed for a task. API keys must be encrypted server-side, masked and deletable. Data processing follows necessity and supports lawful access, correction, deletion and account closure requests.",
  },
  {
    titleZh: "三、AI 创作规则", titleEn: "3. AI Creation Rules",
    bodyZh: "用户应拥有上传文本、剧本、小说、肖像、声音、图片、视频、代码和 Skill 的合法权利。未经授权不得仿冒真实人物、克隆声音、侵犯著作权、商标权、肖像权、隐私或商业秘密。平台可拒绝、暂停或移除明显违法、侵权或高风险任务。",
    bodyEn: "Users must hold lawful rights to uploaded text, scripts, novels, likenesses, voices, images, video, code and Skills. Unauthorized impersonation, voice cloning, copyright or trademark infringement, privacy violations and misuse of trade secrets are prohibited. The platform may reject, pause or remove unlawful, infringing or high-risk tasks.",
  },
  {
    titleZh: "四、制作账户、结算与退还", titleEn: "4. Production Account, Settlement and Returns",
    bodyZh: "SASI 制作账户与意识显化等独立产品分开。需使用制作额度的任务会先展示制作提案、规格、投入上限和风险；用户授权后锁定相应额度，按实际执行结算并归还未使用部分。未产生不可退外部支出的失败任务退回相应额度；已经发生且不可撤销的外部支出按授权页规则处理。主观审美不符不当然构成系统故障，重新制作如产生新的外部调用须再次获得授权。",
    bodyEn: "The SASI production account is separate from products such as Manifestation. Work requiring production allocation presents a proposal, grade, ceiling and risk before authorization. The required allocation is then secured, actual execution is settled, and unused portions are returned. Failed work without non-refundable external expense is returned; unavoidable external charges follow the authorization terms. Subjective dissatisfaction is not automatically a system fault, and a new external run requires renewed authorization.",
  },
  {
    titleZh: "五、外部能力接入", titleEn: "5. External Capability Access",
    bodyZh: "专业用户接入自有外部能力账户时，相关服务支出由用户与外部服务方直接结算；SASI 仅可在用户主动授权任务所需范围内使用相应凭证，并可另行收取已提前展示的编排或专业能力授权额度。外部服务的价格、限流、地区限制、停机与账户规则由其自身条款决定。",
    bodyEn: "When professional users connect an external capability account, related service charges are settled directly with that service. SASI may use the credential only for user-authorized work and may separately require clearly disclosed orchestration or professional-capability allocation. Pricing, limits, regional availability, outages and account rules remain governed by the external service.",
  },
  {
    titleZh: "六、能力作品发布与授权", titleEn: "6. Capability Publishing and Licensing",
    bodyZh: "用户 Skill 上线前须经过权限声明、版本隔离与安全审查。禁止恶意软件、后门、凭证窃取、未授权攻击、违法生成和假冒官方 Skill。创作者须拥有合法权利；平台可审核、拒绝、下架、暂停结算或处理退款。交易和创作者分成在相关功能正式开放前另行公示。",
    bodyEn: "User Skills require permission declarations, version isolation and security review before release. Malware, backdoors, credential theft, unauthorized attacks, unlawful generation and fake official Skills are prohibited. Creators must hold lawful rights. The platform may review, reject, remove, suspend settlement or issue refunds. Marketplace terms and revenue share will be published before launch.",
  },
  {
    titleZh: "七、知识产权", titleEn: "7. Intellectual Property",
    bodyZh: "用户保留其依法拥有的输入内容权利，并授权平台在完成任务所必需范围内存储、处理、转换和调用 Provider。AI 输出不保证独创性、可登记性、排他性或绝对不侵权。LingxiField、SASI、Logo、官方 UI、代码、文档、Skills 与工作流归平台或合法权利人所有。",
    bodyEn: "Users retain lawful rights in their inputs and permit the platform to store, process, transform and send them to providers only as necessary to perform a task. AI output is not guaranteed to be original, registrable, exclusive or non-infringing. LingxiField, SASI, their logos, official UI, code, documents, Skills and workflows belong to the platform or lawful owners.",
  },
  {
    titleZh: "八、AI 服务风险提示", titleEn: "8. AI Service Risk Notice",
    bodyZh: "AI 不是确定性系统。视频可能出现面部、手指、动作、服装、场景、口型和闪烁问题；代码可能存在 Bug、漏洞或兼容性问题。“高清”“电影级”是平台内部方案等级，不是绝对效果保证。预算明显不足时平台必须提前提示且不得静默降质。",
    bodyEn: "AI is not deterministic. Video may show face, hand, motion, wardrobe, scene, lip-sync or flicker defects; code may contain bugs, vulnerabilities or compatibility problems. High Definition and Cinema are internal plan tiers, not absolute guarantees. Materially insufficient budgets must be disclosed and never trigger a silent downgrade.",
  },
  {
    titleZh: "九、AI 生成内容标识与导出", titleEn: "9. AI Content Labels and Export",
    bodyZh: "交付页面将在作品周边持续展示“AI 生成合成”提示；成片文件写入包含生成属性、服务提供者和作品编号的 AIGC 元数据。SASI 不叠加持续占据画面的品牌水印，也不提供内容社区发布。用户逐任务申请洁净画面导出时，应确认对外发布标识义务；平台依法留存申请对象、任务、协议版本与时间记录不少于六个月。用户自行发布时，应主动使用目标平台提供的 AI 内容标识功能，不得恶意删除、篡改、伪造或隐匿依法必须保留的标识。",
    bodyEn: "Delivery surfaces continuously disclose that a work is AI-generated, while the exported file carries AIGC metadata identifying its generated status, provider and production ID. SASI does not impose a persistent branded visual watermark and does not operate a publishing community. A clean visual export is requested per task with acknowledgement of publication-label duties; recipient, task, agreement version and time records are retained for at least six months. When publishing elsewhere, users must use the destination platform's AI-content disclosure and must not maliciously delete, alter, forge or conceal required labels.",
  },
];

export default function SasiLegalPage() {
  return <><Nav /><main className="px-6 pb-28 pt-28"><article className="mx-auto max-w-4xl"><p className="text-xs uppercase tracking-[.22em] text-lattice">LingxiField SASI</p><h1 className="mt-4 font-display text-4xl font-light text-bone sm:text-6xl"><Bi zh="法律与规则" en="Legal & Rules" /></h1><p className="mt-6 max-w-2xl leading-8 text-bone-dim"><Bi zh="以下是 SASI 第一阶段的双语平台规则摘要。充值、用户 Skill 交易和真实模型调用正式开放前，将补充经营主体、联系渠道、数据位置及各 Provider 的最终条款。" en="This bilingual summary governs SASI phase one. Before payments, user Skill trading or live model calls open, the final operator details, contact channel, data location and provider-specific terms will be added." /></p><div className="mt-14 space-y-5">{sections.map((section) => <section key={section.titleEn} className="rounded-sm border border-white/10 bg-void-deep p-7"><h2 className="font-display text-2xl text-bone"><Bi zh={section.titleZh} en={section.titleEn} /></h2><p className="mt-4 leading-8 text-bone-dim"><Bi zh={section.bodyZh} en={section.bodyEn} /></p></section>)}</div><p className="mt-10 text-xs leading-6 text-bone-soft"><Bi zh="版本：SASI Phase 1 · 2026-09-07。本页为产品规则摘要，不替代针对具体经营和数据处理活动的专业法律审查。" en="Version: SASI Phase 1 · 2026-09-07. This page is a product-rule summary and does not replace professional legal review for the actual operation and data-processing activities." /></p></article></main><Footer /></>;
}
