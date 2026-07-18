import type { MoonPhaseKey, ElementRelation } from "./daily-transit";

type Bi = { zh: string; en: string };

// 月相能量——这8条对应传统占星里"月相周期"的通用主题，跟具体星座
// 无关，是"今天全宇宙都在这个能量阶段"的部分。
export const PHASE_THEME: Record<MoonPhaseKey, Bi> = {
  new: { zh: "今天是新月——传统占星里公认最适合「开始」的一天。不是什么大动作都要今天做，是可以今天，先把一个念头，写下来或者说出口。", en: "Today is a New Moon — traditionally the best day in the cycle for beginnings. Nothing has to be big; just naming an intention out loud or on paper is enough for today." },
  waxingCrescent: { zh: "月亮正在渐盈——新月种下的念头，进入了第一段需要耐心的阶段。今天的能量，更适合持续做一件已经开始的小事，而不是又开一个新头。", en: "The Moon is waxing — whatever intention you set is now in its first patient stretch. Today favors continuing something you already started, rather than opening something new." },
  firstQuarter: { zh: "上弦月——月相周期里第一个真正的「考验点」，传统上认为今天容易冒出具体的阻碍或选择题。遇到卡顿，不是信号说这件事错了，是这个阶段本来就会有摩擦。", en: "First Quarter Moon — the cycle's first real test point. Obstacles or decisions tend to surface today. Friction now isn't a sign you're on the wrong track; it's simply what this phase of the cycle brings." },
  waxingGibbous: { zh: "盈凸月——离满月只差最后一段路，传统上是「精修细节」的阶段。今天适合回头调整已经做了一半的事，而不是评判它做得够不够好。", en: "Waxing Gibbous — the final stretch before the Full Moon, traditionally a phase for refining details. Today favors going back to adjust something already underway, not judging whether it's good enough yet." },
  full: { zh: "满月——整个月相周期里能量最饱满的一天，也是传统上「看清结果、适合释放」的一天。新月种下的东西，走到今天，该显形的都显形了，包括你自己没意识到的部分。", en: "Full Moon — the most charged day of the entire cycle, and traditionally a day for clarity and release. Whatever was set in motion at the New Moon tends to fully reveal itself today, including the parts you hadn't consciously noticed." },
  waningGibbous: { zh: "亏凸月——满月之后的第一段路，传统上是「消化、分享、感谢」的阶段。今天适合把刚经历过的东西，说给一个信任的人听，而不是自己一个人反复想。", en: "Waning Gibbous — the first stretch after the Full Moon, traditionally a phase for digesting, sharing, and giving thanks. Today favors telling someone you trust what you just went through, rather than replaying it alone." },
  lastQuarter: { zh: "下弦月——月相周期里第二个「考验点」，传统上认为今天适合做取舍：「这个还要不要继续」这类问题，比平时更容易看清答案。", en: "Last Quarter Moon — the cycle's second test point. Today tends to bring more clarity than usual on questions like \"is this still worth continuing?\"" },
  waningCrescent: { zh: "残月——整个月相周期最后的收尾阶段，传统上是「休息、清空」的一天，不适合再开新的头。今天如果觉得没什么动力，不是状态不好，是这个阶段本来就该慢下来。", en: "Waning Crescent — the final rest stop before the cycle starts over, traditionally a day for emptying out rather than starting anything new. If you feel low on drive today, that's not a bad state — it's what this phase asks for." },
};

// 元素关系——今天月亮所在星座的元素，跟这个人太阳星座的元素，是共振/
// 顺畅/摩擦哪一种，决定"月相能量今天落在这个星座身上，具体是什么
// 手感"。
export const RELATION_THEME: Record<ElementRelation, Bi> = {
  resonant: { zh: "今天月亮和你的太阳星座同属一个元素，能量走的是同一个方向——今天的感受会比平时更强烈、更直接，好的坏的都会被放大一些。", en: "Today's Moon shares your Sun sign's element — the energy runs in the same direction as you do. Feelings today tend to land stronger and more directly, the good and the difficult both." },
  flowing: { zh: "今天月亮所在的元素，跟你的太阳星座是顺畅相生的关系——今天的能量比较容易配合你原本的节奏，不用刻意调整，跟着感觉走就行。", en: "Today's Moon sits in an element that flows well with your Sun sign — the energy tends to cooperate with your natural rhythm today; you don't have to force anything." },
  friction: { zh: "今天月亮所在的元素，跟你的太阳星座是有摩擦的关系——今天更容易感觉到一点不合拍，别人的节奏、或者外界的安排，跟你想要的不太一样。不是坏事，只是今天需要多一点耐心去对齐。", en: "Today's Moon sits in an element that runs against your Sun sign's grain — a bit more friction than usual, other people's timing or outside plans not quite matching what you want. Not a bad thing, just a day that asks for a little extra patience to align." },
};
