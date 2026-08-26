import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WealthFlow from "./WealthFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const metadata = {
  title: "财富创造地图 | 灵犀场 Wealth Creation Map | Lingxi Field",
  description:
    "沿着生命结构照见创造、行动、资源与价值流动的纹理，理解你的价值适合从哪里生长，又如何自然进入现实。Witness how your value grows and enters the world through your creative structure.",
  alternates: { canonical: "/wealth" },
};

export default function WealthPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/wealth" />
        <div id="field-assessment"><WealthFlow /></div>
      </main>
      <Footer />
    </>
  );
}
