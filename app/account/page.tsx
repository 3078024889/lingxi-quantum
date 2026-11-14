import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AccountClientShell from "./AccountClientShell";

export const dynamic = "force-static";
export const metadata = {
  title: "我的账户 | 灵犀场 LINGXIFIELD",
  robots: { index: false, follow: false }
};

export default function AccountPage() {
  return (
    <>
      <Nav />
      <main className="lx11-page">
        <section className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <AccountClientShell />
        </section>
      </main>
      <Footer />
    </>
  );
}
