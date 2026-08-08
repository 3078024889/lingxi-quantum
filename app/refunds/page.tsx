import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const REFUNDS_FAQ: BilingualFaqItem[] = [
  {
    qZh: "买了体验内容后感觉不符合期待，可以退款吗？", qEn: "If a piece of content doesn't match my expectations, can I get a refund?",
    aZh: "灵犀场提供的是个人探索体验。内容生成完成后，由于数字内容已经即时提供，单纯因个人理解、感受或期待差异，一般不属于退款范围。如果出现技术故障、内容无法访问、重复支付，可以联系我们处理。",
    aEn: "Lingxi Field offers a personal exploration experience. Once content has been generated, because digital content is provided instantly, a difference in personal understanding, feeling, or expectation alone generally isn't grounds for a refund. If you experience a technical fault, inaccessible content, or a duplicate charge, please contact us.",
  },
  {
    qZh: "退款多久可以到账？", qEn: "How long does a refund take to arrive?",
    aZh: "我们通常会在收到申请后的5个工作日内完成审核。退款成功后，将按照原支付渠道规则返回，实际到账时间取决于支付服务商。",
    aEn: "We typically complete our review within 5 business days of receiving your request. Once approved, the refund is returned via the original payment channel's rules — the actual arrival time depends on the payment provider.",
  },
];

export const metadata = {
  title: "退款政策 | 灵犀场 | Refund Policy | Lingxi Field",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-sm border border-white/10 bg-void-deep px-8 py-10 sm:px-12 sm:py-14">
        <h1 className="font-display text-4xl font-light text-bone">
          <Bi zh="退款政策" en="Refund Policy" />
        </h1>
        <p className="mt-2 text-sm text-bone-dim">
          <Bi zh="最后更新：2026年7月" en="Last updated: July 2026" />
        </p>

        <div className="mt-10 space-y-8 text-base leading-8 text-bone-dim">
          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="1. 数字体验说明" en="1. About Digital Experiences" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场提供的部分内容属于即时生成数字体验，例如生命图谱、关系探索、灵犀生命灵签、量子生命镜像、个性化探索报告。这些内容会根据用户提交的信息生成，并在完成后立即提供访问权限。"
                en="Some content on Lingxi Field is an instantly generated digital experience — for example, the Life Map, relationship exploration, the Lingxi Life Oracle, Quantum Life Mirror, and personalized exploration reports. This content is generated from the information you submit and access is granted immediately once it's complete."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="2. 可以申请退款的情况" en="2. When a Refund Can Be Requested" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="如果发生：支付成功但内容未开启；系统技术故障导致无法使用；重复支付；未授权支付，请联系我们处理。"
                en="If any of the following occur — payment succeeded but content did not open; a system fault made the content unusable; a duplicate charge; or an unauthorized payment — please contact us."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="3. 通常无法退款的情况" en="3. When a Refund Generally Isn't Available" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="由于数字内容具有即时生成属性，以下情况通常不属于退款范围：已生成并查看内容；因个人主观感受认为内容「不符合期待」；认为探索结果「不准确」；用户填写信息错误导致结果变化。灵犀场提供的是探索体验，而非保证性预测服务。"
                en="Because digital content is generated instantly, the following generally aren't grounds for a refund: content that has already been generated and viewed; a personal, subjective sense that content 'didn't match expectations'; a belief that a result was 'inaccurate'; or a result that changed because of information you entered incorrectly. Lingxi Field offers an exploratory experience, not a guaranteed predictive service."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="4. 退款申请流程" en="4. How to Request a Refund" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="请发送邮件至 support@lingxifield.com，提供注册邮箱、订单信息、问题描述。我们将在通常5个工作日内回复处理结果。退款到账时间取决于支付服务商处理周期。"
                en="Please email support@lingxifield.com with your registered email, order information, and a description of the issue. We will typically respond with an outcome within 5 business days. The time for a refund to arrive depends on the payment provider's processing cycle."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="联系我们" en="Contact Us" />
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>support@lingxifield.com</p>
              <p>business@lingxifield.com</p>
              <p>contact@lingxifield.com</p>
            </div>
          </section>
        </div>
        <div className="mt-16">
          <FaqSection items={REFUNDS_FAQ} />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
