import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RomanceFlow from "./RomanceFlow";

export const metadata = {
  title: "桃花磁场测试 · 免费 | 灵犀 Romance Magnetism Index — Free Test | Lingxi",
  description:
    "从真实出生数据算出桃花磁场分数、吸引力风格，核对命理古法「命带桃花」标记。免费、即时、无需登录。Free instant test: romance magnetism score, attraction style, and a classical Peach Blossom chart check.",
  alternates: { canonical: "/romance" },
};

export default function RomancePage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <RomanceFlow />
      </main>
      <Footer />
    </>
  );
}
