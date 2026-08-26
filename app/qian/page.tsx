import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import QianFlow from "./QianFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const dynamic = "force-dynamic";

export const metadata = {
  // v286：标题里不写价格。价格改了要改代码，而且搜索引擎收录后
  // 会长期挂着旧价，对用户是误导。价格只在页面内展示，由 plans.ts 统一管。
  title: "灵犀生命灵签 | Lingxi Life Oracle | Lingxi",
  description: "以出生信息作为时间入口，将个人坐标映射进六十四枚生命原型库，从源流签、灵魂签与行者签三层展开读取。Map your time coordinates into 64 life archetypes through Source, Soul, and Wayfarer layers.",
  alternates: { canonical: "/qian" },
};

export default function QianPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/qian" />
        <div id="field-assessment"><QianFlow /></div>
      </main>
      <Footer />
    </>
  );
}
