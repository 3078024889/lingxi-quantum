import type { ResilienceBreakdown, ResilienceDim } from "./life-vector";

// ────────────────────────────────────────────────────────────────────
// 生命韧性指数 · 独立测试的叙事层
// ────────────────────────────────────────────────────────────────────
// 跟生命图谱完整报告里第14节不一样：那一节是把已经算好的分数交给AI去
// 写解读；这个独立测试是完全不调用AI的确定性拼装——原因很直接：
// 这是打算拿去做搜索引流的免费/轻量产品，访问量可能远大于付费报告，
// 每次都调一次AI既增加成本也增加"生成失败"的风险面。这里改成本地
// 组合一段总述+最强项+最弱项+行动提示，四个部分各自有多个版本，
// 组合起来（4档总述 × 5项最强 × 5项最弱）有上百种排列，不会显得
// 千人一面，但结果是即时的、不会失败的、不花钱的。
// 跟AI写的那版一样，遵守同一条底线：不说"你命硬/命不好"这类算命
// 断语，不预言具体会遇到什么事，只描述一种能力结构。
//
// 内容跟 app/resilience/ResilienceFlow.tsx 里那份是同一份文案（v182
// 按七条原则重写过：具体到"换一个人就说不出这句话"、有画面不是概念、
// 优势即代价的张力、给出因果、能验证但不说死、结尾给可执行的动作、
// 语气克制不浮夸）——两处保持同步，这个文件目前是给以后可能需要在
// 服务端复用这份文案时用的（比如未来做每日心得推送之类的功能），
// 当前没有被其他代码实际引用。

type Bi = { zh: string; en: string };

function band(score: number): 0 | 1 | 2 | 3 {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
}

const OVERALL: Record<0 | 1 | 2 | 3, Bi> = {
  0: {
    zh: "你现在的韧性，还没有形成一套属于自己的固定路径——遇到麻烦，你几乎每次都要重新想一遍该怎么应付，很少有一条现成的路可以直接走。这不是因为你不够坚强，是因为你消耗精力的方式，一直是「临场想办法」，不是「调用已经攒下的经验」。真正让人累的，往往不是某一件具体的事，是「每次都要重新来一遍」这件事本身。下一次卡壳时，先别急着解决问题——花两分钟写下「上一次类似的情况，我是怎么走出来的」，哪怕只想起一次，也是在给自己攒第一条可以重复用的路。",
    en: "Your resilience hasn't settled into a repeatable path yet — when trouble hits, you're almost always improvising from scratch, rarely following a route you've already worn in. That's not a lack of strength; your energy keeps going toward figuring it out live, not toward drawing on experience you've already banked. What wears you down usually isn't the specific problem — it's having to start over every time. Next time you're stuck, don't rush to solve it. Spend two minutes writing down how you got through something similar before. Even one memory is the start of a path you can actually reuse.",
  },
  1: {
    zh: "你的韧性，已经有几块地方是站得住的——某些类型的麻烦，你其实处理得不错，只是这些「站得住的部分」，彼此之间还没连成一条线。单独一件事，你扛得住；两三件事叠在一起，系统就开始吃紧，不是因为承受力不够，是因为每一块「站得住」都还是孤立的，没有互相支援。留意一下：你已经处理得比较好的那类事情，具体是靠什么撑过去的？把那个具体的方法，试着套用到你现在觉得吃力的地方——这比重新发明一套办法更快。",
    en: "Some parts of your resilience already hold — certain kinds of trouble, you actually handle well. The problem is those solid parts haven't connected into a single line yet. One thing at a time, you're fine; two or three stacked together, and the system starts straining — not from lack of capacity, but because each solid part is still working alone. Notice what you're already handling well, and how — the specific method, not just the outcome. Try applying that same method to whatever feels hardest right now. That's faster than inventing a new approach from zero.",
  },
  2: {
    zh: "你的韧性，整体是稳的——这也是问题所在：正因为大部分时候你都扛得住，你很容易忘记「扛住」本身是有代价的，把「没垮」当成「没事」。真正的风险不是某一次冲击太大，是你把恢复这件事，一次又一次地往后推，因为眼下总有更紧急的事。你可以撑过去，不代表撑过去之后，那部分消耗真的被还清了。下一次顺利扛过一件事之后，具体留出一段时间——不是「有空再说」，是写进日程里——去做一件纯粹为了恢复、跟解决问题无关的事。",
    en: "Your resilience is generally solid — which is exactly the trap: because you can absorb most things, it's easy to mistake \"didn't collapse\" for \"nothing happened.\" The real risk isn't one blow being too big — it's that you keep postponing recovery because something more urgent always comes up. Being able to push through doesn't mean the cost gets paid back. Next time you get through something cleanly, block out actual time — not \"whenever,\" but on the calendar — for something that's purely about recovering, unrelated to solving the next problem.",
  },
  3: {
    zh: "你的韧性结构，属于比较强的一类——不是你不会脆弱，是脆弱之后，有一套你自己可能都没完全意识到的机制，会把你重新拼回一个能站起来的状态，速度比大多数人快。这份能力的代价是：正因为你几乎每次都能自己缓过来，身边的人会默认「这个人不太需要被照顾」，你自己也会这么默认——直到某一次，那套机制刚好也在超负荷运转，没能像往常一样接住你。下一次顺利挺过一次低谷，回头想一想「刚才是什么具体帮到了我」，把它变成一件你知道自己在做、而不是自动发生的事。",
    en: "Your resilience runs strong — not that you don't feel fragile, but once you do, some mechanism you may not even fully recognize tends to piece you back together faster than most people manage. The cost: because you almost always recover on your own, the people around you quietly assume you don't need looking after — and you assume the same about yourself, until the one time that mechanism is also running at capacity and doesn't catch you the way it usually does. Next time you get through a low point cleanly, look back and name specifically what helped — turn it into something you know you're doing, not something that just happens to you.",
  },
};

const DIM_HIGH: Record<ResilienceDim, Bi> = {
  stressRecovery: {
    zh: "你最突出的一项，是压力恢复能力——不是你不会被事情压垮，是压垮之后，你的系统会主动处理那份情绪，不会让它一直悬在那里发酵。具体的样子是：吵完一架、熬完一个大项目、经历一场很糟的谈话，你需要缓过来的时间，比身边大多数人短——原因很可能是你处理情绪的路径比较直接，不太会在「要不要现在处理」这件事上反复纠结。",
    en: "Your strongest trait is stress recovery — you do get knocked down, but once you are, your system actively processes the fallout instead of letting it sit and fester. In practice: after a fight, a brutal stretch of work, a bad conversation, you need less time than most people around you to come back. The likely reason is that your path to processing emotion is fairly direct — you don't spend much time debating whether to deal with it now.",
  },
  adaptability: {
    zh: "你最突出的一项，是变化适应能力——计划被打乱的时候，你的第一反应更接近「好，那现在怎么办」，而不是「怎么会这样」。原因很可能是你对「计划」这件事本身，抓得没那么紧——对你来说计划是路线图的其中一版，不是唯一正确答案，所以换一条路走，成本比大多数人低。这份轻松感别人未必看得出来，但在需要临场应变的场合，会是你自己很清楚的一份底气。",
    en: "Your strongest trait is adaptability — when a plan falls apart, your first instinct leans closer to \"okay, what now\" than \"how did this happen.\" The likely reason: you don't grip \"the plan\" very tightly to begin with — for you it's one version of a route, not the only correct answer, so switching paths costs you less than it costs most people. Others may not notice this ease, but in moments that demand improvising on the spot, it's a confidence you can feel clearly yourself.",
  },
  crisisRebound: {
    zh: "你最突出的一项，是危机反弹能力——真正的低谷来临时，你反而比风平浪静的时候更容易调动起行动力，去找下一个出口。原因很可能是你的系统天生更擅长在压力下启动，而不是在压力下瘫痪——平时看起来没什么方向感，一旦情况真的紧急，反而会突然变得很清楚该往哪走。这种模式经常被误读成「什么都不在乎」，其实是启动的开关，需要够高的压力才会被真正按下。",
    en: "Your strongest trait is crisis rebound — when a real low point hits, you're more likely to mobilize and go looking for the next way out than during calm stretches. The likely reason: your system is simply built to switch on under pressure rather than freeze under it — you can look aimless in ordinary times and then suddenly know exactly where to go once things get genuinely urgent. People often misread this as not caring about anything; really, the switch just needs enough pressure before it flips.",
  },
  persistence: {
    zh: "你最突出的一项，是长期坚持能力——一件事需要拖得很长、看不到即时反馈，这种消耗对你来说相对更扛得住。原因可能是你对「结果」的耐心阈值比较高，不太需要靠短期的正反馈来维持动力，靠的更多是「这件事本身值得做完」这个判断。这项能力短期内很少被人注意到，但在需要熬过一段长周期的事情上，往往是真正决定结果的那一项。",
    en: "Your strongest trait is persistence — when something drags on with no immediate payoff, that grind is more sustainable for you than for most. The likely reason: your patience threshold for results runs high; you don't need short-term positive feedback to keep going, you run more on the judgment that the thing is worth finishing. This rarely gets noticed day to day, but over anything that takes a long stretch to pay off, it's usually the trait that actually decides the outcome.",
  },
  emotionalStability: {
    zh: "你最突出的一项，是精神稳定能力——情绪来了，你有出口，也有觉察，不太容易被情绪本身反过来控制住行动。原因可能是你习惯把「感受到什么」和「要不要照着感受去做」这两件事分开看——你会承认自己有情绪，但不会自动让情绪替你做决定。这不代表你感受得少，是你处理感受的那套系统运转得比较顺畅，很少堵在某一个点反复内耗。",
    en: "Your strongest trait is emotional stability — feelings arrive, you have an outlet and awareness for them, and they rarely end up steering your actions against your will. The likely reason: you tend to separate what you feel from whether you act on it — you'll admit the feeling is there without letting it auto-pilot your decisions. That doesn't mean you feel less; it means the system that processes what you feel runs smoothly and rarely gets stuck looping on one point.",
  },
};

const DIM_LOW: Record<ResilienceDim, Bi> = {
  stressRecovery: {
    zh: "相对更需要留意的一项，是压力恢复能力——冲击过去之后，你的系统消化它的速度，比其他几项能力慢一些。容易出现的情况是：事情表面上已经结束了，你却还在往后的好几天里，反复想起那个场景。这不是你放不下，是恢复这件事，对你来说本来就需要更长的窗口，硬逼自己「翻篇」反而会打断这个过程。具体可以做的：下一次冲击过后，主动给自己划出一段「什么都不用做」的时间，标注在日程里，而不是等状态自己变好。",
    en: "The trait most worth watching is stress recovery — after an impact passes, your system processes it more slowly than your other traits. What this often looks like: something is technically over, and you're still replaying the scene days later. That's not an inability to let go — recovery genuinely needs a longer window for you, and forcing yourself to \"move on\" actually interrupts the process. Something concrete to try: after your next hit, actively block out a stretch of do-nothing time on your calendar, instead of waiting for the feeling to pass on its own.",
  },
  adaptability: {
    zh: "相对更需要留意的一项，是变化适应能力——计划被打乱的时候，你需要的重新校准时间，比其他几项能力暗示的更长一些。容易出现的情况是：明明道理上知道该怎么调整，行动却还是慢半拍，甚至会在原地多待一会儿，好像在等事情自己变回原来的样子。这不是执行力的问题，是你的系统需要多一步「先消化变化本身」，才能真正切换到新的路径上。具体可以做的：计划被打乱时，先给自己一句明确的话——「我现在需要几分钟重新看一下情况」，把这段过渡时间说出口，而不是默默硬撑着立刻反应。",
    en: "The trait most worth watching is adaptability — when a plan gets disrupted, you need more recalibration time than your other traits suggest. What this often looks like: you know intellectually what needs to change, but your actions lag half a beat, and part of you lingers as if waiting for things to snap back to how they were. That's not a failure of execution — your system needs one extra step of digesting the change itself before it can actually switch to a new path. Something concrete to try: when a plan breaks, say it out loud — \"I need a few minutes to look at this again\" — instead of silently forcing an immediate response.",
  },
  crisisRebound: {
    zh: "相对更需要留意的一项，是危机反弹能力——真正的低谷来临时，你更容易先进入「需要静一静」的状态，而不是立刻去找下一个出口，这个过程比其他几项能力暗示的要慢一些。容易出现的情况是：低谷期你会本能地想自己扛，反而更晚才让别人知道你在经历什么。这不是你不够坚强，是你的启动开关，需要先经过一段安静的沉淀，才会真正被按下。具体可以做的：提前想好一个「低谷期我可以联系的人」，不是等状态最差的时候才临时去找，是低谷之前就先确认好这条退路，真正需要的时候才用得上。",
    en: "The trait most worth watching is crisis rebound — when a real low hits, you're more likely to first need stillness before looking for the next way forward, and that process takes longer than your other traits suggest. What this often looks like: during a low point, your instinct is to handle it alone, so people find out what you're going through later than they might otherwise. That's not a lack of strength — your switch just needs a stretch of quiet processing before it actually flips. Something concrete to try: name one person you could reach out to during a low point, before you're actually in one — not scrambling to find someone once things are already at their worst.",
  },
  persistence: {
    zh: "相对更需要留意的一项，是长期坚持能力——需要长时间投入、又看不到即时反馈的事情，对你来说，消耗会比其他几项能力暗示的更明显一些。容易出现的情况是：一件事开头的兴奋劲过去之后，大概到第三、四周，动力会掉得比较快，不是因为不重要，是缺乏能看得见的进展在支撑。这不是三分钟热度，是你的系统更依赖阶段性的、能被感知到的反馈，才能持续投入。具体可以做的：把长期目标拆成两三周就能看到一次结果的小节点，主动为自己制造反馈，而不是等目标本身兑现。",
    en: "The trait most worth watching is persistence — things that need sustained effort with no immediate payoff cost you more than your other traits suggest. What this often looks like: the initial excitement fades by roughly week three or four, and motivation drops fast — not because the thing stopped mattering, but because there's no visible progress to lean on. This isn't a short attention span; your system just relies more on periodic, perceivable feedback to keep investing. Something concrete to try: break long goals into checkpoints spaced two to three weeks apart, and manufacture that feedback for yourself instead of waiting for the goal itself to pay off.",
  },
  emotionalStability: {
    zh: "相对更需要留意的一项，是精神稳定能力——情绪来了之后，找到出口、重新回到稳定状态，这个过程对你来说会比其他几项能力暗示的更费力一些。容易出现的情况是：情绪没有被真正处理掉，只是被暂时压下去，然后在某个不相关的小事上，忽然爆发出比例失衡的反应。这不是你情绪化，是情绪一直没有找到一个固定的出口，只能不断累积。具体可以做的：给自己固定一个「情绪出口」——写下来、说出来、动起来，选一种能长期坚持的方式，而不是每次都靠临场想办法处理。",
    en: "The trait most worth watching is emotional stability — finding an outlet and returning to steady ground after a feeling arrives takes more effort for you than your other traits suggest. What this often looks like: the feeling never actually gets processed, just pushed down temporarily, then surfaces as an out-of-proportion reaction to something small and unrelated. That's not being overly emotional — the feeling simply hasn't found a fixed outlet, so it keeps accumulating. Something concrete to try: pick one fixed outlet for emotion — writing, saying it out loud, moving your body — something sustainable, instead of improvising a fresh approach each time.",
  },
};

export function describeResilience(score: number, breakdown: ResilienceBreakdown): {
  overall: Bi;
  strongest: { dim: ResilienceDim; text: Bi };
  weakest: { dim: ResilienceDim; text: Bi };
} {
  const dims = Object.keys(breakdown) as ResilienceDim[];
  const sorted = [...dims].sort((a, b) => breakdown[b] - breakdown[a]);
  const strongestDim = sorted[0];
  const weakestDim = sorted[sorted.length - 1];
  return {
    overall: OVERALL[band(score)],
    strongest: { dim: strongestDim, text: DIM_HIGH[strongestDim] },
    weakest: { dim: weakestDim, text: DIM_LOW[weakestDim] },
  };
}
