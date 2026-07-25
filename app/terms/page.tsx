import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "服务条款 | Terms of Service | Lingxi Field",
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
                zh="灵犀场（Lingxi Field，网站域名 lingxifield.com，以下称「本网站」或「我们」）是一个提供自我探索类数字内容服务的平台，内容包括但不限于生命图谱、关系共振、生命灵签、量子塔罗、梦境记录与解析、显化练习、意识修炼技术等，均以真实的出生日期、时间等天文历法数据为基础，结合语言模型生成的文字解读，供用户参考。使用本网站即表示你同意本服务条款，请在使用前仔细阅读。"
                en="Lingxi Field (lingxifield.com, \u201cthe Site\u201d or \u201cwe\u201d) is a platform offering self-exploration digital content, including but not limited to life mapping, relationship resonance, life sign readings, quantum tarot, dream journaling and interpretation, manifestation practices, and consciousness practice techniques. All content is generated based on real astronomical and calendrical data (such as birth date and time) combined with narrative text produced by a language model, for personal reference only. By using this Site, you agree to these Terms of Service. Please read them carefully before use."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="2. 服务性质说明——请务必阅读" en="2. Nature of the Service — Please Read Carefully" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="本网站提供的所有内容，均为基于象征系统与已计算的确定性数据（天文位置、历法数据）生成的自我反思参考材料，其目的是帮助用户获得看待自身处境的新角度，不是、也不构成：命运预测、医疗诊断或建议、心理治疗或心理咨询、法律建议、财务或投资建议。如果你正在经历医疗、心理健康、法律或财务方面的困难，请咨询相应领域的专业持证人士，不要仅依据本网站内容做出重大决定。"
                en="All content provided by this Site is self-reflection material generated from a symbolic system and deterministic computed data (astronomical positions, calendrical data), intended to offer a new perspective on one's own circumstances. It does not constitute, and should not be relied upon as: a prediction of fate, medical diagnosis or advice, psychological therapy or counseling, legal advice, or financial or investment advice. If you are experiencing medical, mental health, legal, or financial difficulties, please consult a licensed professional in the relevant field. Do not make major life decisions based solely on content from this Site."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="3. 账户" en="3. Accounts" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="使用部分功能（例如保存测试记录、购买付费内容）需要注册账户。你需要对账户信息的真实性、账户与密码的保密性负责，并对账户下发生的所有活动承担相应责任。如果发现账户被未经授权使用，请立即联系我们。本网站主要面向成年人；如果你未满18周岁，请在监护人陪同、了解并同意本条款的情况下使用本网站，涉及付费的功能请务必获得监护人的明确同意。"
                en="Some features (such as saving test records or purchasing paid content) require account registration. You are responsible for the accuracy of your account information, the confidentiality of your account and password, and all activity that occurs under your account. If you become aware of any unauthorized use of your account, please contact us immediately. This Site is primarily intended for adults. If you are under 18, please use this Site only with the knowledge and consent of a parent or guardian, and obtain their explicit consent before using any paid features."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="4. 付费内容与购买" en="4. Paid Content & Purchases" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="本网站部分内容需要付费解锁，具体价格以购买时页面显示为准，付款通过第三方支付服务商（如微信支付）处理，本网站不会存储你的完整支付账户或密码信息。本网站的付费产品分为两类：一次性解锁类（如生命图谱、关系共振、生命灵签、量子塔罗、四大修炼技术等）付费后即永久有效，可反复查看；订阅制产品（如显化与梦境解读、多维叙事年度解锁、全构造解锁）按周期计费，到期后需续费才能继续使用，订阅不会自动续费扣款，到期后你可以自行选择是否续期。关于退款，请查看我们的《退款政策》。"
                en="Some content on this Site requires payment to unlock, at the price shown on the page at the time of purchase. Payments are processed through third-party payment providers (such as WeChat Pay); this Site does not store your full payment account or password details. Paid products on this Site fall into two categories: one-time unlocks (such as the Life Map, Relationship Resonance, Life Oracle, Quantum Tarot, and the Four Practices), which remain permanently accessible once purchased; and subscription products (such as Manifestation & Dream Interpretation, the yearly Narrative unlock, and Everything Unlocked), which are billed for a fixed period and require manual renewal to continue after expiry — subscriptions do not auto-renew or auto-charge; you choose whether to renew each time. For refunds, please see our Refund Policy."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="5. 知识产权" en="5. Intellectual Property" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="本网站的文字、图像、卡牌与符号设计、代码及整体呈现方式，除另有说明外，均归灵犀场所有或已获得合法授权。你为自己生成的个人报告（例如你的生命图谱、你的塔罗解读），可以自行保存、下载、用于个人用途或分享；未经授权，不得将本网站内容用于商业性复制、批量转售或建立竞争性产品。"
                en="Unless otherwise stated, the text, imagery, card and symbol designs, code, and overall presentation of this Site are owned by or licensed to Lingxi Field. Personal reports generated for you (such as your own Life Map or Tarot reading) may be saved, downloaded, used personally, or shared by you. Content from this Site may not be commercially reproduced, resold in bulk, or used to build a competing product without authorization."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="6. 禁止行为" en="6. Prohibited Conduct" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="使用本网站时，你同意不：冒用他人身份或提交虚假出生信息用于骚扰他人；尝试破解、逆向工程或干扰本网站的正常运行；将本网站用于任何非法目的；未经授权抓取、批量复制本网站内容。"
                en="When using this Site, you agree not to: impersonate another person or submit false birth information to harass others; attempt to hack, reverse-engineer, or disrupt the normal operation of this Site; use this Site for any unlawful purpose; or scrape or bulk-copy content from this Site without authorization."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="7. 免责声明与责任限制" en="7. Disclaimer & Limitation of Liability" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="本网站内容按「现状」提供，不作任何明示或暗示的准确性、完整性或适用性保证。在法律允许的最大范围内，灵犀场对因使用或无法使用本网站而产生的任何直接、间接、附带或后果性损失不承担责任。"
                en="Content on this Site is provided “as is,” without any express or implied warranty of accuracy, completeness, or fitness for a particular purpose. To the maximum extent permitted by law, Lingxi Field is not liable for any direct, indirect, incidental, or consequential loss arising from the use or inability to use this Site."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="8. 条款变更" en="8. Changes to These Terms" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="我们可能不时更新本条款，更新后的版本将标注新的生效日期并发布于本页面。继续使用本网站即表示你接受更新后的条款。"
                en="We may update these Terms from time to time. Updated versions will be marked with a new effective date and posted on this page. Continued use of this Site constitutes acceptance of the updated Terms."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="9. 联系我们" en="9. Contact Us" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="如对本条款有任何疑问，请通过网站内的联系方式与我们联系。"
                en="If you have any questions about these Terms, please contact us through the contact information provided on this Site."
              />
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
