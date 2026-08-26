import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RomanceFlow from "./RomanceFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const metadata = {
  title: "桃花磁场指数 | 灵犀场 Romance Resonance Index | Lingxi Field",
  description:
    "沿着你的生命结构，照见吸引、靠近与关系感知的磁场纹理。Explore attraction, approach, and relational perception through your life structure.",
  alternates: { canonical: "/romance" },
};

export default function RomancePage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/romance" />
        <div id="field-assessment"><RomanceFlow /></div>
      </main>
      <Footer />
    </>
  );
}
