import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RelationshipReportView from "./RelationshipReportView";

export const metadata = { title: "关系共振图谱 | 灵犀 · Relationship Resonance Map | Lingxi" };

export default function RelationshipFullPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id;
  return (
    <>
      <Nav />
      <main className="pt-24">
        {id ? (
          <RelationshipReportView id={id} />
        ) : (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <p className="text-sm text-rose">缺少报告 ID。</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
