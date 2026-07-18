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

type Bi = { zh: string; en: string };

function band(score: number): 0 | 1 | 2 | 3 {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
}

const OVERALL: Record<0 | 1 | 2 | 3, Bi> = {
  0: {
    zh: "你的韧性结构，目前更像是一片还没被夯实的地基——不是撑不住，是撑住的方式，还没有找到属于你自己的那一套。每一次冲击，感觉都要从头重新扛一遍，这种消耗感是真实的，不是你不够坚强。",
    en: "Right now your resilience looks less like a fortress and more like ground that hasn't been packed down yet — not that you can't hold weight, but that you haven't found your own way of holding it. Every impact can feel like starting from zero, and that drain is real, not a sign you aren't strong enough.",
  },
  1: {
    zh: "你的韧性结构，正处在建立当中——已经有几块地方站得住脚了，但整体还没有连成一片。遇到不算太大的冲击，能扛过去；一旦几件事叠在一起，就容易感觉到整个系统在吃紧。",
    en: "Your resilience is under construction — a few parts already hold firm, but the whole hasn't knit together yet. Moderate hits, you can absorb; but when several things stack up at once, you can feel the whole system straining.",
  },
  2: {
    zh: "你的韧性结构，整体是相对稳固的——大部分时候，冲击来了，你有能力接住，也有能力消化。真正值得留意的，不是你扛不扛得住，是扛住之后，有没有真的把那部分消耗还给自己。",
    en: "Your resilience is, on the whole, fairly solid — most of the time, when something hits, you have the capacity to absorb it and process it. What's worth watching isn't whether you can take the hit, but whether you actually give yourself back what it cost you afterward.",
  },
  3: {
    zh: "你的韧性结构，是相当强韧的一类——不是没有脆弱的时候，是脆弱之后，你有一整套自己都未必清楚意识到的机制，会把你重新拼回一个能站起来的状态。这种能力很宝贵，也容易被自己当成理所当然，忘了它其实需要维护。",
    en: "Your resilience sits in a genuinely strong band — it's not that you never feel fragile, it's that once you do, some mechanism you may not even consciously notice tends to piece you back into someone who can stand again. That's a real asset, and it's easy to take it for granted and forget it still needs upkeep.",
  },
};

const DIM_HIGH: Record<ResilienceDim, Bi> = {
  stressRecovery: {
    zh: "你最突出的一项，是压力恢复能力——这意味着，你不是不会被事情压到，是压到之后，你的系统会主动去「消化」那份情绪，而不是让它一直悬在那里。真实场景里，这经常表现为：吵完架、加完班、经历完一场糟糕的谈话，你需要的恢复时间，比大多数人短。",
    en: "Your strongest suit is stress recovery — you do get weighed down by things, but afterward your system actively processes that weight instead of letting it hang there indefinitely. In practice, this often shows up as needing less time than most people to bounce back after an argument, a brutal work stretch, or a bad conversation.",
  },
  adaptability: {
    zh: "你最突出的一项，是变化适应能力——计划被打乱、环境突然改变，对你来说，制造的更多是「需要重新规划」的感觉，而不是「整个人被打乱」的感觉。这项能力，在需要临场应变的场合，是别人未必看得到、但你自己会很清楚的一份底气。",
    en: "Your strongest suit is adaptability — when plans fall apart or circumstances shift suddenly, what you feel is mostly \"I need to re-plan\" rather than \"I've come completely undone.\" It's a kind of quiet confidence that others may not notice but that you can feel clearly in situations that demand improvising on the spot.",
  },
  crisisRebound: {
    zh: "你最突出的一项，是危机反弹能力——真正的低谷来临时，你反而比在风平浪静时更容易调动起行动力，去找下一个出口，而不是停在原地。这种模式，往往会被别人误读成「这个人怎么什么都不放在心上」，其实是你的系统，天生就更擅长在压力下启动，而不是在压力下瘫痪。",
    en: "Your strongest suit is crisis rebound — when a real low point hits, you tend to mobilize and start looking for the next way forward more readily than you do in calm times. People sometimes misread this as \"nothing seems to bother them,\" when really your system is simply built to activate under pressure rather than freeze under it.",
  },
  persistence: {
    zh: "你最突出的一项，是长期坚持能力——一件事需要拖得很长、需要在看不到即时反馈的情况下持续投入，这种消耗对你来说相对更可承受。这项能力，短期内很少被人注意到，但在需要熬过一段长周期的事情上，它才是真正决定结果的那一项。",
    en: "Your strongest suit is persistence — when something drags on and offers no immediate feedback, that kind of grind is more sustainable for you than for most. It rarely gets noticed in the short term, but in anything that takes a long stretch to pay off, this is the trait that actually decides the outcome.",
  },
  emotionalStability: {
    zh: "你最突出的一项，是精神稳定能力——情绪来了，你有出口，也有觉察，不容易被情绪本身反过来控制住行动。这不代表你感受得少，是你处理感受的那套系统，运转得比较顺畅，不容易堵在某个点上。",
    en: "Your strongest suit is emotional stability — feelings arrive, you have an outlet and awareness for them, and they rarely end up steering your actions against your will. It doesn't mean you feel less; it means the system that processes what you feel runs smoothly and rarely gets stuck at any one point.",
  },
};

const DIM_LOW: Record<ResilienceDim, Bi> = {
  stressRecovery: {
    zh: "相对更需要留意的一项，是压力恢复能力——冲击过去之后，你的系统消化它的速度，比其他几项能力慢一些。这不是弱点，是提醒：给自己安排「真正的恢复时间」，对你来说，不是可有可无的加分项，是维持整体状态运转的必需品。",
    en: "The dimension most worth watching is stress recovery — after an impact passes, your system processes it more slowly than your other capacities. That's not a flaw, it's a signal: real recovery time isn't optional for you, it's what keeps the rest of the system running.",
  },
  adaptability: {
    zh: "相对更需要留意的一项，是变化适应能力——计划被打乱的时候，你需要的重新校准时间，比其他几项能力所暗示的更长一些。值得记住的是：给自己一点「先愣一下再动」的空间，不是反应慢，是你的系统需要这道程序，才能真正切换过去。",
    en: "The dimension most worth watching is adaptability — when plans get disrupted, you need more time to recalibrate than your other traits might suggest. It's worth remembering: giving yourself a beat before you respond isn't slowness, it's a step your system genuinely needs before it can actually switch gears.",
  },
  crisisRebound: {
    zh: "相对更需要留意的一项，是危机反弹能力——真正的低谷来临时，你更容易先进入「需要静一静」的状态，而不是立刻找下一个出口，这个过程比其他几项能力暗示的要慢一些。低谷期主动给自己找一个可以依靠的人或系统，比逼自己立刻振作，更接近你真实的节奏。",
    en: "The dimension most worth watching is crisis rebound — when a real low hits, you're more likely to first need stillness before you start looking for the next move, and that process takes longer than your other traits suggest. Actively finding someone or something to lean on during a low point fits your real rhythm better than forcing yourself to bounce back immediately.",
  },
  persistence: {
    zh: "相对更需要留意的一项，是长期坚持能力——需要长时间投入、又看不到即时反馈的事情，对你来说，消耗会比其他几项能力暗示的更明显一些。把大目标拆成能持续看到反馈的小节点，对你来说，不是「降低难度」，是让这件事真正变得可持续的必要设计。",
    en: "The dimension most worth watching is persistence — things that need sustained effort with no immediate payoff cost you more than your other traits suggest. Breaking a big goal into smaller checkpoints with visible feedback isn't \"lowering the bar\" for you — it's the design that actually makes the thing sustainable.",
  },
  emotionalStability: {
    zh: "相对更需要留意的一项，是精神稳定能力——情绪来了之后，找到出口、重新回到稳定状态，这个过程对你来说会比其他几项能力暗示的更费力一些。给情绪一个明确的表达渠道（写下来、说出来、动起来，任何一种都可以），比「先压下去再说」，更符合你的系统需要的运作方式。",
    en: "The dimension most worth watching is emotional stability — finding an outlet and returning to steady ground after a feeling arrives takes more effort for you than your other traits suggest. Giving that feeling an explicit channel — writing it down, saying it out loud, moving your body, any of these — fits how your system needs to operate better than pushing it down first.",
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
