import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const DECLARATION_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场是人工智能生成的算命服务吗？", qEn: "Is Lingxi Field an AI-generated fortune-telling service?",
    aZh: "不是。灵犀场并不是一个告诉你「未来会发生什么」的预测工具，而是一处连接自我探索、生命结构理解与意识扩展的数字场域。它通过天文周期、传统象征体系、生命原型、多维叙事与意识探索模型，将这些不同维度的信息重新连接，帮助你从新的角度观察自己——这里不是替你定义人生，而是提供一面更深的镜子，你依然是自己生命的创造者。",
    aEn: "No. Lingxi Field isn't a tool that tells you what will happen next — it's a digital field connecting self-exploration, an understanding of your life structure, and consciousness expansion. Drawing on astronomical cycles, traditional symbolic systems, life archetypes, dimensional narrative, and consciousness models, it reconnects these different dimensions of information to help you observe yourself from a new angle. This isn't about defining your life for you — it's a deeper mirror. You remain the creator of your own life.",
  },
  {
    qZh: "灵犀场的解读是怎么生成的？", qEn: "How are Lingxi Field's readings generated?",
    aZh: "先用真实天文数据和历法数据算出确定性的分数与结构，再由场域交叉引用这些已经算好的数字来撰写文字解读——是先有结构、后有文字，不是凭空编写。",
    aEn: "Deterministic scores and structures are computed first from real astronomical and calendrical data, and the narrative text is then written by cross-referencing those already-computed numbers — the structure comes first, the text comes after, not written out of thin air.",
  },
];

export const metadata = { title: "系统声明 | 灵犀场 · System Declaration | Lingxi Field" };

export default function DeclarationPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <div className="bg-void-deep mx-auto max-w-2xl rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="系统声明" en="System Declaration" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="关于灵犀场" en="About Lingxi Field" />
          </h1>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="bg-reading-glass mx-auto max-w-3xl space-y-14 px-8 py-12 sm:px-14">
            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="关于灵犀场" en="About Lingxi Field" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="Lingxi Field 灵犀场，是一个围绕意识探索、生命体验与个人成长构建的数字化探索空间。"
                  en="Lingxi Field is a digital space for exploration, built around the exploration of consciousness, life experience, and personal growth."
                /></p>
                <p><Bi
                  zh="灵犀场通过生命图谱、关系探索、生命灵签、量子塔罗、梦境记录、显化实践、意识练习等体验模块，引导个体观察自身状态、探索内在模式，并建立与自我更深层的连接。"
                  en="Through modules like the Life Map, relationship exploration, Life Oracle, Quantum Tarot, dream journaling, manifestation practice, and consciousness exercises, Lingxi Field guides individuals to observe their own state, explore inner patterns, and build a deeper connection with themselves."
                /></p>
                <p><Bi
                  zh="灵犀场所呈现的内容，是关于生命体验、象征探索与个人觉察方向的数字化体验。"
                  en="What Lingxi Field presents is a digital experience of life experience, symbolic exploration, and self-awareness."
                /></p>
                <p><Bi
                  zh="每一次进入灵犀场，都是一次与自身内在信息的连接与探索。"
                  en="Every entry into Lingxi Field is a connection with, and exploration of, your own inner information."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="使用说明与免责声明" en="Usage Notes & Disclaimer" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场中的所有内容，包括但不限于：" en="All content within Lingxi Field, including but not limited to:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="生命图谱探索" en="Life Map exploration" /></li>
                  <li><Bi zh="关系共振分析" en="Relationship Resonance analysis" /></li>
                  <li><Bi zh="生命灵签" en="the Life Oracle" /></li>
                  <li><Bi zh="量子塔罗体验" en="the Quantum Tarot experience" /></li>
                  <li><Bi zh="梦境记录与解析" en="dream recording and interpretation" /></li>
                  <li><Bi zh="显化练习" en="manifestation practice" /></li>
                  <li><Bi zh="意识探索技术" en="consciousness exploration techniques" /></li>
                </ul>
                <p><Bi zh="均属于个人探索、体验记录与自我觉察工具。" en="are all tools for personal exploration, experience recording, and self-awareness." /></p>
                <p><Bi
                  zh="相关内容旨在帮助用户获得新的观察角度、启发个人思考，并不构成："
                  en="This content is intended to help you gain a new vantage point and spark personal reflection. It does not constitute:"
                /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="医疗建议" en="medical advice" /></li>
                  <li><Bi zh="心理治疗" en="psychotherapy" /></li>
                  <li><Bi zh="精神健康诊断" en="a mental health diagnosis" /></li>
                  <li><Bi zh="法律建议" en="legal advice" /></li>
                  <li><Bi zh="财务或投资建议" en="financial or investment advice" /></li>
                </ul>
                <p><Bi
                  zh="灵犀场无法替代具备专业资质的医生、心理咨询师、法律顾问或其他专业人士提供的服务。"
                  en="Lingxi Field cannot replace the services of a qualified doctor, counselor, legal advisor, or other professional."
                /></p>
                <p><Bi
                  zh="如你正在面临健康、心理、法律或其他专业领域的问题，建议寻求对应领域专业人士的帮助。"
                  en="If you are facing a health, psychological, legal, or other professional issue, please seek help from a qualified professional in that field."
                /></p>
                <p><Bi
                  zh="用户进入并使用灵犀场，即代表理解并接受：灵犀场提供的是探索性数字体验，而非确定性预测或专业判断。"
                  en="By entering and using Lingxi Field, you acknowledge and accept that Lingxi Field offers an exploratory digital experience — not a deterministic prediction or professional judgment."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="原创与知识产权声明" en="Originality & Intellectual Property" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场中的：" en="Within Lingxi Field:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="生命图谱体系" en="the Life Map system" /></li>
                  <li><Bi zh="场域架构设计" en="the Field's architecture and design" /></li>
                  <li><Bi zh="内容结构" en="its content structure" /></li>
                  <li><Bi zh="文字体系" en="its written system" /></li>
                  <li><Bi zh="卡牌设计" en="its card designs" /></li>
                  <li><Bi zh="视觉系统" en="its visual system" /></li>
                  <li><Bi zh="动画效果" en="its animations" /></li>
                  <li><Bi zh="用户交互体验" en="its user interaction design" /></li>
                  <li><Bi zh="软件代码" en="and its software code" /></li>
                </ul>
                <p><Bi zh="均属于 Lingxi Field 灵犀场原创创作成果。" en="are all original creative works of Lingxi Field." /></p>
                <p><Bi
                  zh="部分意识探索理念与象征体系，来源于长期探索与创作实践，并经过现代数字语言重新整理与表达。"
                  en="Some of the consciousness-exploration concepts and symbolic systems come from long-term exploration and creative practice, reorganized and expressed through a modern digital language."
                /></p>
                <p><Bi zh="未经灵犀场授权，任何个人或组织不得：" en="Without authorization from Lingxi Field, no individual or organization may:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="复制" en="copy" /></li>
                  <li><Bi zh="批量提取" en="extract in bulk" /></li>
                  <li><Bi zh="商业转载" en="republish for commercial use" /></li>
                  <li><Bi zh="修改传播" en="modify and redistribute" /></li>
                  <li><Bi zh="创建类似商业产品" en="or create a similar commercial product" /></li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="隐私说明" en="Privacy" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场尊重每一位进入场域用户的数据隐私。" en="Lingxi Field respects the data privacy of every user who enters the field." /></p>
                <p><Bi zh="为了提供完整体验，我们可能收集以下必要信息：" en="To provide a complete experience, we may collect the following necessary information:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="登录邮箱" en="your login email" /></li>
                  <li><Bi zh="用户主动填写的信息" en="information you actively enter" /></li>
                  <li><Bi zh="生命探索相关数据" en="life-exploration data" /></li>
                  <li><Bi zh="梦境记录" en="dream journal entries" /></li>
                  <li><Bi zh="愿景记录" en="vision entries" /></li>
                  <li><Bi zh="个人体验内容" en="your personal experience content" /></li>
                </ul>
                <p><Bi zh="这些信息用于：" en="This information is used to:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="保存个人探索轨迹" en="save your personal exploration history" /></li>
                  <li><Bi zh="提供跨设备访问" en="provide cross-device access" /></li>
                  <li><Bi zh="生成个性化体验内容" en="generate personalized experience content" /></li>
                  <li><Bi zh="优化产品功能" en="improve product features" /></li>
                </ul>
                <p><Bi zh="灵犀场不会出售用户数据。" en="Lingxi Field does not sell user data." /></p>
                <p><Bi zh="不会将用户个人信息用于与服务无关的商业用途。" en="We do not use your personal information for commercial purposes unrelated to the service." /></p>
                <p><Bi zh="用户可以随时联系我们申请：" en="You may contact us at any time to request:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="数据查询" en="a data inquiry" /></li>
                  <li><Bi zh="数据删除" en="data deletion" /></li>
                  <li><Bi zh="账户注销" en="or account closure" /></li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="能量交换说明" en="On the Energy Exchange" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场部分探索模块采用数字体验开启机制，包括：" en="Some exploration modules in Lingxi Field use a digital-experience opening mechanism, including:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="生命图谱体验" en="the Life Map experience" /></li>
                  <li><Bi zh="关系探索体验" en="the relationship exploration experience" /></li>
                  <li><Bi zh="灵签体验" en="the Life Oracle experience" /></li>
                  <li><Bi zh="意识练习模块" en="consciousness practice modules" /></li>
                  <li><Bi zh="梦境探索周期" en="dream exploration cycles" /></li>
                </ul>
                <p><Bi zh="相关体验权限开启后，将与用户账户进行绑定。" en="Once opened, the corresponding access is bound to your account." /></p>
                <p><Bi
                  zh="由于数字内容具有即时生成与即时开启属性，体验开启后通常无法撤销。"
                  en="Because digital content is generated and opened instantly, access generally cannot be reversed once opened."
                /></p>
                <p><Bi zh="如遇：" en="If you encounter:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="支付异常" en="a payment error" /></li>
                  <li><Bi zh="重复扣款" en="a duplicate charge" /></li>
                  <li><Bi zh="内容未正常开启" en="content that failed to open correctly" /></li>
                  <li><Bi zh="技术故障" en="or a technical fault" /></li>
                </ul>
                <p><Bi zh="请联系我们，我们会进行核实处理。" en="please contact us and we will verify and resolve it." /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="联系灵犀场" en="Contact Lingxi Field" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="如果你有：" en="If you have:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="数据相关请求" en="a data-related request" /></li>
                  <li><Bi zh="使用反馈" en="usage feedback" /></li>
                  <li><Bi zh="技术问题" en="a technical issue" /></li>
                  <li><Bi zh="体验咨询" en="a question about the experience" /></li>
                  <li><Bi zh="商务合作" en="or a business inquiry" /></li>
                </ul>
                <p><Bi zh="欢迎通过以下方式连接：" en="you're welcome to reach us through:" /></p>
                <div className="space-y-2 text-sm">
                  <p><Bi zh="官方邮箱：" en="Official email:" /></p>
                  <p>support@lingxifield.com</p>
                  <p>business@lingxifield.com</p>
                  <p>contact@lingxifield.com</p>
                  <p className="pt-2"><Bi zh="官方网站：" en="Official website:" /></p>
                  <p>https://lingxifield.com</p>
                  <p>https://lingxifield.cn</p>
                  <p className="pt-2"><Bi zh="官方 X：" en="Official X:" /></p>
                  <a
                    href="https://x.com/lingxifield?s=11"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-sm border border-lattice/40 px-6 py-3 font-display text-sm tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"
                  >
                    X（Twitter）· @lingxifield
                  </a>
                </div>
              </div>
            </div>

            <p className="border-t border-white/5 pt-10 text-center text-xs leading-6 text-bone-dim/78">
              <Bi zh="愿每一次连接，都开启新的发现。" en="May every connection open a new discovery." />
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <FaqSection items={DECLARATION_FAQ} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
