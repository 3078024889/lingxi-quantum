import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "退款政策 | Refund Policy | Lingxi Field",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-light text-bone">
          <Bi zh="退款政策" en="Refund Policy" />
        </h1>
        <p className="mt-2 text-sm text-bone-dim">
          <Bi zh="最后更新：2026年7月" en="Last updated: July 2026" />
        </p>

        <div className="mt-10 space-y-8 text-base leading-8 text-bone-dim">
          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="1. 数字内容的性质" en="1. The Nature of Digital Content" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="灵犀场提供的付费内容（例如生命图谱、关系共振图谱、生命灵签、量子塔罗等完整报告）均为按你提交的个人信息即时生成的数字内容，一旦生成完成即可立即查看、下载，不涉及实物寄送。正因如此，我们的退款政策会比实体商品更严格，但我们同样承诺，如果确实是我们这边出了问题，会负责任地处理。"
                en="The paid content provided by Lingxi Field (such as full Life Map, Relationship Resonance, Life Oracle, or Quantum Tarot reports) is digital content generated instantly based on the personal information you submit, and becomes viewable and downloadable as soon as it is generated. There is no physical shipment involved. Because of this, our refund policy is stricter than what you might expect for physical goods \u2014 but we are equally committed to handling things responsibly when the issue is genuinely on our end."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="2. 什么情况下我们会退款" en="2. When We Will Issue a Refund" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="如果出现以下情况，请在购买后7天内联系我们，我们会为你处理退款：因技术故障，你付款后始终未能获得对应的解锁内容（且经我们排查确认不是网络或设备原因）；同一份订单被重复扣款；你能证明该笔购买并非由你本人授权（例如账户被盗用）。"
                en="If any of the following occurs, please contact us within 7 days of purchase and we will process a refund: due to a technical failure, you paid but were never able to access the corresponding unlocked content (and we have confirmed this was not caused by network or device issues on your end); the same order was charged more than once; or you can demonstrate that the purchase was not authorized by you (for example, your account was compromised)."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="3. 什么情况下我们通常不会退款" en="3. When We Generally Will Not Issue a Refund" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="内容已成功生成、你已经查看或下载，仅仅是因为不认同解读内容、或者认为解读不准而要求退款——因为本网站的内容性质是自我反思参考，不是可验证的预测服务，主观感受上的不满意，不属于我们所定义的服务故障；填写了错误的出生日期或信息导致生成的内容不符合预期（可以联系我们协助重新生成，但通常不会作为退款理由）；已经使用超过7天。"
                en="Content that has been successfully generated and that you have already viewed or downloaded, where the refund request is based solely on disagreeing with the reading or feeling it was \u201cnot accurate\u201d \u2014 because the content on this Site is self-reflection material, not a verifiable predictive service, so subjective dissatisfaction does not, on its own, constitute a service failure as we define it; content generated incorrectly due to birth date or information you entered incorrectly (we can help you regenerate it, but this is generally not grounds for a refund); or requests made more than 7 days after purchase."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="4. 如何申请退款" en="4. How to Request a Refund" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="请通过网站内的联系方式与我们联系，并提供：你的账户邮箱、购买的产品名称、购买时间（或订单/交易编号）、遇到问题的具体描述（如有截图请一并提供）。我们会在收到申请后的合理时间内（通常不超过5个工作日）回复你处理结果。退款将原路退回至你付款时使用的支付方式，实际到账时间取决于该支付服务商（如PayPal）的处理周期，通常为5-10个工作日。"
                en="Please contact us through the contact information on this Site and provide: your account email, the name of the product purchased, the purchase date (or order/transaction ID), and a specific description of the issue (including screenshots, if available). We will respond with the outcome within a reasonable time after receiving your request, typically no more than 5 business days. Refunds are issued back to the original payment method used, and the actual time for funds to arrive depends on the processing cycle of the relevant payment provider (such as PayPal), typically 5\u201310 business days."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="5. 联系我们" en="5. Contact Us" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="如对本政策有任何疑问，或希望申请退款，请通过网站内的联系方式与我们联系。"
                en="If you have any questions about this Policy, or wish to request a refund, please contact us through the contact information provided on this Site."
              />
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
