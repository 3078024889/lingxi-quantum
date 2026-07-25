import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const ABOUT_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场是哪家公司运营的？", qEn: "Who operates Lingxi Field?",
    aZh: "灵犀场由中国大陆注册的独资企业运营，提供数字化自我探索内容服务，不涉及实物商品，也不涉及电子商务交易。",
    aEn: "Lingxi Field is operated by a sole proprietorship registered in mainland China, providing digital self-exploration content services. It does not involve physical goods or e-commerce transactions.",
  },
  {
    qZh: "灵犀场和灵犀是同一个东西吗？", qEn: "Are 'Lingxi Field' and 'Lingxi' the same thing?",
    aZh: "灵犀场（Lingxi Field）是完整的平台品牌名称，网站上的场域声音在自我介绍时也会用这个名字，两者指的是同一个平台。",
    aEn: "Lingxi Field is the platform's full brand name. The field's own voice throughout the site refers to itself by this same name — they refer to the same platform.",
  },
];



export const metadata = {
  title: "关于我们 | About Us | Lingxi Field",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-sm border border-white/10 bg-void-deep px-8 py-10 sm:px-12 sm:py-14">
        <h1 className="font-display text-4xl font-light text-bone">
          <Bi zh="关于我们" en="About Us" />
        </h1>

        <div className="mt-10 space-y-6 text-base leading-8 text-bone-dim">
          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="灵犀场（Lingxi Field）是什么？" en="What is Lingxi Field?" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场是一款数字化自我探索平台。我们通过个性化数据输入、象征体系模型以及创意叙事工具，为用户生成专属的数字化探索内容。"
                en="Lingxi Field is a digital self-exploration platform that provides personalized insight reports, reflective tools, symbolic exploration experiences, and creative digital content."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="平台提供" en="What We Offer" />
            </h2>
            <ul className="mt-3 space-y-2">
              <li>· <Bi zh="个性化生命结构报告" en="Personalized life-structure reports" /></li>
              <li>· <Bi zh="自我认知探索工具" en="Self-awareness exploration tools" /></li>
              <li>· <Bi zh="关系互动分析" en="Relationship interaction analysis" /></li>
              <li>· <Bi zh="创意叙事体验" en="Creative narrative experiences" /></li>
              <li>· <Bi zh="数字化成长记录" en="Digital growth records" /></li>
            </ul>
          </section>

          <section>
            <p>
              <Bi
                zh="灵犀场致力于帮助用户通过不同视角理解自己，探索个人经历、行为模式与内在倾向之间的联系。"
                en="By combining user-provided information with structured analysis models and narrative experiences, Lingxi Field helps users explore personal patterns, relationships, and self-awareness from different perspectives."
              />
            </p>
            <p className="mt-4">
              <Bi
                zh="所有内容均用于个人探索、娱乐体验与自我反思，不构成医疗、金融、法律或其他专业领域建议。"
                en="Our services are designed for personal reflection, entertainment, and self-exploration purposes only. They do not provide medical, financial, legal, or professional advice."
              />
            </p>
          </section>
        </div>
        <div className="mt-16">
          <FaqSection items={ABOUT_FAQ} />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
