import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "探索 · 显化 / 解梦 / 灵性体系全指南",
  description:
    "灵犀的原创内容中心：显化方法与心态、解梦与梦境象征、意识与灵性成长。中英双语，含核心术语表。Manifestation, dreams, and spiritual growth — bilingual guides.",
  alternates: { canonical: "/learn" },
};

type Item = { href: string; zh: string; en: string };
type Group = { zh: string; en: string; items: Item[] };

const groups: Group[] = [
  {
    zh: "显化", en: "Manifestation",
    items: [
      { href: "/learn/manifestation", zh: "什么是显化，以及如何真正显化", en: "What manifestation is, and how to do it" },
      { href: "/learn/manifestation-methods", zh: "显化方法大全：369法、观想、写下与睡前显化", en: "Manifestation methods: 369, visualization, scripting" },
      { href: "/learn/manifestation-not-working", zh: "显化没效果？原因与修正", en: "Manifestation not working? Why and how to fix it" },
      { href: "/learn/manifestation-signs", zh: "显化正在生效的 7 个征兆", en: "7 signs your manifestation is working" },
      { href: "/learn/manifestation-journal", zh: "显化日记怎么写", en: "How to keep a manifestation journal" },
      { href: "/learn/manifest-money", zh: "如何显化金钱与财富", en: "How to manifest money and abundance" },
      { href: "/learn/manifest-love", zh: "如何显化爱情与理想伴侣", en: "How to manifest love and an ideal partner" },
      { href: "/learn/method-369", zh: "369 显化法怎么做", en: "The 369 method: steps & how it works" },
      { href: "/learn/affirmations", zh: "肯定语怎么用才有效", en: "How to use affirmations effectively" },
      { href: "/learn/manifest-person", zh: "如何显化一个人或一段关系", en: "How to manifest a person or relationship" },
      { href: "/learn/moon-manifestation", zh: "新月显化与满月释放", en: "New moon manifesting & full moon releasing" },
      { href: "/learn/law-of-attraction-vs", zh: "显化和吸引力法则的区别", en: "Manifestation vs. the law of attraction" },
      { href: "/learn/subconscious-power", zh: "潜意识的力量：墨菲的方法", en: "The power of the subconscious: Murphy's method" },
    ],
  },
  {
    zh: "解梦", en: "Dreams",
    items: [
      { href: "/learn/dream", zh: "如何解梦：读懂潜意识写给你的信", en: "How to interpret dreams" },
      { href: "/learn/dream-symbols", zh: "常见梦境象征大全", en: "A guide to common dream symbols" },
      { href: "/learn/more-dream-meanings", zh: "更多常见梦境含义：怀孕、水、火、掉头发…", en: "More common dream meanings" },
      { href: "/learn/recurring-dreams", zh: "为什么反复做同一个梦", en: "Why you keep having the same dream" },
      { href: "/learn/dream-same-person", zh: "总是梦见同一个人，是他在想我吗", en: "Dreaming of the same person" },
      { href: "/learn/lucid-dreaming", zh: "清醒梦怎么做：入门指南", en: "How to lucid dream" },
      { href: "/learn/remember-dreams", zh: "为什么记不住梦，怎么改善", en: "Why you can't remember dreams" },
      { href: "/learn/sleep-paralysis", zh: "鬼压床（睡眠瘫痪）是什么", en: "What is sleep paralysis" },
      { href: "/learn/dreams-premonition", zh: "梦是预兆吗？梦能预知未来吗", en: "Are dreams premonitions?" },
    ],
  },
  {
    zh: "灵性与修炼", en: "Spirit & Practice",
    items: [
      { href: "/learn/wingmakers", zh: "主权与完整：灵犀修炼体系的思路", en: "Sovereignty & Wholeness: The Thinking Behind the Practices" },
      { href: "/learn/higher-self", zh: "什么是高我？如何与高我连接", en: "What is the higher self, and how to connect" },
      { href: "/learn/how-to-meditate", zh: "如何冥想：新手入门指南", en: "How to meditate: a beginner's guide" },
      { href: "/learn/raise-frequency", zh: "如何提升意识频率", en: "How to raise your frequency" },
      { href: "/learn/chakras", zh: "七脉轮入门：含义与平衡", en: "The seven chakras" },
      { href: "/learn/synchronicity", zh: "共时性是什么？有意义的巧合", en: "What is synchronicity" },
      { href: "/learn/awakening", zh: "什么是灵性觉醒？", en: "What is spiritual awakening" },
      { href: "/learn/twin-flame", zh: "双生火焰与灵魂伴侣的区别", en: "Twin flames & soulmates" },
      { href: "/learn/inner-friction", zh: "精神内耗怎么停下来", en: "End inner friction" },
      { href: "/learn/what-is-consciousness", zh: "什么是意识", en: "What is consciousness" },
      { href: "/learn/letting-go", zh: "放不下一个人怎么办", en: "When you can't let someone go" },
      { href: "/learn/angel-numbers", zh: "总是看到 11:11？重复数字的含义", en: "Seeing 11:11? Repeating numbers" },
      { href: "/learn/emptiness", zh: "总觉得人生没有意义，怎么办", en: "When life feels meaningless" },
      { href: "/learn/energy-drain", zh: "和某些人相处特别累，是怎么回事", en: "Why some people leave you drained" },
      { href: "/glossary", zh: "术语表 · 核心词汇", en: "Glossary · core terms" },
    ],
  },
];

export default function LearnHub() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">探索 · Explore</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="显化、解梦、与本源体系" en="Manifestation, Dreams, and the Source System" />
          </h1>
          <p className="mt-6 text-lg leading-9 text-bone-dim">
            <Bi
              zh="灵犀的原创内容中心——把显化、解梦与灵性成长，讲成清晰、可落地、中英双语的语言。"
              en="The original-content center of Lingxi — manifestation, dream work, and spiritual growth, in clear and practical bilingual language."
            />
          </p>

          {groups.map((g) => (
            <section key={g.en} className="mt-14">
              <h2 className="font-display text-2xl font-light text-amber"><Bi zh={g.zh} en={g.en} /></h2>
              <div className="bg-void-deep mt-5 divide-y divide-[color:var(--aurora-glass-border)] rounded-sm px-5">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} className="flex items-baseline justify-between gap-4 py-4 transition hover:text-lattice">
                    <span className="text-base leading-7 text-bone"><Bi zh={it.zh} en={it.en} /></span>
                    <span className="shrink-0 text-lattice">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
