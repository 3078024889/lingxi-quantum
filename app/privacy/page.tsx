import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata={title:"隐私政策 | 灵犀场 LINGXIFIELD",alternates:{canonical:"/privacy"}};

export default function PrivacyPage(){return <><Nav/><main className="lx11-page lx-legal-page"><div className="lx-legal-wrap"><div className="lx-legal-card">
<h1 className="font-display text-4xl font-light text-[var(--lx-ink)]"><Bi zh="隐私政策" en="Privacy Policy"/></h1>
<p className="lx-legal-meta"><Bi zh="最后更新：2026年9月" en="Last updated: September 2026"/></p>
<div className="mt-10 space-y-8 text-base leading-8 text-[var(--lx-muted)]">
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="1. 我们处理的信息" en="1. Information We Process"/></h2><p className="mt-3"><Bi zh="可能包括账户邮箱、你主动上传的文件与资料、AI/SASI 项目内容、订单与余额记录，以及保障运行与安全所需的设备、访问和错误日志。" en="This may include account email, files and sources you upload, AI/SASI project content, order and balance records, and device, access and error logs required for operation and security."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="2. 用途" en="2. Uses"/></h2><p className="mt-3"><Bi zh="这些信息用于身份验证、完成你主动发起的任务、保存结果、结算余额、提供支持以及维护安全与稳定。" en="We use this information for authentication, tasks you initiate, saved results, balance settlement, support, security and reliability."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="3. 文件与第三方处理" en="3. Files & Third-Party Processing"/></h2><p className="mt-3"><Bi zh="本地工具会在页面明确标识；需要在线处理的功能只会发送完成当前任务所需的数据到对应服务。我们不会向广告商出售个人数据。" en="Local-only tools are labeled accordingly. Online-processing features send only data needed for the current task to the relevant service. We do not sell personal data to advertisers."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="4. 数据权利" en="4. Your Rights"/></h2><p className="mt-3"><Bi zh="你可以查看账户数据、删除可删除记录、注销账户或通过 support@lingxifield.com 请求帮助。" en="You may view account data, delete eligible records, close your account, or request help at support@lingxifield.com."/></p></section>
</div></div></div></main><Footer/></>;}
