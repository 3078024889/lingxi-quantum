import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import QianFlow from "./QianFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "灵犀生命印记 $9.9 | Lingxi Life Oracle | Lingxi",
  description: "先静心，连接场域，摇出属于你自己的三支签——来自六十甲子这套真实存在的古老历法周期，由你的命盘四柱确定，不是随机摇取。First be still, connect to the field, and draw your own three signs from the real Sixty Ganzhi cycle.",
  alternates: { canonical: "/qian" },
};

export default function QianPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <QianFlow />
      </main>
      <Footer />
    </>
  );
}
