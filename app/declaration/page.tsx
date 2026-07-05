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
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="系统声明" en="System Declaration" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="关于灵犀" en="About Lingxi" />
          </h1>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-3xl space-y-14">
            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="免责声明" en="Disclaimer" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="灵犀提供的是灵性与身心练习内容（包括但不限于呼吸、冥想、观想、显化与梦境记录等），其目的在于支持个人的内在探索与意识成长。"
                  en="Lingxi offers spiritual and mind-body practices (including but not limited to breathing, meditation, visualization, manifestation, and dream journaling), intended to support personal inner exploration and the growth of consciousness."
                /></p>
                <p><Bi
                  zh="这些内容不构成医疗、心理或精神治疗，也不替代任何专业医疗诊断、治疗或建议。如你正经历身体或心理健康方面的困扰，请咨询有资质的专业人士。是否采用本站的任何练习，由你自行决定并自行承担相应责任。"
                  en="This content does not constitute medical, psychological, or psychiatric treatment, nor does it replace any professional diagnosis, treatment, or advice. If you are experiencing physical or mental health difficulties, please consult a qualified professional. Whether to adopt any practice on this site is your own decision and responsibility."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="版权声明" en="Copyright" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="本站练习方法与理念内容，源自创始人导师的原创作品及创始人本人的翻译与再创作，相关使用权归属本站所有。站内视觉、动画、界面与代码均为原创。"
                  en="The practices and ideas on this site derive from the original work of the founder's teacher and from the founder's own translation and re-creation; the associated rights of use belong to this site. All visuals, animations, interface, and code are original."
                /></p>
                <p><Bi
                  zh="未经许可，请勿擅自复制、转载或用于商业用途。"
                  en="Please do not copy, reproduce, or use for commercial purposes without permission."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="隐私说明" en="Privacy" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="我们仅收集为实现功能所必需的最少信息：你的登录邮箱，以及你主动写下的愿景、现实回路与梦境记录。这些数据安全存储于云端数据库，仅用于为你提供跨设备的同步与查看，不会出售或用于与功能无关的用途。"
                  en="We collect only the minimum necessary for the features to work: your login email, and the vision, reality-loop, and dream entries you choose to write. This data is stored securely in a cloud database, used only to provide you cross-device sync and access, and is never sold or used for unrelated purposes."
                /></p>
                <p><Bi
                  zh="你可随时联系我们删除你的账户与相关数据。"
                  en="You may contact us at any time to delete your account and related data."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="能量交换说明" en="On the Energy Exchange" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi
                  zh="修炼技术为单次能量交换、永久激活；显化与梦境解读为周期性场域，按所选周期开启，到期可续期，续期时间自动累加。"
                  en="Practices are a single energy exchange, activated permanently; Manifestation & Dream Interpretation is a periodic field, opened for the chosen term, renewable on expiry with time added automatically."
                /></p>
                <p><Bi
                  zh="能量交换完成后，场域将自动开启对应权限。由于数字内容与场域接入的特性，开启后一般不支持回退；如遇到账异常或重复扣划，请联系我们核实处理。"
                  en="Once the energy exchange completes, the corresponding access opens automatically. Given the nature of digital content and field access, it generally cannot be reversed after opening; if you encounter a crediting error or duplicate charge, please contact us to verify and resolve it."
                /></p>
                <p><Bi
                  zh="我们可能不时更新练习内容与场域功能。继续使用即表示你接受最新的说明。"
                  en="We may update practices and field features from time to time. Continued use means you accept the latest terms."
                /></p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-bone"><Bi zh="联系方式" en="Contact" /></h2>
              <div className="mt-5 space-y-4 text-base leading-9 text-bone-dim">
                <p><Bi zh="如有任何疑问、数据请求或支付问题，欢迎通过以下方式联系：" en="For any questions, data requests, or payment issues, reach us at:" /></p>
                <a
                  href="https://x.com/lingxinqs?s=11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm border border-lattice/40 px-6 py-3 font-display text-sm tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"
                >
                  X（Twitter）· @lingxinqs
                </a>
              </div>
            </div>

            <p className="border-t border-white/5 pt-10 text-center text-xs leading-6 text-bone-dim/50">
              <Bi zh="灵犀 · 一个允许「未来状态先于现实发生」的意识接口" en="Lingxi · a consciousness interface that lets the future state happen before reality" />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
