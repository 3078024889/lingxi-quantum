"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import PortalSpinner from "@/components/PortalSpinner";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import ShareButton from "@/components/ShareButton";
import { getProduct } from "@/lib/plans";
import { REVIEW_MODE } from "@/lib/reviewMode";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";

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

const PAIR_INSIGHT: Record<string, { zh: string; en: string }> = {
  "stressRecovery|adaptability": { zh: "\u4f60\u80fd\u5feb\u901f\u6d88\u5316\u51b2\u51fb\u672c\u8eab\u5e26\u6765\u7684\u60c5\u7eea\uff0c\u4f46\u73af\u5883\u4e00\u65e6\u53d8\u5316\uff0c\u91cd\u65b0\u6821\u51c6\u8def\u7ebf\u8981\u82b1\u66f4\u4e45\u2014\u2014\u4f60\u4e0d\u662f\u88ab\u201c\u96be\u8fc7\u201d\u5361\u4f4f\uff0c\u662f\u88ab\u201c\u8fd9\u6761\u8def\u8d70\u4e0d\u901a\u4e86\uff0c\u5f97\u91cd\u65b0\u60f3\u201d\u5361\u4f4f\u3002", en: "You process the emotional hit fast, but recalibrating your route once things change takes longer \u2014 you're not stuck on the hurt, you're stuck on figuring out the new plan." },
  "stressRecovery|crisisRebound": { zh: "\u5355\u6b21\u6253\u51fb\u4f60\u6062\u590d\u5f97\u5f88\u5feb\uff0c\u4f46\u771f\u6b63\u7684\u4f4e\u8c37\u9700\u8981\u5148\u7ecf\u8fc7\u4e00\u6bb5\u5b89\u9759\u6c89\u6dc0\u4f60\u624d\u4f1a\u542f\u52a8\u53cd\u51fb\u2014\u2014\u77ed\u75db\u4f60\u625b\u5f97\u4f4f\uff0c\u957f\u75db\u9700\u8981\u5148\u7ed9\u81ea\u5df1\u7559\u51fa\u201c\u505c\u201d\u7684\u7a7a\u95f4\u3002", en: "A single hit, you bounce back from fast. A real low point needs a quiet stretch before you mobilize \u2014 short pain you can carry; long pain needs a pause first." },
  "stressRecovery|persistence": { zh: "\u60c5\u7eea\u5c42\u9762\u4f60\u6d88\u5316\u5f97\u5feb\uff0c\u4f46\u6ca1\u6709\u5373\u65f6\u53cd\u9988\u7684\u957f\u671f\u6295\u5165\u5bb9\u6613\u6389\u7ebf\u2014\u2014\u4f60\u4e0d\u7f3a\u5904\u7406\u75db\u82e6\u7684\u80fd\u529b\uff0c\u7f3a\u7684\u662f\u6ca1\u6709\u75db\u82e6\u3001\u53ea\u662f\u67af\u71e5\u65f6\u7684\u575a\u6301\u3002", en: "Emotionally you process fast, but long stretches with no feedback lose your grip \u2014 you're not short on the capacity to handle pain, you're short on staying power when it's just boring, not painful." },
  "stressRecovery|emotionalStability": { zh: "\u4f60\u80fd\u5904\u7406\u201c\u53d1\u751f\u4e86\u4ec0\u4e48\u201d\uff0c\u4f46\u5f88\u96be\u5728\u60c5\u7eea\u51fa\u73b0\u7684\u5f53\u4e0b\u5c31\u7a33\u4f4f\u2014\u2014\u6062\u590d\u80fd\u529b\u5f3a\uff0c\u4e0d\u4ee3\u8868\u60c5\u7eea\u6765\u7684\u90a3\u4e00\u523b\u4f60\u4e0d\u4f1a\u88ab\u5e26\u7740\u8d70\u3002", en: "You handle what happened well, but staying steady the moment the feeling hits is harder \u2014 strong recovery doesn't mean you won't get swept up in the moment itself." },
  "adaptability|stressRecovery": { zh: "\u73af\u5883\u4e00\u53d8\u4f60\u80fd\u7acb\u523b\u6362\u8def\u8d70\uff0c\u4f46\u6362\u8def\u4e4b\u540e\u6b8b\u7559\u7684\u60c5\u7eea\u6d88\u8017\uff0c\u9700\u8981\u66f4\u957f\u65f6\u95f4\u624d\u80fd\u771f\u6b63\u7ffb\u7bc7\u2014\u2014\u4f60\u64c5\u957f\u5e94\u53d8\uff0c\u4e0d\u4ee3\u8868\u5e94\u53d8\u4e4b\u540e\u6ca1\u6709\u4ee3\u4ef7\u3002", en: "The moment things change, you switch routes instantly \u2014 but the emotional residue left over takes longer to actually clear. Being adaptable doesn't mean adapting is free." },
  "adaptability|crisisRebound": { zh: "\u65e5\u5e38\u7684\u53d8\u5316\u4f60\u9002\u5e94\u5f97\u5f88\u5feb\uff0c\u4f46\u771f\u6b63\u7684\u4f4e\u8c37\u4f1a\u8ba9\u4f60\u5148\u505c\u4e0b\u6765\uff0c\u4e0d\u50cf\u5e73\u65f6\u90a3\u6837\u7acb\u523b\u627e\u51fa\u53e3\u2014\u2014\u5c0f\u53d8\u5316\u4f60\u6e38\u5203\u6709\u4f59\uff0c\u5927\u51b2\u51fb\u4f60\u9700\u8981\u5148\u9759\u4e00\u9759\u3002", en: "Everyday change, you handle easily. A real low point makes you stop first, instead of immediately finding an exit like usual \u2014 small shifts you're fluent in; big hits need stillness first." },
  "adaptability|persistence": { zh: "\u4f60\u6362\u8def\u5f88\u5feb\uff0c\u4f46\u4e5f\u5bb9\u6613\u56e0\u4e3a\u6362\u8def\u592a\u5bb9\u6613\uff0c\u534a\u9014\u6362\u6389\u672c\u8be5\u575a\u6301\u7684\u65b9\u5411\u2014\u2014\u7075\u6d3b\u662f\u4f60\u7684\u5f3a\u9879\uff0c\u4e5f\u662f\u8ba9\u957f\u671f\u76ee\u6807\u534a\u9014\u800c\u5e9f\u7684\u539f\u56e0\u3002", en: "You switch paths fast \u2014 which also makes it easy to abandon a direction you should have stuck with. Flexibility is your strength, and also what derails your long-term goals." },
  "adaptability|emotionalStability": { zh: "\u8ba1\u5212\u53d8\u4e86\u4f60\u80fd\u7acb\u523b\u8c03\u6574\u884c\u52a8\uff0c\u4f46\u60c5\u7eea\u4e0d\u4e00\u5b9a\u8ddf\u5f97\u4e0a\u884c\u52a8\u7684\u901f\u5ea6\u2014\u2014\u4f60\u7684\u8111\u5b50\u5df2\u7ecf\u5728\u4e0b\u4e00\u6b65\u4e86\uff0c\u5fc3\u8fd8\u7559\u5728\u539f\u5730\u3002", en: "When plans change you adjust your actions instantly, but your emotions don't always move at the same speed \u2014 your mind is already on the next step; part of you is still standing where you were." },
  "crisisRebound|stressRecovery": { zh: "\u771f\u6b63\u7684\u4f4e\u8c37\u4f60\u53cd\u800c\u7206\u53d1\u529b\u60ca\u4eba\uff0c\u4f46\u65e5\u5e38\u7684\u5c0f\u6d88\u8017\u53cd\u800c\u66f4\u96be\u6062\u590d\u2014\u2014\u4f60\u80fd\u625b\u4f4f\u5927\u98ce\u6d6a\uff0c\u5374\u5bb9\u6613\u88ab\u65e5\u5e38\u7684\u5c0f\u4e8b\u4e00\u70b9\u70b9\u78e8\u3002", en: "A real crisis brings out surprising force in you, but everyday small drains are actually harder to recover from \u2014 you can weather a storm, and still get worn down by small daily friction." },
  "crisisRebound|adaptability": { zh: "\u5371\u673a\u6765\u4e86\u4f60\u80fd\u7acb\u523b\u5207\u6362\u5230\u6218\u6597\u72b6\u6001\uff0c\u4f46\u5371\u673a\u8fc7\u540e\u8981\u56de\u5230\u201c\u6b63\u5e38\u8282\u594f\u201d\uff0c\u53cd\u800c\u6bd4\u8fdb\u5165\u6218\u6597\u72b6\u6001\u66f4\u96be\u2014\u2014\u4f60\u64c5\u957f\u51b2\u950b\uff0c\u4e0d\u64c5\u957f\u6536\u5175\u3002", en: "A crisis flips you straight into fight mode \u2014 but returning to normal pace afterward is harder than entering fight mode was. You're built for the charge, not the stand-down." },
  "crisisRebound|persistence": { zh: "\u4f60\u5728\u771f\u6b63\u7684\u5371\u673a\u91cc\u7206\u53d1\u529b\u60ca\u4eba\uff0c\u4f46\u5371\u673a\u4e00\u65e6\u62d6\u6210\u6301\u4e45\u6218\uff0c\u7f3a\u5c11\u5373\u65f6\u53cd\u9988\u4f1a\u8ba9\u4f60\u6389\u7ebf\u2014\u2014\u4f60\u662f\u77ed\u8dd1\u578b\u7684\u529b\u91cf\uff0c\u4e0d\u662f\u957f\u8dd1\u578b\u7684\u3002", en: "You bring real force to an actual crisis, but once it drags into a long grind with no immediate feedback, you lose your grip \u2014 yours is a sprinter's strength, not a marathoner's." },
  "crisisRebound|emotionalStability": { zh: "\u4f4e\u8c37\u6fc0\u53d1\u4f60\u7684\u884c\u52a8\u529b\uff0c\u4f46\u884c\u52a8\u80cc\u540e\u7684\u60c5\u7eea\uff0c\u4f60\u672a\u5fc5\u771f\u6b63\u5904\u7406\u8fc7\u2014\u2014\u4f60\u628a\u5371\u673a\u53d8\u6210\u4e86\u52a8\u529b\uff0c\u4f46\u6ca1\u5904\u7406\u7684\u90e8\u5206\u53ef\u80fd\u4f1a\u5728\u540e\u9762\u627e\u4e0a\u4f60\u3002", en: "A low point fuels your drive to act, but the emotion underneath the action may never get truly processed \u2014 you turn crisis into momentum, and the unprocessed part can catch up with you later." },
  "persistence|stressRecovery": { zh: "\u4f60\u80fd\u4e3a\u4e00\u4ef6\u4e8b\u71ac\u5f88\u4e45\uff0c\u4f46\u8fc7\u7a0b\u4e2d\u7684\u6bcf\u4e00\u6b21\u5c0f\u51b2\u51fb\uff0c\u6d88\u5316\u8d77\u6765\u6bd4\u522b\u4eba\u6162\u2014\u2014\u4f60\u7684\u8010\u529b\u7528\u5728\u4e86\u201c\u6491\u4f4f\u201d\uff0c\u6ca1\u7559\u7ed9\u201c\u6062\u590d\u201d\u3002", en: "You can grind on something for a long time, but each small hit along the way takes you longer to process than most \u2014 your stamina goes into holding on, with none left over for recovering." },
  "persistence|adaptability": { zh: "\u4f60\u80fd\u957f\u671f\u4e13\u6ce8\u4e00\u4e2a\u65b9\u5411\uff0c\u4f46\u65b9\u5411\u4e00\u65e6\u9700\u8981\u8c03\u6574\uff0c\u4f60\u4f1a\u672c\u80fd\u5730\u60f3\u201c\u518d\u575a\u6301\u4e00\u4e0b\u201d\uff0c\u800c\u4e0d\u662f\u5148\u770b\u6e05\u662f\u4e0d\u662f\u8be5\u6362\u8def\u2014\u2014\u4f60\u7684\u575a\u6301\u6709\u65f6\u5019\u4f1a\u53d8\u6210\u5bf9\u65e7\u65b9\u5411\u7684\u6267\u5ff5\u3002", en: "You can stay focused on one direction for a long time, but when it actually needs adjusting, your instinct is to hold on a bit longer rather than checking whether it's time to switch \u2014 your persistence can curdle into attachment to a direction that's already wrong." },
  "persistence|crisisRebound": { zh: "\u957f\u671f\u7684\u4e8b\u4f60\u80fd\u625b\u4f4f\uff0c\u4f46\u771f\u6b63\u7684\u4f4e\u8c37\u51b2\u51fb\u6765\u4e34\u65f6\uff0c\u4f60\u4f1a\u5148\u9700\u8981\u4e00\u6bb5\u5b89\u9759\u671f\u624d\u80fd\u91cd\u65b0\u542f\u52a8\u2014\u2014\u6301\u4e45\u529b\u5f3a\uff0c\u4e0d\u4ee3\u8868\u53cd\u5e94\u901f\u5ea6\u5feb\u3002", en: "Long hauls, you can carry. When a real low point actually hits, you need a quiet stretch before you restart \u2014 strong endurance doesn't mean a fast reaction." },
  "persistence|emotionalStability": { zh: "\u4f60\u80fd\u4e3a\u76ee\u6807\u575a\u6301\u5f88\u4e45\uff0c\u4f46\u575a\u6301\u7684\u8fc7\u7a0b\u91cc\uff0c\u60c5\u7eea\u5176\u5b9e\u4e00\u76f4\u5728\u6084\u6084\u7d2f\u79ef\uff0c\u6ca1\u6709\u88ab\u771f\u6b63\u5904\u7406\u2014\u2014\u4f60\u7684\u8010\u529b\u662f\u201c\u5fcd\u201d\uff0c\u4e0d\u5b8c\u5168\u662f\u201c\u7a33\u201d\u3002", en: "You can hold onto a goal for a long time, but along the way the emotion quietly accumulates without ever really getting processed \u2014 your endurance is more enduring than steady." },
  "emotionalStability|stressRecovery": { zh: "\u60c5\u7eea\u6765\u4e86\u4f60\u80fd\u5f88\u5feb\u627e\u5230\u51fa\u53e3\u4e0d\u88ab\u5e26\u8d70\uff0c\u4f46\u4e8b\u60c5\u672c\u8eab\u7559\u4e0b\u7684\u5177\u4f53\u6d88\u8017\uff0c\u9700\u8981\u66f4\u4e45\u624d\u80fd\u771f\u6b63\u6062\u590d\u2014\u2014\u4f60\u7684\u60c5\u7eea\u7a33\uff0c\u4e0d\u4ee3\u8868\u8fd9\u4ef6\u4e8b\u5bf9\u4f60\u7684\u5b9e\u9645\u5f71\u54cd\u5df2\u7ecf\u8fc7\u53bb\u4e86\u3002", en: "When a feeling hits, you find an outlet fast without getting swept away \u2014 but the concrete toll the event itself leaves behind takes longer to actually recover from. Emotional steadiness isn't the same as the impact being over." },
  "emotionalStability|adaptability": { zh: "\u60c5\u7eea\u4e0a\u4f60\u5f88\u5c11\u88ab\u5916\u754c\u5e26\u4e71\uff0c\u4f46\u884c\u52a8\u4e0a\u8c03\u6574\u8282\u594f\uff0c\u6bd4\u60c5\u7eea\u8c03\u6574\u8981\u6162\u4e00\u62cd\u2014\u2014\u5fc3\u7a33\u5f97\u4f4f\uff0c\u811a\u6b65\u6ca1\u8ddf\u4e0a\u3002", en: "You rarely get emotionally destabilized by outside events, but adjusting your actual pace of action lags a beat behind \u2014 your mind holds steady; your feet haven't caught up yet." },
  "emotionalStability|crisisRebound": { zh: "\u60c5\u7eea\u7a33\u5b9a\u8ba9\u4f60\u5728\u4f4e\u8c37\u671f\u770b\u8d77\u6765\u5f88\u5e73\u9759\uff0c\u4f46\u8fd9\u4efd\u5e73\u9759\u6709\u65f6\u5019\u662f\u201c\u8fd8\u6ca1\u771f\u6b63\u542f\u52a8\u201d\uff0c\u4e0d\u662f\u201c\u5df2\u7ecf\u5904\u7406\u597d\u4e86\u201d\u2014\u2014\u5916\u8868\u7684\u7a33\uff0c\u63a9\u76d6\u4e86\u8fd8\u6ca1\u5f00\u59cb\u7684\u53cd\u5f39\u3002", en: "Emotional stability makes you look calm during a low point, but that calm is sometimes not-yet-switched-on rather than already-handled \u2014 the steady surface can hide a rebound that hasn't started yet." },
  "emotionalStability|persistence": { zh: "\u4f60\u5f88\u5c11\u88ab\u60c5\u7eea\u7275\u7740\u8d70\uff0c\u4f46\u6ca1\u6709\u5373\u65f6\u53cd\u9988\u7684\u957f\u671f\u6295\u5165\uff0c\u8fd8\u662f\u5bb9\u6613\u8ba9\u4f60\u7684\u52a8\u529b\u6162\u6162\u6d41\u5931\u2014\u2014\u7a33\u5b9a\u7684\u662f\u60c5\u7eea\uff0c\u4e0d\u662f\u52a8\u529b\u672c\u8eab\u3002", en: "You rarely get pulled around by emotion, but long-term effort with no immediate feedback still lets your motivation quietly drain away \u2014 what's steady is the emotion, not the drive itself." },
};

function band(score: number): 0 | 1 | 2 | 3 {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
}


const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u751f\u547d\u97e7\u6027\u6e90\u70b9", titleEn: "Where Your Resilience Begins", descZh: "\u4e94\u9879\u5206\u6570\u653e\u5728\u4e00\u8d77\uff0c\u5f62\u6210\u4e86\u4e00\u79cd\u4ec0\u4e48\u6837\u7684\u6574\u4f53\u6c14\u573a\u2014\u2014\u54ea\u51e0\u9879\u662f\u9aa8\u67b6\u3001\u54ea\u51e0\u9879\u662f\u8584\u5f31\u73af\u8282\uff0c\u4e0d\u662f\u9010\u6761\u7ffb\u8bd1\u5206\u6570\uff0c\u662f\u770b\u6574\u4f53\u5f62\u72b6\u3002", descEn: "Your five scores together, forming a real shape \u2014 which parts are your skeleton, which are thin." },
  { titleZh: "\u538b\u529b\u6062\u590d\u80fd\u529b", titleEn: "Stress Recovery", descZh: "\u8fd9\u9879\u5206\u6570\u80cc\u540e\uff0c\u4f60\u5904\u7406\u65e5\u5e38\u538b\u529b\u7684\u5177\u4f53\u65b9\u5f0f\u662f\u4ec0\u4e48\u2014\u2014\u5206\u6570\u9ad8\u4f4e\u5206\u522b\u610f\u5473\u7740\u4ec0\u4e48\u771f\u5b9e\u7684\u884c\u4e3a\u6a21\u5f0f\u3002", descEn: "The real behavior behind this score \u2014 how you actually process everyday pressure." },
  { titleZh: "\u53d8\u5316\u9002\u5e94\u80fd\u529b", titleEn: "Adaptability to Change", descZh: "\u8ba1\u5212\u88ab\u6253\u4e71\u65f6\uff0c\u4f60\u771f\u5b9e\u7684\u53cd\u5e94\u987a\u5e8f\u662f\u4ec0\u4e48\u2014\u2014\u4e0d\u662f\u300c\u4f60\u9002\u5e94\u529b\u5f3a\u4e0d\u5f3a\u300d\uff0c\u662f\u5177\u4f53\u7684\u7b2c\u4e00\u6b65\u3001\u7b2c\u4e8c\u6b65\u3002", descEn: "The exact sequence of your reaction when plans fall apart \u2014 step by step, not just a rating." },
  { titleZh: "\u5371\u673a\u53cd\u5f39\u80fd\u529b", titleEn: "Crisis Rebound", descZh: "\u771f\u6b63\u7684\u4f4e\u8c37\u51b2\u51fb\u6765\u4e34\u65f6\uff0c\u4f60\u7684\u542f\u52a8\u65b9\u5f0f\u662f\u5feb\u8fd8\u662f\u6162\u3001\u9760\u4ec0\u4e48\u91cd\u65b0\u7ad9\u8d77\u6765\u3002", descEn: "When a real low hits, whether you bounce fast or slow \u2014 and what actually gets you back up." },
  { titleZh: "\u957f\u671f\u575a\u6301\u80fd\u529b", titleEn: "Long-Term Persistence", descZh: "\u6ca1\u6709\u5373\u65f6\u53cd\u9988\u7684\u957f\u671f\u6295\u5165\uff0c\u4f60\u9760\u4ec0\u4e48\u6491\u4f4f\u2014\u2014\u8fd9\u9879\u80fd\u529b\u901a\u5e38\u6700\u4e0d\u5bb9\u6613\u88ab\u770b\u89c1\uff0c\u5374\u6700\u51b3\u5b9a\u7ed3\u679c\u3002", descEn: "What keeps you going through long stretches with no feedback \u2014 usually invisible, usually decisive." },
  { titleZh: "\u7cbe\u795e\u7a33\u5b9a\u7ed3\u6784", titleEn: "Emotional Stability Structure", descZh: "\u4f60\u7684\u5185\u5728\u7a33\u5b9a\u611f\u6765\u81ea\u54ea\u91cc\uff0c\u6ce2\u52a8\u4e4b\u540e\u9760\u4ec0\u4e48\u56de\u5230\u4e2d\u5fc3\u3002", descEn: "Where your inner steadiness actually comes from, and what brings you back to center." },
  { titleZh: "\u9690\u85cf\u6062\u590d\u6a21\u5f0f", titleEn: "Hidden Recovery Pattern", descZh: "\u7ed3\u5408\u4f60\u6700\u9ad8\u7684\u90a3\u9879\u5206\u6570\uff0c\u6307\u51fa\u4e00\u79cd\u4f60\u81ea\u5df1\u53ef\u80fd\u90fd\u6ca1\u610f\u8bc6\u5230\u3001\u4f46\u786e\u5b9e\u5728\u8d77\u4f5c\u7528\u7684\u6062\u590d\u65b9\u5f0f\u3002", descEn: "Tied to your strongest score \u2014 a recovery method you likely use without realizing it." },
  { titleZh: "\u80fd\u91cf\u6d88\u8017\u5730\u56fe", titleEn: "Energy Drain Map", descZh: "\u7ed3\u5408\u4f60\u6700\u4f4e\u7684\u90a3\u9879\u5206\u6570\uff0c\u5177\u4f53\u6307\u51fa\u54ea\u79cd\u60c5\u5883\u6a21\u5f0f\u6700\u5bb9\u6613\u6084\u6084\u6d88\u8017\u4f60\u2014\u2014\u4e0d\u662f\u300c\u8fc7\u5ea6\u601d\u8003\u300d\u8fd9\u79cd\u901a\u7528\u8bcd\u3002", descEn: "Tied to your weakest score \u2014 the exact situation pattern that quietly drains you." },
  { titleZh: "\u97e7\u6027\u8fdb\u5316\u8def\u5f84", titleEn: "Resilience Growth Path", descZh: "\u4e0d\u662f\u53d8\u5f97\u66f4\u5f3a\uff0c\u662f\u8ba9\u73b0\u6709\u529b\u91cf\u5f62\u6210\u7cfb\u7edf\u2014\u2014\u4e00\u4ef6\u8ddf\u4f60\u6700\u5f3a\u9879\u548c\u6700\u5f31\u9879\u76f8\u5173\u7684\u3001\u53ef\u64cd\u4f5c\u7684\u5c0f\u4e8b\u3002", descEn: "Not about getting stronger \u2014 about turning what you already have into a system. One concrete next step." },
  { titleZh: "\u7075\u7280\u573a\u6062\u590d\u5b9e\u8df5", titleEn: "A Personal Recovery Practice", descZh: "\u4e00\u4e2a\u5177\u4f53\u3001\u53ef\u6267\u884c\u7684\u65e5\u5e38\u5c0f\u7ec3\u4e60\uff0c\u7ed3\u5408\u4f60\u7684\u5206\u6570\u7ed3\u6784\uff0c\u4e0d\u662f\u300c\u591a\u4f11\u606f\u300d\u8fd9\u79cd\u901a\u7528\u5efa\u8bae\u3002", descEn: "A specific daily practice matched to your exact score structure \u2014 not \"get more rest.\"" },
  { titleZh: "\u751f\u547d\u97e7\u6027\u603b\u7ed3", titleEn: "Resilience Summary", descZh: "\u6536\u5c3e\u5fc5\u987b\u6307\u5411\u524d\u9762\u63d0\u5230\u8fc7\u7684\u5177\u4f53\u5206\u6570\u6216\u5224\u65ad\uff0c\u4e0d\u662f\u9760\u60c5\u7eea\u8bcd\u6536\u5c3e\u3002", descEn: "A closing tied to a specific score already discussed \u2014 not a warm-and-fuzzy sendoff." },
];

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
  const [unlockName, setUnlockName] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const unlock = async () => {
    if (!year || !month || !day || unlocking) return;
    setUnlocking(true);
    setError("");
    try {
      // v244：之前这里没有提前检查登录状态，未登录的用户点"解锁"
      // 之后，只能等后端返回"请先登录"这句纯文字提示，找不到
      // 登录入口在哪——这里改成提交前先本地检查一次，没登录就
      // 直接带去登录页，跟关系共振那边已经在用的处理方式一致。
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        setTimeout(() => { window.location.href = "/account"; }, 1200);
        return;
      }

      const res = await fetch("/api/resilience/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year, 10), month: parseInt(month, 10), day: parseInt(day, 10),
          hour: hasTime ? parseInt(hour, 10) : 12, minute: hasTime ? parseInt(minute, 10) : 0,
          hasTime, name: unlockName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        setError(data.error || t("保存失败，请稍后再试。", "Save failed — please try again."));
        setUnlocking(false);
        return;
      }
      setSubmissionId(data.id);
      if (REVIEW_MODE) {
        window.location.href = `/resilience/full?id=${data.id}`;
        return;
      }
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=resilience-report&submissionId=${data.id}&name=${encodeURIComponent(unlockName)}&redirect=${encodeURIComponent(`/resilience/full?id=${data.id}`)}`;
    } catch {
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      setUnlocking(false);
    }
  };

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
        bgColorRgb: [246, 244, 240],
        bgColorHex: "#F6F4F0",
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
        <div className="flex items-center justify-between gap-3 lx-glass-resilience px-6 py-4 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
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

        <div className="mt-8 flex flex-col items-center lx-glass-resilience p-8">
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

        <div className="mt-6 lx-glass-resilience p-6">
          <p className="text-base leading-9 text-bone-dim">{t(OVERALL[band(result.score)].zh, OVERALL[band(result.score)].en)}</p>
        </div>

        <div className="mt-4 lx-glass-resilience p-6">
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

        {PAIR_INSIGHT[`${strongest}|${weakest}`] && (
          <div className="mt-4 lx-glass-resilience p-6">
            <p className="text-sm uppercase tracking-widest2 text-lattice"><Bi zh="这两项放在一起，会是什么样" en="When These Two Meet" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              {t(PAIR_INSIGHT[`${strongest}|${weakest}`].zh, PAIR_INSIGHT[`${strongest}|${weakest}`].en)}
            </p>
          </div>
        )}

        <div className="mt-4 lx-glass-resilience p-6">
          <p className="text-sm uppercase tracking-widest2 text-lattice"><Bi zh="这个分数是怎么来的" en="Where This Score Comes From" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">
            <Bi
              zh="不是临场编的。灵犀场底层是一套「生命向量引擎」——先用真实天文数据（此刻行星在黄道上的精确位置）和真实历法数据（你的四柱八字），算出一组固定的数字，压力恢复、危机反弹、精神稳定这些维度，全部是先算出分数，场域才根据这些已经算好的数字去写解读，不是场域自己决定要不要说你「韧性强」。同一份出生数据，任何时候重新算，前面的分数都是一样的——这是它跟一般算命网站最大的不同：别的网站是「直接问、直接给答案」，这里是「先算出结构，场域只负责讲清楚这个结构」。这五个维度的分数，是从你完整命盘里，只抽出跟「韧性」相关的这一部分。"
              en="This isn't improvised. Underneath, Lingxi Field runs on a life-vector engine — real astronomical data (the planets' exact positions right now) and real calendrical data (your Bazi pillars) are used to compute a fixed set of numbers first — stress recovery, crisis rebound, emotional stability — before any text gets written. The field writes based on numbers already computed; it doesn't decide on its own whether to call you resilient. Recompute the same birth data anytime, and the underlying scores come out identical. That's the core difference from a typical fortune-telling site: they ask a question and hand you an answer directly; here, the structure is computed first, and the field only explains it. These five scores are pulled from just the resilience-related slice of your full chart."
            />
          </p>
        </div>

        <div className="mt-6 lx-glass-resilience px-6 py-3 text-center">
          <p className="text-sm text-bone-dim">
            <Bi zh="这是一份自我探索与反思的参考，不是命运预言。" en="This is a reference for self-reflection, not a prophecy." />
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-xl px-6">
        <div
          className="lx-glass-resilience p-6 text-center"
        >
          <p className="font-display text-sm uppercase tracking-widest2 text-emerald-300">
            <Bi zh="想看得更深？" en="Want to go deeper?" />
          </p>
          <p className="mt-2 text-sm leading-7 text-bone-dim">
            <Bi
              zh="这五个分数背后，还有一份完整档案——根系支撑系统、再生循环、隐藏力量与恢复模式，逐一展开成一份可以下载、永久保存的深度报告。"
              en="Behind these five scores is a full archive — your root system, regeneration cycle, hidden strength and recovery pattern, unfolded into a downloadable report you keep for life."
            />
          </p>

          <div className="mt-6 space-y-5 border-t border-white/10 pt-6 text-left">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-emerald-300">
              <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
            </p>
            {TEASER_CHAPTERS.map((c, i) => (
              <div key={i}>
                <p className="font-display text-sm text-emerald-300">{String(i + 1).padStart(2, "0")} · <Bi zh={c.titleZh} en={c.titleEn} /></p>
                <p className="mt-1.5 text-sm leading-7 text-bone-dim">
                  <Bi zh={c.descZh} en={c.descEn} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* v266：跟桃花磁场/今日运势这次统一的处理方式一样——姓名输入框
            和解锁按钮从压着封面图背景的卡片里拆出来，单独一块纯色玻璃
            面板，不再跟封面图底部的"lingxifield.com"落款文字叠在一起。 */}
        <div className="lx-glass-resilience mt-4 p-6 text-center">
          <input
            type="text"
            value={unlockName}
            onChange={(e) => setUnlockName(e.target.value)}
            placeholder={t("你的名字（选填）", "Your name (optional)")}
            className="w-full rounded-sm border border-white/15 bg-transparent px-4 py-2 text-center text-sm text-bone outline-none focus:border-emerald-400/60"
          />
          <button
            onClick={unlock}
            disabled={unlocking}
            className="mt-4 w-full bg-emerald-400 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {unlocking ? <Bi zh="准备中…" en="Preparing…" /> : <Bi zh={`展开完整韧性档案 · ¥${getProduct("resilience-report")?.priceRmb}`} en={`Unfold the Full Resilience Archive · $${getProduct("resilience-report")?.priceUsd}`} />}
          </button>
          {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}
        </div>
      </div>

      {/* v261：这段"查看完整生命图谱"的引导，之前排在1-11点清单前面，
          等于用户还没看到免费产品本身能展开成什么样，就先被推去买另一个
          产品——这次挪到解锁按钮之后，位置对了：先把这个产品自己的
          完整价值讲完，最后再做交叉导流。 */}
      <div className="mx-auto mt-6 max-w-xl px-6">
        <div className="lx-glass-resilience p-6 text-center">
          <p className="text-base leading-8 text-bone-dim">
            <Bi
              zh="同一份生命结构还能展开：你的财富创造方式、你在深度关系中的核心互动、你的桃花磁场与吸引频率。完整生命图谱会让这些维度彼此交叉映照，而不是各自成为孤立的答案。"
              en="The same life structure can also unfold your wealth-creation style, core interactions in deep relationships, and romance resonance. The full Life Blueprint cross-reflects these dimensions rather than treating them as isolated answers."
            />
          </p>
          <a
            href="/life-map"
            className="mt-5 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
          >
            <Bi zh="继续探索：完整生命图谱 →" en="Continue exploring: Full Life Map →" />
          </a>
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
      <div className="lx-glass-resilience p-6">
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
        <div className="mt-4 lx-glass-resilience p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !year || !month || !day}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="展开我的生命韧性指数" en="Unfold My Life Resilience Index" />}
      </button>
      <FaqSection items={RESILIENCE_FAQ} />
    </div>
  );
}
