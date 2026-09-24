import type { Metadata } from "next";
import BurnAfterReadWorkbench from "@/components/tools/BurnAfterReadWorkbench";
export const metadata:Metadata={title:"阅后即焚｜灵犀场",description:"在浏览器加密敏感文本并生成一次性链接，首次读取后立即销毁。",alternates:{canonical:"/tools/burn-after-read"}};
export default function Page(){return <main className="lx11-page"><div className="lx11-wrap py-10"><BurnAfterReadWorkbench/></div></main>}
