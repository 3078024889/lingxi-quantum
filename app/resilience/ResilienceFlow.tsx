"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
import WhyTrustLingxi from "@/components/WhyTrustLingxi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import ShareButton from "@/components/ShareButton";

const RESILIENCE_FAQ: BilingualFaqItem[] = [
  {
    qZh: "生命韧性指数的五项分数是如何形成的？", qEn: "How do the five Life Resilience scores form?",
    aZh: "生命韧性指数，并不是评判一个人「够不够坚强」。每个人面对变化、压力与人生转折时，都拥有不同的内在恢复方式，灵犀场会结合你的出生信息所对应的生命结构节点，展开五个维度的观察：压力恢复（你如何从消耗状态重新回到平衡）、变化适应（面对未知环境时，你如何调整自己的节奏）、危机反弹（在低谷与挑战中，你如何重新启动自己的力量）、长期坚持（你如何维持方向、持续完成重要目标）、精神稳定（你如何保持内在中心，不被外界完全牵引）。这些维度不是给你贴标签，更像一张「生命恢复地图」——原来你的力量一直存在，只是过去没有用正确的方式连接它。",
    aEn: "The Life Resilience Index doesn't judge whether someone is 'strong enough.' Everyone has a different way of recovering internally when facing change, pressure, or turning points. Lingxi Field draws on the life-structure nodes tied to your birth information to open five dimensions of observation: stress recovery (how you return to balance from depletion), adaptability (how you adjust your rhythm in unfamiliar territory), crisis rebound (how you reignite your own force in the middle of a low point), persistence (how you hold direction and see important goals through), and emotional stability (how you keep your inner center without being fully pulled by outside forces). These dimensions aren't labels — they're closer to a 'recovery map' of your life, showing that your strength was there all along, just not yet connected to in the right way.",
  },
  {
    qZh: "生命韧性指数需要开启完整探索吗？", qEn: "Do I need to open the full exploration for the Resilience Index?",
    aZh: "生命韧性指数是一处独立的自我观察入口，进入后就能快速看见自己的韧性结构：哪些能力已经自然形成，哪些部分值得更多关注，你的系统习惯如何面对人生波动。它不要求你成为另一个人，只是帮助你更了解自己本来就是如何恢复的。",
    aEn: "The Life Resilience Index is a standalone entrance for self-observation — once you enter, you quickly see your own resilience structure: which capacities have already formed naturally, which parts deserve more attention, and how your system habitually meets life's turbulence. It doesn't ask you to become someone else — it just helps you understand how you already recover.",
  },
  {
    qZh: "韧性分数低是不是代表这个人不坚强？", qEn: "Does a low resilience score mean someone isn't strong?",
    aZh: "不是。灵犀场从不使用「强者」和「弱者」这样的判断。有些人的力量来自快速行动，有些人的力量来自深度思考，有些人的力量来自长期积累——某一个维度较低，不代表缺少能力，可能只是说明你的生命系统更适合通过另一种方式恢复。真正的成长，不是把自己变成别人，而是学会使用自己已经拥有的力量。",
    aEn: "No. Lingxi Field never uses judgments like 'strong' or 'weak.' Some people's strength comes from fast action, some from deep thought, some from long accumulation. A lower score in one dimension doesn't mean a lack of capacity — it may simply mean your system recovers better through a different route. Real growth isn't becoming someone else. It's learning to use the strength you already have.",
  },
];



type Result = {
  score: number;
  breakdown: Record<string, number>;
  sunSignZh: string; sunSignEn: string;
  dayMasterElement: string;
};

const DIM_LABEL: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "压力恢复能力", en: "Stress Recovery" },
  adaptability: { zh: "变化适应能力", en: "Adaptability" },
  crisisRebound: { zh: "危机反弹能力", en: "Crisis Rebound" },
  persistence: { zh: "长期坚持能力", en: "Persistence" },
  emotionalStability: { zh: "精神稳定能力", en: "Emotional Stability" },
};

const DIM_ORDER = ["stressRecovery", "adaptability", "crisisRebound", "persistence", "emotionalStability"];
const DIM_COLOR: Record<string, string> = {
  stressRecovery: "#FF8FD1", adaptability: "#5FE8FF", crisisRebound: "#FFCB61",
  persistence: "#7FE7C4", emotionalStability: "#D8CDFF",
};

// 叙事文案跟接口计算逻辑一样，是同一份来源（lib/resilience-narrative.ts）——
// 这里为了避免把整套astronomy-engine/lunar-javascript计算逻辑打进客户端
// 打包体积，前端不直接 import 那个文件，而是把同样的四段模板复制一份轻量
// 纯文本版本在这里，用来渲染结果。两边的文案，改动时要记得同步。
const OVERALL: Record<0 | 1 | 2 | 3, { zh: string; en: string }> = {
  0: { zh: "你现在的韧性，还没有形成一套属于自己的固定路径——遇到麻烦，你几乎每次都要重新想一遍该怎么应付，很少有一条现成的路可以直接走。这不是因为你不够坚强，是因为你消耗精力的方式，一直是「临场想办法」，不是「调用已经攒下的经验」。真正让人累的，往往不是某一件具体的事，是「每次都要重新来一遍」这件事本身。下一次卡壳时，先别急着解决问题——花两分钟写下「上一次类似的情况，我是怎么走出来的」，哪怕只想起一次，也是在给自己攒第一条可以重复用的路。", en: "Your resilience hasn't settled into a repeatable path yet — when trouble hits, you're almost always improvising from scratch, rarely following a route you've already worn in. That's not a lack of strength; your energy keeps going toward figuring it out live, not toward drawing on experience you've already banked. What wears you down usually isn't the specific problem — it's having to start over every time. Next time you're stuck, don't rush to solve it. Spend two minutes writing down how you got through something similar before. Even one memory is the start of a path you can actually reuse." },
  1: { zh: "你的韧性，已经有几块地方是站得住的——某些类型的麻烦，你其实处理得不错，只是这些「站得住的部分」，彼此之间还没连成一条线。单独一件事，你扛得住；两三件事叠在一起，系统就开始吃紧，不是因为承受力不够，是因为每一块「站得住」都还是孤立的，没有互相支援。留意一下：你已经处理得比较好的那类事情，具体是靠什么撑过去的？把那个具体的方法，试着套用到你现在觉得吃力的地方——这比重新发明一套办法更快。", en: "Some parts of your resilience already hold — certain kinds of trouble, you actually handle well. The problem is those solid parts haven't connected into a single line yet. One thing at a time, you're fine; two or three stacked together, and the system starts straining — not from lack of capacity, but because each solid part is still working alone. Notice what you're already handling well, and how — the specific method, not just the outcome. Try applying that same method to whatever feels hardest right now. That's faster than inventing a new approach from zero." },
  2: { zh: "你的韧性，整体是稳的——这也是问题所在：正因为大部分时候你都扛得住，你很容易忘记「扛住」本身是有代价的，把「没垮」当成「没事」。真正的风险不是某一次冲击太大，是你把恢复这件事，一次又一次地往后推，因为眼下总有更紧急的事。你可以撑过去，不代表撑过去之后，那部分消耗真的被还清了。下一次顺利扛过一件事之后，具体留出一段时间——不是「有空再说」，是写进日程里——去做一件纯粹为了恢复、跟解决问题无关的事。", en: "Your resilience is generally solid — which is exactly the trap: because you can absorb most things, it's easy to mistake \"didn't collapse\" for \"nothing happened.\" The real risk isn't one blow being too big — it's that you keep postponing recovery because something more urgent always comes up. Being able to push through doesn't mean the cost gets paid back. Next time you get through something cleanly, block out actual time — not \"whenever,\" but on the calendar — for something that's purely about recovering, unrelated to solving the next problem." },
  3: { zh: "你的韧性结构，属于比较强的一类——不是你不会脆弱，是脆弱之后，有一套你自己可能都没完全意识到的机制，会把你重新拼回一个能站起来的状态，速度比大多数人快。这份能力的代价是：正因为你几乎每次都能自己缓过来，身边的人会默认「这个人不太需要被照顾」，你自己也会这么默认——直到某一次，那套机制刚好也在超负荷运转，没能像往常一样接住你。下一次顺利挺过一次低谷，回头想一想「刚才是什么具体帮到了我」，把它变成一件你知道自己在做、而不是自动发生的事。", en: "Your resilience runs strong — not that you don't feel fragile, but once you do, some mechanism you may not even fully recognize tends to piece you back together faster than most people manage. The cost: because you almost always recover on your own, the people around you quietly assume you don't need looking after — and you assume the same about yourself, until the one time that mechanism is also running at capacity and doesn't catch you the way it usually does. Next time you get through a low point cleanly, look back and name specifically what helped — turn it into something you know you're doing, not something that just happens to you." },
};

const DIM_HIGH: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "你最突出的一项，是压力恢复能力——不是你不会被事情压垮，是压垮之后，你的系统会主动处理那份情绪，不会让它一直悬在那里发酵。具体的样子是：吵完一架、熬完一个大项目、经历一场很糟的谈话，你需要缓过来的时间，比身边大多数人短——原因很可能是你处理情绪的路径比较直接，不太会在「要不要现在处理」这件事上反复纠结。", en: "Your strongest trait is stress recovery — you do get knocked down, but once you are, your system actively processes the fallout instead of letting it sit and fester. In practice: after a fight, a brutal stretch of work, a bad conversation, you need less time than most people around you to come back. The likely reason is that your path to processing emotion is fairly direct — you don't spend much time debating whether to deal with it now." },
  adaptability: { zh: "你最突出的一项，是变化适应能力——计划被打乱的时候，你的第一反应更接近「好，那现在怎么办」，而不是「怎么会这样」。原因很可能是你对「计划」这件事本身，抓得没那么紧——对你来说计划是路线图的其中一版，不是唯一正确答案，所以换一条路走，成本比大多数人低。这份轻松感别人未必看得出来，但在需要临场应变的场合，会是你自己很清楚的一份底气。", en: "Your strongest trait is adaptability — when a plan falls apart, your first instinct leans closer to \"okay, what now\" than \"how did this happen.\" The likely reason: you don't grip \"the plan\" very tightly to begin with — for you it's one version of a route, not the only correct answer, so switching paths costs you less than it costs most people. Others may not notice this ease, but in moments that demand improvising on the spot, it's a confidence you can feel clearly yourself." },
  crisisRebound: { zh: "你最突出的一项，是危机反弹能力——真正的低谷来临时，你反而比风平浪静的时候更容易调动起行动力，去找下一个出口。原因很可能是你的系统天生更擅长在压力下启动，而不是在压力下瘫痪——平时看起来没什么方向感，一旦情况真的紧急，反而会突然变得很清楚该往哪走。这种模式经常被误读成「什么都不在乎」，其实是启动的开关，需要够高的压力才会被真正按下。", en: "Your strongest trait is crisis rebound — when a real low point hits, you're more likely to mobilize and go looking for the next way out than during calm stretches. The likely reason: your system is simply built to switch on under pressure rather than freeze under it — you can look aimless in ordinary times and then suddenly know exactly where to go once things get genuinely urgent. People often misread this as not caring about anything; really, the switch just needs enough pressure before it flips." },
  persistence: { zh: "你最突出的一项，是长期坚持能力——一件事需要拖得很长、看不到即时反馈，这种消耗对你来说相对更扛得住。原因可能是你对「结果」的耐心阈值比较高，不太需要靠短期的正反馈来维持动力，靠的更多是「这件事本身值得做完」这个判断。这项能力短期内很少被人注意到，但在需要熬过一段长周期的事情上，往往是真正决定结果的那一项。", en: "Your strongest trait is persistence — when something drags on with no immediate payoff, that grind is more sustainable for you than for most. The likely reason: your patience threshold for results runs high; you don't need short-term positive feedback to keep going, you run more on the judgment that the thing is worth finishing. This rarely gets noticed day to day, but over anything that takes a long stretch to pay off, it's usually the trait that actually decides the outcome." },
  emotionalStability: { zh: "你最突出的一项，是精神稳定能力——情绪来了，你有出口，也有觉察，不太容易被情绪本身反过来控制住行动。原因可能是你习惯把「感受到什么」和「要不要照着感受去做」这两件事分开看——你会承认自己有情绪，但不会自动让情绪替你做决定。这不代表你感受得少，是你处理感受的那套系统运转得比较顺畅，很少堵在某一个点反复内耗。", en: "Your strongest trait is emotional stability — feelings arrive, you have an outlet and awareness for them, and they rarely end up steering your actions against your will. The likely reason: you tend to separate what you feel from whether you act on it — you'll admit the feeling is there without letting it auto-pilot your decisions. That doesn't mean you feel less; it means the system that processes what you feel runs smoothly and rarely gets stuck looping on one point." },
};

const DIM_LOW: Record<string, { zh: string; en: string }> = {
  stressRecovery: { zh: "相对更需要留意的一项，是压力恢复能力——冲击过去之后，你的系统消化它的速度，比其他几项能力慢一些。容易出现的情况是：事情表面上已经结束了，你却还在往后的好几天里，反复想起那个场景。这不是你放不下，是恢复这件事，对你来说本来就需要更长的窗口，硬逼自己「翻篇」反而会打断这个过程。具体可以做的：下一次冲击过后，主动给自己划出一段「什么都不用做」的时间，标注在日程里，而不是等状态自己变好。", en: "The trait most worth watching is stress recovery — after an impact passes, your system processes it more slowly than your other traits. What this often looks like: something is technically over, and you're still replaying the scene days later. That's not an inability to let go — recovery genuinely needs a longer window for you, and forcing yourself to \"move on\" actually interrupts the process. Something concrete to try: after your next hit, actively block out a stretch of do-nothing time on your calendar, instead of waiting for the feeling to pass on its own." },
  adaptability: { zh: "相对更需要留意的一项，是变化适应能力——计划被打乱的时候，你需要的重新校准时间，比其他几项能力暗示的更长一些。容易出现的情况是：明明道理上知道该怎么调整，行动却还是慢半拍，甚至会在原地多待一会儿，好像在等事情自己变回原来的样子。这不是执行力的问题，是你的系统需要多一步「先消化变化本身」，才能真正切换到新的路径上。具体可以做的：计划被打乱时，先给自己一句明确的话——「我现在需要几分钟重新看一下情况」，把这段过渡时间说出口，而不是默默硬撑着立刻反应。", en: "The trait most worth watching is adaptability — when a plan gets disrupted, you need more recalibration time than your other traits suggest. What this often looks like: you know intellectually what needs to change, but your actions lag half a beat, and part of you lingers as if waiting for things to snap back to how they were. That's not a failure of execution — your system needs one extra step of digesting the change itself before it can actually switch to a new path. Something concrete to try: when a plan breaks, say it out loud — \"I need a few minutes to look at this again\" — instead of silently forcing an immediate response." },
  crisisRebound: { zh: "相对更需要留意的一项，是危机反弹能力——真正的低谷来临时，你更容易先进入「需要静一静」的状态，而不是立刻去找下一个出口，这个过程比其他几项能力暗示的要慢一些。容易出现的情况是：低谷期你会本能地想自己扛，反而更晚才让别人知道你在经历什么。这不是你不够坚强，是你的启动开关，需要先经过一段安静的沉淀，才会真正被按下。具体可以做的：提前想好一个「低谷期我可以联系的人」，不是等状态最差的时候才临时去找，是低谷之前就先确认好这条退路，真正需要的时候才用得上。", en: "The trait most worth watching is crisis rebound — when a real low hits, you're more likely to first need stillness before looking for the next way forward, and that process takes longer than your other traits suggest. What this often looks like: during a low point, your instinct is to handle it alone, so people find out what you're going through later than they might otherwise. That's not a lack of strength — your switch just needs a stretch of quiet processing before it actually flips. Something concrete to try: name one person you could reach out to during a low point, before you're actually in one — not scrambling to find someone once things are already at their worst." },
  persistence: { zh: "相对更需要留意的一项，是长期坚持能力——需要长时间投入、又看不到即时反馈的事情，对你来说，消耗会比其他几项能力暗示的更明显一些。容易出现的情况是：一件事开头的兴奋劲过去之后，大概到第三、四周，动力会掉得比较快，不是因为不重要，是缺乏能看得见的进展在支撑。这不是三分钟热度，是你的系统更依赖阶段性的、能被感知到的反馈，才能持续投入。具体可以做的：把长期目标拆成两三周就能看到一次结果的小节点，主动为自己制造反馈，而不是等目标本身兑现。", en: "The trait most worth watching is persistence — things that need sustained effort with no immediate payoff cost you more than your other traits suggest. What this often looks like: the initial excitement fades by roughly week three or four, and motivation drops fast — not because the thing stopped mattering, but because there's no visible progress to lean on. This isn't a short attention span; your system just relies more on periodic, perceivable feedback to keep investing. Something concrete to try: break long goals into checkpoints spaced two to three weeks apart, and manufacture that feedback for yourself instead of waiting for the goal itself to pay off." },
  emotionalStability: { zh: "相对更需要留意的一项，是精神稳定能力——情绪来了之后，找到出口、重新回到稳定状态，这个过程对你来说会比其他几项能力暗示的更费力一些。容易出现的情况是：情绪没有被真正处理掉，只是被暂时压下去，然后在某个不相关的小事上，忽然爆发出比例失衡的反应。这不是你情绪化，是情绪一直没有找到一个固定的出口，只能不断累积。具体可以做的：给自己固定一个「情绪出口」——写下来、说出来、动起来，选一种能长期坚持的方式，而不是每次都靠临场想办法处理。", en: "The trait most worth watching is emotional stability — finding an outlet and returning to steady ground after a feeling arrives takes more effort for you than your other traits suggest. What this often looks like: the feeling never actually gets processed, just pushed down temporarily, then surfaces as an out-of-proportion reaction to something small and unrelated. That's not being overly emotional — the feeling simply hasn't found a fixed outlet, so it keeps accumulating. Something concrete to try: pick one fixed outlet for emotion — writing, saying it out loud, moving your body — something sustainable, instead of improvising a fresh approach each time." },
};


function band(score: number): 0 | 1 | 2 | 3 {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
}

export default function ResilienceFlow() {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const submit = async () => {
    if (!year || !month || !day || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resilience/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("计算失败，请检查出生信息。", "Calculation failed — please check your birth details."));
        setLoading(false);
        return;
      }
      setResult(data as Result);
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({
        containerRef: reportRef.current,
        fileName: "灵犀生命韧性指数.pdf",
        // 扎根/沉稳主题——深森林绿打底，呼应"韧性、恢复力、稳固"这个
        // 产品的调性，不是全站统一的深蓝背景。
        bgColorRgb: [12, 32, 26],
        bgColorHex: "#0c201a",
      });
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert(t("PDF 生成失败，请稍后再试。", "PDF generation failed — please try again."));
    } finally {
      setDownloading(false);
    }
  };

  if (result) {
    const dims = DIM_ORDER.filter((d) => d in result.breakdown);
    const sorted = [...dims].sort((a, b) => result.breakdown[b] - result.breakdown[a]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const r = 70, c = 2 * Math.PI * r;
    const pct = result.score / 100;
    const elementLabel: Record<string, string> = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };

    return (
      <>
      <div ref={reportRef} className="mx-auto max-w-xl px-6 py-16">
        <div className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-void-deep px-6 py-4 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="灵犀场 · 生命韧性指数" en="Lingxi Field · Life Resilience Index" />
          </p>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="flex shrink-0 items-center gap-2 rounded-sm border border-lattice/40 px-4 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone disabled:opacity-50"
          >
            {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center rounded-sm border border-white/10 bg-void-deep p-8">
          <svg viewBox="0 0 180 180" className="w-44" style={{ filter: "drop-shadow(0 0 14px rgba(199,156,255,0.45))" }}>
            <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={r} fill="none" stroke="#C79CFF" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct)}`}
              transform="rotate(-90 90 90)"
            />
            <text x="90" y="82" textAnchor="middle" fontSize="40" fill="#F4EFFF" fontFamily="serif">{result.score}</text>
            <text x="90" y="108" textAnchor="middle" fontSize="12" fill="#B7AEEB">/ 100</text>
          </svg>
          <p className="mt-2 text-xs text-bone-dim">
            {t("太阳", "Sun")} {langEn ? result.sunSignEn : result.sunSignZh} · {t("日主", "Day Master")} {langEn ? result.dayMasterElement : (elementLabel[result.dayMasterElement] || "")}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="overflow-hidden rounded-sm border border-lattice/20" style={{ maxWidth: 260 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/resilience/resilience.jpg" alt={t("生命韧性指数", "Life Resilience Index")} className="block w-full" />
          </div>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-base leading-9 text-bone-dim">{t(OVERALL[band(result.score)].zh, OVERALL[band(result.score)].en)}</p>
        </div>

        <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
          <div className="space-y-3">
            {dims.map((d) => (
              <div key={d} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-bone-dim">
                  <Bi zh={DIM_LABEL[d].zh} en={DIM_LABEL[d].en} />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${result.breakdown[d]}%`, background: `linear-gradient(90deg, ${DIM_COLOR[d]}99, ${DIM_COLOR[d]})` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-bone-dim">{result.breakdown[d]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
          <p className="text-sm uppercase tracking-widest2 text-lattice"><Bi zh="你最强的一项" en="Your Strongest Trait" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(DIM_HIGH[strongest].zh, DIM_HIGH[strongest].en)}</p>
        </div>
        <div className="mt-4 rounded-sm border border-amber/20 bg-amber/5 p-6">
          <p className="text-sm uppercase tracking-widest2 text-amber"><Bi zh="值得留意的一项" en="Worth Watching" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(DIM_LOW[weakest].zh, DIM_LOW[weakest].en)}</p>
        </div>

        <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
          <p className="text-sm uppercase tracking-widest2 text-lattice/70"><Bi zh="这个分数是怎么来的" en="Where This Score Comes From" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">
            <Bi
              zh="不是临场编的。灵犀场底层是一套「生命向量引擎」——先用真实天文数据（此刻行星在黄道上的精确位置）和真实历法数据（你的四柱八字），算出一组固定的数字，压力恢复、危机反弹、精神稳定这些维度，全部是先算出分数，场域才根据这些已经算好的数字去写解读，不是场域自己决定要不要说你「韧性强」。同一份出生数据，任何时候重新算，前面的分数都是一样的——这是它跟一般算命网站最大的不同：别的网站是「直接问、直接给答案」，这里是「先算出结构，场域只负责讲清楚这个结构」。这五个维度的分数，是从你完整命盘里，只抽出跟「韧性」相关的这一部分。"
              en="This isn't improvised. Underneath, Lingxi Field runs on a life-vector engine — real astronomical data (the planets' exact positions right now) and real calendrical data (your Bazi pillars) are used to compute a fixed set of numbers first — stress recovery, crisis rebound, emotional stability — before any text gets written. The field writes based on numbers already computed; it doesn't decide on its own whether to call you resilient. Recompute the same birth data anytime, and the underlying scores come out identical. That's the core difference from a typical fortune-telling site: they ask a question and hand you an answer directly; here, the structure is computed first, and the field only explains it. These five scores are pulled from just the resilience-related slice of your full chart."
            />
          </p>
        </div>

        <WhyTrustLingxi />

        <div className="mt-8 rounded-sm border border-white/10 bg-void-deep p-6 text-center">
          <p className="text-base leading-8 text-bone-dim">
            <Bi
              zh="同一份命盘还能算出：你的财富来源类型是哪一种、你在亲密关系里的核心矛盾是什么、你的桃花磁场和吸引力风格——这些现在都还没被解读。完整生命图谱会把这些维度全部展开，交叉引用同一组数据，不是另外重新算一份。"
              en="The same chart also determines your wealth archetype, the core tension in your close relationships, and your romance magnetism — none of that has been unpacked yet. The full Life Map expands all of it, cross-referencing the same underlying data, not a separate calculation."
            />
          </p>
          <a
            href="/life-map"
            className="mt-5 inline-block bg-lattice px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
          >
            <Bi zh="查看完整生命图谱 →" en="See Your Full Life Map →" />
          </a>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep px-6 py-3 text-center">
          <p className="text-sm text-bone-dim/90">
            <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
          </p>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-xl px-6 text-center">
        <ShareButton
          text={t("我测了灵犀场的生命韧性指数，去看看你自己的：", "I got my Lingxi Field Resilience reading — check out your own:")}
          url="https://lingxifield.com/resilience"
          label={{ zh: "分享这份结果", en: "Share this result" }}
        />
      </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="灵犀场 · 生命韧性指数" en="Lingxi Field · Life Resilience Index" />
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="当人生改变方向，你的生命系统如何接住自己？" en="When life changes direction, how does your system catch you?" />
        </h1>
        <p className="mt-4 text-base leading-8 text-bone-dim">
          <Bi
            zh="真正的韧性，不是永远没有压力，而是在变化、困难、不确定出现时，你是否拥有重新调整自己的能力。很多时候我们只知道「我还能不能撑住」，却很少知道「我的生命系统，是如何恢复的」。场域从你的生命结构中，探索五项核心韧性维度——压力恢复、变化适应、危机反弹、长期坚持、精神稳定。了解自己的韧性结构，不是为了给自己贴标签，而是知道你的力量来自哪里、你的消耗发生在哪里，以及如何更好地支持自己——即时呈现，不需要登录。"
            en="True resilience isn't the absence of pressure — it's whether you can re-adjust when change, difficulty, or uncertainty shows up. Most of the time we only know 'can I still hold on,' and rarely know 'how does my system actually recover.' The field explores five core dimensions from your life structure — stress recovery, adaptability, crisis rebound, persistence, emotional stability. Understanding your resilience isn't about labeling yourself — it's knowing where your strength comes from, where your drain happens, and how to support yourself better, shown to you right away, no sign-in needed."
          />
        </p>
      </div>

      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-6">
        <p className="text-sm text-bone-dim">{t("出生年月日", "Birth date")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "Month")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "Day")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-bone-dim">
          <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
          <Bi zh="知道具体出生时间（选填，能看得更细）" en="I know the exact birth time (optional)" />
        </label>
        {hasTime && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时（0-23）", "Hour (0-23)")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
            <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} className="rounded-sm border border-white/15 bg-void px-3 py-3 text-sm text-bone outline-none focus:border-lattice/60" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-rose/30 bg-void-deep p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !year || !month || !day}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="测出我的生命韧性指数" en="Get My Resilience Index" />}
      </button>
      <FaqSection items={RESILIENCE_FAQ} />
    </div>
  );
}
