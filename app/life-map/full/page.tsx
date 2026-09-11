import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的完整生命图谱 | 灵犀 · Lingxi",
  robots: { index: false, follow: false },
};

export default function FullLifeMapPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams?.id;
  redirect(id ? `/life-map?archive=${encodeURIComponent(id)}` : "/life-map");
}
