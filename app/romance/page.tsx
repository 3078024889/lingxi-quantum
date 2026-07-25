import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RomanceFlow from "./RomanceFlow";

export const metadata = {
  title: "桃花磁场测试 | 灵犀场 Romance Magnetism Index | Lingxi Field",
  description:
    "从真实出生数据算出桃花磁场分数、吸引力风格，核对命理古法「命带桃花」标记，即时呈现，无需登录。Romance magnetism score, attraction style, and a classical Peach Blossom chart check, shown right away.",
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
