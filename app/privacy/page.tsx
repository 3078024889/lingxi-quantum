import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const PRIVACY_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场会不会把我的出生信息卖给第三方？", qEn: "Does Lingxi Field sell my birth information to third parties?",
    aZh: "不会。出生信息仅用于生成你自己的报告，以及发送给语言模型服务商用于撰写解读文字，不会被用于广告投放或者出售给其他公司。",
    aEn: "No. Your birth information is used only to generate your own report and is sent to the language model provider solely to write your reading — it is never used for advertising targeting or sold to other companies.",
  },
  {
    qZh: "我可以要求灵犀场删除我的数据吗？", qEn: "Can I request that Lingxi Field delete my data?",
    aZh: "可以，你可以随时在账户页面删除自己的测试记录，如需注销整个账户或有其他数据请求，可以通过网站内的联系方式联系我们处理。",
    aEn: "Yes. You can delete your own test records at any time from your account page. To close your account entirely or make other data requests, contact us through the contact information on this Site.",
  },
];



export const metadata = {
  title: "隐私政策 | Privacy Policy | Lingxi Field",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-sm border border-white/10 bg-void-deep px-8 py-10 sm:px-12 sm:py-14">
        <h1 className="font-display text-4xl font-light text-bone">
          <Bi zh="隐私政策" en="Privacy Policy" />
        </h1>
        <p className="mt-2 text-sm text-bone-dim">
          <Bi zh="最后更新：2026年7月" en="Last updated: July 2026" />
        </p>

        <div className="mt-10 space-y-8 text-base leading-8 text-bone-dim">
          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="1. 我们收集哪些信息" en="1. What Information We Collect" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="账户信息：注册时提供的邮箱地址，由我们的账户服务商（Supabase）处理身份验证。测试与报告数据：你为生成个人报告而主动填写的信息，包括出生日期、出生时间（可选）、出生地点（可选）、称呼（可选）。梦境记录、显化愿景、修炼心得等你主动写下并保存的文字内容。付款记录：购买了哪个产品、购买时间、金额，不包括你的完整支付账户或密码信息——支付信息由第三方支付服务商（如微信支付）直接处理，我们不会接触或存储你的完整支付凭证。使用数据：访问的页面、设备与浏览器类型等基础技术信息，用于网站正常运行与故障排查。"
                en="Account information: the email address you provide at registration, used for authentication through our account service provider (Supabase). Test and report data: information you voluntarily submit to generate a personal report, including birth date, birth time (optional), birth place (optional), and a preferred name (optional); as well as dream journal entries, manifestation visions, and practice journal entries you choose to write and save. Payment records: which product was purchased, when, and for how much \u2014 this does not include your full payment account or password details. Payment details are handled directly by third-party payment providers (such as WeChat Pay); we never receive or store your full payment credentials. Usage data: basic technical information such as pages visited and device/browser type, used for keeping the Site running properly and for troubleshooting."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="2. 我们如何使用这些信息" en="2. How We Use This Information" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="生成你请求的个人报告与解读内容；维护你的账户，让你能够查看、下载、删除自己保存过的记录；处理你的付款、解锁你购买的内容；改进网站的功能与体验；在必要时（例如客服支持）与你联系。"
                en="To generate the personal reports and readings you request; to maintain your account so you can view, download, and delete records you have saved; to process your payments and unlock the content you have purchased; to improve the Site's functionality and experience; and, when necessary (such as for customer support), to contact you."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="3. 内容生成方式——如实说明" en="3. How Content Is Generated \u2014 An Honest Explanation" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="这一节我们选择使用清楚、准确的技术用语，而不是网站其余部分使用的场域化语言，因为隐私政策的目的是让你准确了解数据如何被处理，不是品牌表达。你提交的出生信息、命盘数据，会被发送给第三方语言模型服务商（智谱AI）用于生成解读文字；命盘本身的计算（行星位置、历法换算等）在我们自己的服务器上完成，不会发送给第三方。我们与语言模型服务商之间有相应的数据处理约定，你的信息不会被该服务商用于训练其模型或用于其他与生成你的报告无关的目的。"
                en="In this section, we intentionally use clear, precise technical language rather than the more evocative language used elsewhere on the Site, because the purpose of a privacy policy is for you to accurately understand how your data is processed, not to express our brand voice. The birth information and chart data you submit are sent to a third-party language model provider (Zhipu AI) to generate the narrative text of your reading. The chart calculations themselves (planetary positions, calendrical conversions, etc.) are performed on our own servers and are not sent to any third party. We have a data processing agreement with our language model provider; your information is not used by that provider to train its models or for any purpose unrelated to generating your report."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="4. 我们如何存储与保护信息" en="4. How We Store & Protect Information" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="你的账户与报告数据存储在Supabase提供的数据库服务上，并启用了行级安全策略（Row Level Security），确保只有你自己的账户能够访问你自己的数据，我们的技术团队在日常运营中不会主动查看单个用户的具体报告内容。我们采取合理的技术与管理措施保护你的信息，但请理解，没有任何互联网传输或存储方式能保证百分之百的安全。"
                en="Your account and report data are stored on database infrastructure provided by Supabase, with Row Level Security enabled, ensuring that only your own account can access your own data; our technical team does not routinely view individual users' report content in the course of normal operations. We take reasonable technical and organizational measures to protect your information, but please understand that no method of transmission or storage over the internet can be guaranteed to be 100% secure."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="5. 你的权利" en="5. Your Rights" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="你可以随时在账户页面查看、下载自己保存过的报告记录；可以随时删除自己的测试记录（删除后无法恢复）；如需注销整个账户或有其他关于个人信息的请求（例如导出全部数据、更正信息），请通过网站内的联系方式与我们联系，我们会在合理时间内处理。"
                en="You may view and download your saved report records at any time from your account page; you may delete your own test records at any time (deletion is permanent and cannot be undone); if you wish to close your account entirely or have other requests regarding your personal information (such as exporting all your data or correcting information), please contact us through the contact information on this Site, and we will address your request within a reasonable time."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="6. 未成年人隐私" en="6. Children's Privacy" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="本网站不是专门面向儿童设计的，我们不会在明知的情况下收集13周岁以下儿童的个人信息。如果你是家长或监护人，发现自己未满13周岁的孩子向我们提供了个人信息，请联系我们，我们会尽快删除相关信息。"
                en="This Site is not specifically directed at children, and we do not knowingly collect personal information from children under the age of 13. If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us and we will remove it promptly."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="7. 跨境数据传输" en="7. International Data Transfers" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="由于我们使用的部分技术服务商（如账户与数据库服务、语言模型服务）的服务器可能位于不同国家/地区，你的信息在处理过程中可能会跨境传输。我们会要求相关服务商遵守适当的数据保护标准。"
                en="Because some of the technical service providers we use (such as our account/database service and language model service) may operate servers in different countries or regions, your information may be transferred across borders during processing. We require the relevant providers to comply with appropriate data protection standards."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="8. 政策变更" en="8. Changes to This Policy" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="我们可能不时更新本政策，更新后的版本将标注新的生效日期并发布于本页面。重大变更时，我们会尽合理努力以显著方式告知你。"
                en="We may update this Policy from time to time. Updated versions will be marked with a new effective date and posted on this page. For material changes, we will make reasonable efforts to notify you in a prominent way."
              />
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-bone">
              <Bi zh="9. 联系我们" en="9. Contact Us" />
            </h2>
            <p className="mt-3">
              <Bi
                zh="如对本政策或你的个人信息有任何疑问，请通过网站内的联系方式与我们联系。"
                en="If you have any questions about this Policy or your personal information, please contact us through the contact information provided on this Site."
              />
            </p>
          </section>
        </div>
        <div className="mt-16">
          <FaqSection items={PRIVACY_FAQ} />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
