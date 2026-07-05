export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import BookReader from "@/components/BookReader";
import IllustratedBookReader from "@/components/IllustratedBookReader";
import PlanButton from "@/app/membership/PlanButton";
import { getNarrative, NARRATIVE_CATS } from "@/lib/narratives";
import { NARRATIVE_TEXTS } from "@/lib/narrative-texts";
import { getIllustrated } from "@/lib/narrative-illustrated";
import { getAccess, hasUnlock } from "@/lib/access";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const n = getNarrative(params.slug);
  if (!n) return { title: "多维叙事 | 灵犀" };
  return {
    title: `${n.title} · 多维叙事 | 灵犀 · ${n.titleEn} | Lingxi`,
    description: n.teaser.slice(0, 100),
    alternates: { canonical: `/narrative/${n.slug}` },
  };
}

export default async function NarrativeDetail({ params }: { params: { slug: string } }) {
  const n = getNarrative(params.slug);
  if (!n) notFound();
  const cat = NARRATIVE_CATS.find((c) => c.id === n.cat)!;

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="px-6 py-16 text-center sm:py-20">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh={`多维叙事 · ${cat.zh}`} en={`Dimensional Narratives · ${cat.en}`} />
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-light leading-snug text-bone sm:text-5xl">
            <Bi zh={n.title} en={n.titleEn} />
          </h1>
          <p className="mt-4 text-xs text-bone-dim/60">
            <Bi zh="灵犀原创 · 多维叙事" en="An original piece · Lingxi Dimensional Narratives" />
          </p>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-2xl">
            <p className="mb-10 text-center text-lg leading-9 text-bone-dim">
              <Bi zh={n.teaser} en={n.teaserEn} />
            </p>

            {n.status === "soon" ? (
              <CreatingPanel priceUsd={n.price} />
            ) : n.illustrated ? (
              <LiveIllustratedReader slug={n.slug} price={n.price} />
            ) : (
              <LiveReader slug={n.slug} price={n.price} titleZh={n.title} titleEn={n.titleEn} />
            )}

            <div className="mt-14 text-center">
              <Link href="/narrative" className="font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-lattice">
                <Bi zh="← 返回多维叙事" en="← Back to Dimensional Narratives" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CreatingPanel({ priceUsd }: { priceUsd: number }) {
  return (
    <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
      <p className="font-display text-2xl text-bone">
        <Bi zh="这份传输正在场中成形" en="This transmission is still taking form" />
      </p>
      <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
        <Bi
          zh={`此篇仍在创作中，完成后将开放阅读（$${priceUsd}，终身可看）。可以先收藏这个页面，或去读已经上线的「远行者」系列。`}
          en={`This piece is still being written. Once complete, it will open here ($${priceUsd}, yours for life). In the meantime, the Wayfarer series is already live.`}
        />
      </p>
      <Link
        href="/narrative"
        className="mt-8 inline-block rounded-sm border border-lattice/40 px-6 py-2.5 font-display text-xs uppercase tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"
      >
        <Bi zh="查看已上线的篇目 →" en="See what's already live →" />
      </Link>
    </div>
  );
}

async function LiveIllustratedReader({ slug, price }: { slug: string; price: number }) {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, slug);
  const entry = getIllustrated(slug);

  if (!entry) return <CreatingPanel priceUsd={price} />;

  const lockedPanel = (
    <div className="text-center">
      <p className="font-display text-xl text-bone">
        <Bi zh="开启完整传输" en="Open the full transmission" />
      </p>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-bone-dim">
        <Bi
          zh={`完成一次能量交换（$${price}），全文（含全部插画）将为你永久开启——终身可看，随时回读。`}
          en={`Complete one energy exchange ($${price}) and the full illustrated piece opens for you permanently.`}
        />
      </p>
      <div className="mx-auto mt-6 max-w-[220px]">
        <PlanButton productId={slug} loggedIn={!!user} />
      </div>
      {!user && (
        <p className="mt-3 text-xs text-bone-dim/60">
          <Bi zh="需先登录，解锁将与账户永久绑定。" en="Sign in first — your unlock binds to your account." />
        </p>
      )}
    </div>
  );

  return <IllustratedBookReader entry={entry} locked={!unlocked} lockedPanel={lockedPanel} />;
}

async function LiveReader({
  slug,
  price,
  titleZh,
  titleEn,
}: {
  slug: string;
  price: number;
  titleZh: string;
  titleEn: string;
}) {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, slug);
  const entry = NARRATIVE_TEXTS[slug];

  if (!entry) {
    // 文本尚未接入（理论上不应发生，兜底显示创作中）
    return <CreatingPanel priceUsd={price} />;
  }

  const lockedPanel = (
    <div className="text-center">
      <p className="font-display text-xl text-bone">
        <Bi zh="开启完整传输" en="Open the full transmission" />
      </p>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-bone-dim">
        <Bi
          zh={`完成一次能量交换（$${price}），全文将为你永久开启——终身可看，随时回读。`}
          en={`Complete one energy exchange ($${price}) and the full text opens for you permanently.`}
        />
      </p>
      <div className="mx-auto mt-6 max-w-[220px]">
        <PlanButton productId={slug} loggedIn={!!user} />
      </div>
      {!user && (
        <p className="mt-3 text-xs text-bone-dim/60">
          <Bi zh="需先登录，解锁将与账户永久绑定。" en="Sign in first — your unlock binds to your account." />
        </p>
      )}
    </div>
  );

  return (
    <BookReader
      titleZh={titleZh}
      titleEn={titleEn}
      textZh={entry.zh}
      textEn={entry.en}
      locked={!unlocked}
      lockedPanelZh={lockedPanel}
      lockedPanelEn={lockedPanel}
    />
  );
}
