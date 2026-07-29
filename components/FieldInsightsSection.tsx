import Link from "next/link";
import Bi from "./Bi";

// 场域精测——首页新增区块，列出全部8个测试产品，每个都配一句具体的
// "获得什么"，不是笼统的"权益包含"，让人在点进去、甚至在付费之前，
// 就清楚知道自己会得到什么。
const ITEMS = [
  { href: "/life-map", zh: "生命图谱", en: "Life Map", getZh: "五套真实系统交叉解读的完整命盘档案", getEn: "A full chart, cross-read across five real systems" },
  { href: "/relationship", zh: "关系共振", en: "Relationship Resonance", getZh: "两份命盘的十项生命向量对照", getEn: "Ten life-vector dimensions compared across two charts" },
  { href: "/qian", zh: "灵犀生命灵签", en: "Lingxi Life Oracle", getZh: "三重生命原型的完整解读档案", getEn: "A full reading across three life archetype layers" },
  { href: "/tarot", zh: "灵犀量子塔罗", en: "Lingxi Quantum Tarot", getZh: "三张生命镜像牌的完整生命镜像档案", getEn: "A full life-mirror reading from three cards" },
  { href: "/resilience", zh: "生命韧性指数", en: "Life Resilience Index", getZh: "五项确定性分数，看清你的韧性类型", getEn: "Five deterministic scores, mapping your resilience type" },
  { href: "/romance", zh: "桃花磁场测试", en: "Romance Magnetism", getZh: "你的吸引力风格与磁场分数，即时呈现", getEn: "Your attraction style and magnetism score, shown right away" },
  { href: "/wealth", zh: "财富创造地图", en: "Wealth Creation Map", getZh: "五个创造维度分数与你的创造类型，即时呈现", getEn: "Five creation dimension scores and your creation type, shown right away" },
  { href: "/daily", zh: "今日运势潮汐", en: "Daily Fortune Tide", getZh: "今日星象落在你太阳星座上的样子，即时呈现", getEn: "How today's sky lands on your Sun sign, shown right away" },
];

export default function FieldInsightsSection() {
  return (
    <section className="border-t border-white/5 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="bg-void-deep mx-auto max-w-2xl rounded-sm px-8 py-10 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="场域精测" en="Field Insights" />
          </p>
          <h2 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="探索你的生命不同维度" en="Explore the Different Dimensions of Your Life" />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-bone-dim">
            <Bi
              zh="每个人，都拥有一套独特的生命结构。关系、财富、情感、潜意识、灵魂、成长……这些不同维度，共同组成了你正在经历的现实。灵犀场精测，不是为了给你一个固定答案，而是通过不同入口，让你从不同角度看见：此刻的自己，正在怎样与生命互动。选择一个方向，开启一次属于你的意识探索。"
              en="Every person carries a unique life structure. Relationships, wealth, emotion, the subconscious, the soul, growth — these different dimensions together make up the reality you're living through. Field Insights isn't here to give you one fixed answer. It offers different entrances, so you can see, from different angles, how the self of this moment is interacting with life. Choose a direction, and begin an exploration that's your own."
            />
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group rounded-sm border border-white/10 bg-void-deep p-6 transition hover:border-lattice/50"
            >
              <h3 className="font-display text-lg text-bone transition group-hover:text-lattice">
                <Bi zh={it.zh} en={it.en} />
              </h3>
              <p className="mt-2 text-sm leading-6 text-bone-dim">
                <Bi zh={it.getZh} en={it.getEn} />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
