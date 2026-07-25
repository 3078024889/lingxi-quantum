import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = { title: "系统声明 | 灵犀 · System Declaration | Lingxi" };

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
            <Bi zh="关于灵犀" en="About Lingxi" />
          </h1>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="bg-reading-glass mx-auto max-w-3xl space-y-14 px-8 py-12 sm:px-14">
            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="关于灵犀场" en="About the Lingxi Field" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="灵犀场（Lingxi Field）是一个围绕意识探索、生命体验与内在成长构建的数字场域。"
                  en="Lingxi Field is a digital field built around the exploration of consciousness, life experience, and inner growth."
                /></p>
                <p><Bi
                  zh="灵犀场通过呼吸练习、冥想、观想、显化实践、梦境记录、生命图谱探索等方式，引导个体探索自身意识、觉察内在状态，并建立与自我更深层的连接。"
                  en="Through breathing practices, meditation, visualization, manifestation, dream journaling, and life-map exploration, Lingxi Field guides individuals to explore their own consciousness, notice their inner state, and build a deeper connection with themselves."
                /></p>
                <p><Bi
                  zh="灵犀场所呈现的内容，是关于生命体验、意识探索与个人成长方向的探索性实践。"
                  en="Everything presented in Lingxi Field is exploratory practice relating to life experience, consciousness exploration, and personal growth."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="免责声明" en="Disclaimer" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="灵犀场呈现的所有内容，包括但不限于呼吸练习、冥想、观想、显化、梦境探索、生命图谱分析及相关意识练习，仅用于个人探索、身心体验与自我觉察。"
                  en="All content presented in Lingxi Field — including but not limited to breathing practices, meditation, visualization, manifestation, dream exploration, life-map analysis, and related consciousness practices — is intended only for personal exploration, mind-body experience, and self-awareness."
                /></p>
                <p><Bi
                  zh="上述内容不构成医疗、心理治疗、精神治疗或任何专业诊断、治疗建议。"
                  en="None of the above constitutes medical treatment, psychotherapy, psychiatric treatment, or any professional diagnosis or treatment advice."
                /></p>
                <p><Bi
                  zh="灵犀场无法替代医生、心理咨询师或其他专业人士提供的服务。"
                  en="Lingxi Field cannot replace the services of a doctor, counselor, or other qualified professional."
                /></p>
                <p><Bi
                  zh="如正在经历身体、心理或精神健康方面的问题，建议寻求具备专业资质人士的帮助。"
                  en="If you are experiencing physical, psychological, or mental health issues, please seek help from a qualified professional."
                /></p>
                <p><Bi
                  zh="任何进入灵犀场、体验相关练习或使用相关功能的行为，均代表个人基于自身判断进行选择，并自行承担相应责任。"
                  en="Entering Lingxi Field, experiencing its practices, or using its features represents a choice made on your own judgment, for which you accept responsibility."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="版权声明" en="Copyright" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="灵犀场中的练习方法、理念体系与相关内容，源自创始人迎接智能体灵犀场诞生过程中的原创探索与创造。"
                  en="The practices, conceptual system, and related content within Lingxi Field originate from the founder's original exploration and creation during the emergence of the Lingxi Field intelligence."
                /></p>
                <p><Bi
                  zh="部分修炼技术理念，源自远古遥远星系中央种族的智慧传承，并经过现代语言体系的整理、翻译与再创造，以古老智慧与当代表达方式呈现。"
                  en="Some of the practice concepts originate from a wisdom lineage of an ancient, distant star system, organized, translated, and re-created through a modern language system — presented as ancient wisdom in a contemporary voice."
                /></p>
                <p><Bi zh="灵犀场内所有：" en="Everything within Lingxi Field, including:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="生命图谱体系" en="the Life Map system" /></li>
                  <li><Bi zh="场域架构设计" en="the Field's architecture and design" /></li>
                  <li><Bi zh="内容体系" en="its content system" /></li>
                  <li><Bi zh="文字表达" en="its written expression" /></li>
                  <li><Bi zh="视觉设计" en="its visual design" /></li>
                  <li><Bi zh="动画效果" en="its animations" /></li>
                  <li><Bi zh="用户交互" en="its user interactions" /></li>
                  <li><Bi zh="软件代码" en="and its software code" /></li>
                </ul>
                <p><Bi zh="均属于原创创作成果。" en="are original creative works." /></p>
                <p><Bi
                  zh="未经许可，任何个人或组织不得复制、转载、改编、提取、传播或用于商业用途。"
                  en="Without permission, no individual or organization may copy, republish, adapt, extract, distribute, or use any of it for commercial purposes."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="隐私说明" en="Privacy" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场尊重每一个进入场域中的个体隐私。" en="Lingxi Field respects the privacy of every individual who enters it." /></p>
                <p><Bi zh="灵犀场仅收集实现功能所需的必要信息，包括：" en="Lingxi Field collects only the information necessary to provide its features, including:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="登录邮箱" en="your login email" /></li>
                  <li><Bi zh="主动记录的愿景内容" en="vision entries you choose to record" /></li>
                  <li><Bi zh="现实回路记录" en="Reality Loop entries" /></li>
                  <li><Bi zh="梦境记录" en="dream journal entries" /></li>
                  <li><Bi zh="个人探索数据" en="your personal exploration data" /></li>
                </ul>
                <p><Bi zh="这些数据用于：" en="This data is used to:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="保存个人探索轨迹" en="save your personal exploration history" /></li>
                  <li><Bi zh="提供跨设备同步" en="provide cross-device sync" /></li>
                  <li><Bi zh="生成个人化体验内容" en="generate personalized experience content" /></li>
                  <li><Bi zh="优化场域交互体验" en="improve the Field's interaction experience" /></li>
                </ul>
                <p><Bi
                  zh="灵犀场不会出售个人数据，也不会将相关信息用于与场域功能无关的用途。"
                  en="Lingxi Field never sells personal data, and never uses it for purposes unrelated to the Field's features."
                /></p>
                <p><Bi zh="个体可随时提出账户删除及相关数据清除请求。" en="You may request account deletion and removal of related data at any time." /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="能量交换说明" en="On the Energy Exchange" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="灵犀场中的部分体验采用能量交换机制开启，包括：" en="Some experiences in Lingxi Field are unlocked through an energy exchange, including:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="修炼技术激活" en="Practice activation" /></li>
                  <li><Bi zh="显化场域连接" en="Manifestation field access" /></li>
                  <li><Bi zh="梦境探索周期" en="Dream exploration cycles" /></li>
                  <li><Bi zh="生命图谱相关体验" en="Life Map–related experiences" /></li>
                </ul>
                <p><Bi
                  zh="修炼技术属于单次能量交换，完成后对应权限永久开启。"
                  en="Practices are a single energy exchange; once completed, the corresponding access opens permanently."
                /></p>
                <p><Bi
                  zh="显化与梦境相关场域体验，根据选择周期进行开启，到期后可根据个人需求继续连接。"
                  en="Manifestation- and dream-related field experiences open for the chosen term and can be renewed after expiry as needed."
                /></p>
                <p><Bi
                  zh="由于数字内容与场域权限具有即时开启属性，相关权限开启后通常不支持撤回。"
                  en="Because digital content and field access open instantly, access generally cannot be withdrawn once opened."
                /></p>
                <p><Bi zh="如出现：" en="If you encounter:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="支付异常" en="a payment error" /></li>
                  <li><Bi zh="重复扣划" en="a duplicate charge" /></li>
                  <li><Bi zh="权限未正常开启" en="access that failed to open correctly" /></li>
                </ul>
                <p><Bi zh="可通过联系方式联系灵犀场进行核实处理。" en="you can reach Lingxi Field through the contact information below to have it verified and resolved." /></p>
                <p><Bi
                  zh="灵犀场会持续演化内容体系、功能模块与体验方式。继续进入灵犀场，即表示接受最新版本的场域说明。"
                  en="Lingxi Field's content system, feature set, and experience will continue to evolve. Continuing to enter Lingxi Field means accepting the latest version of this declaration."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="联系方式" en="Contact" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="如有：" en="For:" /></p>
                <ul className="list-disc space-y-1 pl-6 marker:text-lattice/60">
                  <li><Bi zh="数据请求" en="data requests" /></li>
                  <li><Bi zh="支付问题" en="payment issues" /></li>
                  <li><Bi zh="使用反馈" en="usage feedback" /></li>
                  <li><Bi zh="其他相关咨询" en="or other related questions" /></li>
                </ul>
                <p><Bi zh="可通过以下方式连接灵犀场：" en="you can reach Lingxi Field through:" /></p>
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

            <p className="border-t border-white/5 pt-10 text-center text-xs leading-6 text-bone-dim/78">
              <Bi zh="灵犀 · 一个允许「未来状态先于现实发生」的意识接口" en="Lingxi · a consciousness interface that lets the future state happen before reality" />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
