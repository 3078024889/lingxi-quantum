import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";
import VideoAssembler from "../VideoAssembler";
export const metadata = { title: "镜头合成 · SASI", description: "选择已有镜头，在本机按顺序合成 MP4。" };
export default function AssemblePage() { return <><Nav/><main className="lx11-page bg-[#fafaff] px-4 py-10 text-[#242334]"><div className="mx-auto mb-6 max-w-3xl"><Link href="/sasi">← 返回创作工作台</Link></div><VideoAssembler /></main><Footer/></>; }
