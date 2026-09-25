import type { Metadata } from "next";
import TempMailWorkbench from "@/components/tools/TempMailWorkbench";
export const metadata:Metadata={title:"10分钟临时邮箱｜灵犀场",description:"即时生成临时邮箱，接收普通邮件、注册确认和验证码，支持自动刷新、复制邮箱与验证码、续时、销毁，以及登录后的11–100个批量生成与CSV导出。",alternates:{canonical:"/tools/temp-mail"}};
export default function Page(){return <main className="lx11-page"><div className="lx11-wrap py-10"><TempMailWorkbench/></div></main>}
