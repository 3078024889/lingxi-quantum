import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LifeMapFlow from "./LifeMapFlow";

export const metadata = {
  title: "生命频率测试 · 生成你的个人意识图谱 | 灵犀 · Lingxi Life Frequency Map",
  description:
    "输入你的出生信息，生成一份属于你的生命频率档案——观察你的内在模式、关系模式、财富模式与成长方向。不是命运预言，是一份自我探索的参考。Discover your Lingxi Life Frequency Map.",
  alternates: { canonical: "/life-map" },
};

export default function LifeMapPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <LifeMapFlow />
      </main>
      <Footer />
    </>
  );
}
