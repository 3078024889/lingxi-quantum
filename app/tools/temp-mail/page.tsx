import type { Metadata } from "next";
import TempMailWorkbench from "@/components/tools/TempMailWorkbench";

export const metadata:Metadata={
 title:"临时邮箱｜灵犀场 LINGXIFIELD",
 description:"即时生成临时邮箱，自动接收验证码和注册确认；支持续时、自动恢复、多邮箱管理，以及登录后的付费批量生成。",
 alternates:{canonical:"/tools/temp-mail"},
};

export default function Page(){
 return <main className="lx11-page"><div className="lx11-wrap py-10"><TempMailWorkbench/></div></main>;
}
