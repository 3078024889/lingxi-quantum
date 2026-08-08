import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const TERMS_FAQ: BilingualFaqItem[] = [
  {
    qZh: "使用灵犀场需要年满多少岁？", qEn: "How old do I need to be to use Lingxi Field?",
    aZh: "灵犀场主要面向成年人。未成年人使用平台，需要获得监护人同意，涉及能量交换的功能必须获得监护人的明确同意。",
    aEn: "Lingxi Field is primarily intended for adults. Minors using the platform need a guardian's consent, and any feature involving an energy exchange requires the guardian's explicit consent.",
  },
  {
    qZh: "灵犀场的内容可以商用吗？", qEn: "Can content from Lingxi Field be used commercially?",
    aZh: "用户生成的个人报告，可以用于个人保存和分享，但未经授权，不得商业复制、批量销售、二次开发，或用于建立竞争服务。",
    aEn: "Personal reports you generate may be kept and shared for personal use. Without authorization, they may not be commercially reproduced, resold in bulk, adapted into derivative products, or used to build a competing service.",
  },
];

export const metadata = {
  title: "服务条款 | 灵犀场 | Terms of Service | Lingxi Field",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-sm border border-white/10 bg-void-deep px-8 py-10 sm:px-12 sm:py-14">
        <h1 className="font-display text-4xl font-light text-bone">
          <Bi zh="服务条款" en="Terms of Service" />
        </h1>
        <p className="mt-2 text-sm text-bone-dim">
          <Bi zh="最后更新：2026年7月" en="Last updated: July 2026" />
        </p>

        <div className="mt-10 space-y-8 text-base leading-8 text-bone-dim">
          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="1. 关于灵犀场" en="1. About Lingxi Field" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="Lingxi Field 灵犀场（以下简称「灵犀场」「本平台」或「我们」）是一个提供数字化意识探索与个人成长体验的平台。平台通过生命图谱、关系探索、生命灵签、量子生命镜像、梦境记录、显化实践以及相关探索模块，为用户提供个性化数字体验内容。部分体验内容会根据用户提供的信息，结合数据计算、象征体系与智能生成技术形成个人化内容。"
                en="Lingxi Field ('Lingxi Field,' 'the platform,' or 'we') is a platform offering digital consciousness exploration and personal-growth experiences. Through the Life Map, relationship exploration, the Life Oracle, Quantum Life Mirror, dream journaling, manifestation practice, and related exploration modules, the platform provides personalized digital experience content. Some content is generated based on the information you provide, combined with data computation, symbolic systems, and intelligent generation technology."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="2. 服务性质说明" en="2. Nature of the Service" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场提供的所有内容，属于个人探索工具、象征体验内容以及自我觉察辅助材料。其目的在于帮助用户观察自身状态、探索个人模式、获得新的思考角度。相关内容不代表未来确定结果，不构成命运预测、医疗诊断、心理治疗、法律建议或财务建议。用户应基于自身判断使用相关体验。"
                en="All content on Lingxi Field is a tool for personal exploration, symbolic experience, and self-awareness. Its purpose is to help you observe your own state, explore your patterns, and gain a new vantage point. This content does not represent a certain future outcome, and does not constitute a prediction of fate, a medical diagnosis, psychotherapy, legal advice, or financial advice. You should use these experiences based on your own judgment."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="3. 用户账户" en="3. User Accounts" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="部分功能需要注册账户。用户需要提供真实有效的信息、妥善保护账户安全、对账户行为负责。如果发现账户存在未经授权使用情况，请及时联系我们。灵犀场主要面向成年人，未成年人使用平台，需要获得监护人同意。"
                en="Some features require a registered account. You need to provide accurate information, keep your account secure, and take responsibility for activity under your account. If you discover unauthorized use of your account, please contact us promptly. Lingxi Field is primarily intended for adults; minors need a guardian's consent to use the platform."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="4. 数字体验内容" en="4. Digital Experience Content" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场部分功能属于数字内容体验，包括生命图谱、灵犀生命灵签、量子生命镜像、关系探索、梦境探索。内容生成后会绑定至用户账户，用户可以查看个人生成内容。"
                en="Some features on Lingxi Field are digital content experiences, including the Life Map, Lingxi Life Oracle, Quantum Life Mirror, relationship exploration, and dream exploration. Once generated, content is bound to your account, and you can view content you've generated."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="5. 知识产权" en="5. Intellectual Property" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场拥有平台内容体系、视觉设计、软件系统、页面结构、创意表达相关知识产权。用户生成的个人报告，可以用于个人保存和分享。未经授权，不得商业复制、批量销售、二次开发，或建立竞争服务。"
                en="Lingxi Field owns the intellectual property in the platform's content system, visual design, software system, page structure, and creative expression. Personal reports you generate may be kept and shared for personal use. Without authorization, they may not be commercially reproduced, resold in bulk, adapted into derivative products, or used to build a competing service."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="6. 禁止行为" en="6. Prohibited Conduct" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="用户不得：使用他人身份创建账户；提供虚假信息进行恶意操作；攻击平台系统；破解程序；批量抓取内容；用于非法目的。"
                en="You may not: create an account using someone else's identity; provide false information for malicious purposes; attack the platform's systems; reverse-engineer or crack the software; scrape content in bulk; or use the platform for any unlawful purpose."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="7. 责任限制" en="7. Limitation of Liability" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场按照现有状态提供服务。我们努力保证内容准确、安全和稳定，但不保证所有体验结果符合个人期待，或内容能够满足所有个人需求。用户理解，灵犀场提供的是探索体验，而不是确定性答案。"
                en="Lingxi Field provides the service as-is. We work to keep content accurate, secure, and stable, but we do not guarantee that every experience will match your personal expectations, or that the content will meet every individual need. You understand that Lingxi Field offers an exploratory experience, not a definitive answer."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="8. 条款更新" en="8. Changes to These Terms" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="我们可能根据产品发展、安全要求或法律变化更新服务条款。更新后的版本将在网站公布。继续使用灵犀场，即表示接受更新后的条款。"
                en="We may update these Terms as the product evolves or as security or legal requirements change. Updated versions will be posted on the website. Continuing to use Lingxi Field means accepting the updated Terms."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="9. 联系我们" en="9. Contact Us" />
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>support@lingxifield.com</p>
              <p>business@lingxifield.com</p>
              <p>contact@lingxifield.com</p>
            </div>
          </section>
        </div>
        <div className="mt-16">
          <FaqSection items={TERMS_FAQ} />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
