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

const ROMANCE_FAQ: BilingualFaqItem[] = [
  {
    qZh: "桃花磁场分数是如何形成的？", qEn: "How does the Romance Magnetism score form?",
    aZh: "吸引力，从来不只是外貌，也来自表达方式、情绪温度、存在感、连接他人的方式。灵犀场通过你的生命结构信息，观察与你「连接世界」相关的象征节点：你容易通过什么方式被感知、你释放怎样的关系信号、哪一种状态下你的魅力更容易自然展开，同时结合传统象征体系中的桃花标记，形成一份关于个人吸引力风格的探索。它不是告诉你「一定会遇见谁」，而是帮助你发现，你的生命磁场，正在如何与世界发生连接。",
    aEn: "Attraction was never just about looks — it also comes from how you express, your emotional warmth, your presence, and how you connect with others. Lingxi Field observes the symbolic nodes tied to how you connect with the world: how you tend to be perceived, what relational signal you give off, and in which state your charm unfolds most naturally — cross-checked against the classical Peach Blossom marker, forming an exploration of your own attraction style. It doesn't tell you 'who you'll meet.' It helps you discover how your field is already connecting with the world.",
  },
  {
    qZh: "桃花磁场是不是要开启完整探索才能看？", qEn: "Do I need to open the full exploration to see my Romance Magnetism?",
    aZh: "桃花磁场是一处轻量的自我探索入口，帮助你快速认识自己的吸引力来源、关系互动模式、容易被别人感受到的一面。真正完整的关系结构，会在生命图谱与关系共振中进一步展开——因为吸引力只是连接的开始，理解自己，才是关系真正的起点。",
    aEn: "Romance Magnetism is a light, standalone entrance for self-exploration — it helps you quickly recognize where your attraction comes from, how you interact in connection, and the side of you others tend to notice. A more complete relational structure unfolds further in the Life Map and Relationship Resonance — because attraction is only the beginning of connection. Understanding yourself is where a relationship truly starts.",
  },
  {
    qZh: "桃花磁场分数高低代表什么？", qEn: "What does a higher or lower Romance Magnetism score mean?",
    aZh: "它不是魅力排行榜，也不是判断一个人是否受欢迎——灵犀场看到的是「你的存在感，是如何被世界接收」。有些人的吸引力属于第一眼，出现时便容易被注意；有些人的吸引力属于长期，越深入了解越容易感受到价值；有些人的吸引力属于特定环境，在熟悉领域、热爱的事情中会自然发光。不同结构，没有高低，只有不同的表达方式。",
    aEn: "It isn't a charisma leaderboard, and it doesn't judge how popular someone is — what Lingxi Field observes is how your presence is received by the world. Some people's pull is instant, noticed the moment they arrive. Some are a slow burn, felt more deeply the longer you know them. Some shine brightest in a particular setting — in familiar territory, doing what they love. Different structures aren't ranked. They're just different modes of expression.",
  },
];



type Result = {
  score: number;
  style: "independent" | "magnetic" | "devoted" | "gentle";
  hasTaoHua: boolean;
  taohuaBranch: string | null;
  foundIn: string[];
  venusSignZh: string; venusSignEn: string;
};

const STYLE_LABEL: Record<Result["style"], { zh: string; en: string }> = {
  independent: { zh: "独立探索型", en: "The Free Spirit" },
  magnetic: { zh: "磁场吸引型", en: "The Magnetic One" },
  devoted: { zh: "深度专一型", en: "The Devoted Heart" },
  gentle: { zh: "温和亲和型", en: "The Gentle Warmth" },
};

const STYLE_TEXT: Record<Result["style"], { zh: string; en: string }> = {
  independent: {
    zh: "你吸引人的方式，不是主动靠近，是身上那股「不需要谁来完整自己」的松弛感——这份松弛感之所以有吸引力，是因为大多数关系里，人多少都在无意识地索取，而你看起来不需要，这种「不需要」本身，反而勾起了对方想靠近的冲动。这也是你的关系课题所在：你身上最吸引人的那份独立，一旦关系真的变深，很容易变成一道无意识竖起的墙——对方越靠近，你越本能地留一条后路，不是不想投入，是「留后路」这个动作，已经变成了反射。下一次感觉到自己想找借口后退的时候，先问自己一句：这是真的想退，还是习惯性的反射动作。",
    en: "You attract people not by chasing but by radiating a sense of being whole on your own — appealing precisely because most people are, without quite realizing it, seeking something from a connection, and you look like you aren't. That absence of need is what pulls people closer. It's also where your relationship work lies: the same independence that draws people in tends to turn into an unconscious wall the moment things actually deepen — the closer someone gets, the more reflexively you leave yourself an exit, not because you don't want to invest, but because leaving the exit has become automatic. Next time you feel the urge to back off, ask yourself first whether you actually want to, or whether it's just the reflex running.",
  },
  magnetic: {
    zh: "你吸引人的方式，是你自带的社交能量——进一个房间，人群很自然会往你这边聚拢，原因是你几乎不需要热身，从一开始就能给出高浓度的关注和反馈，这种即时的响应感，是很多人渴望却给不出来的。你的关系课题在于：这种能量太容易铺得很宽，宽到你自己都很难分清，哪一段互动只是你一贯的热络，哪一段是真的对这个人上心——容易出现的情况是，某个人以为你们之间很特别，而对你来说那只是默认设置。试着对你真正在意的人，做一件你不会对所有人做的事，一个只属于这段关系的举动，让对方能分辨出「这段不一样」。",
    en: "You attract people through sheer social energy — walk into a room and people naturally gravitate toward you, because you need no warm-up; you give high-attention, high-feedback responses from the first moment, an immediacy many people want and rarely receive. Your relationship work: that energy spreads so wide that even you struggle to tell which interactions are just your default warmth and which ones actually mean something. What this often looks like: someone assumes what's between you is special, when for you it was simply the baseline. Try doing one thing for the person who actually matters that you wouldn't do for everyone else — something distinct enough that they can tell this one is different.",
  },
  devoted: {
    zh: "你吸引人的方式，不靠一开始就很耀眼，是相处越久越让人放心的那种沉淀感——这份沉淀感之所以有吸引力，是因为大多数关系的热度都会随时间消退，而你恰好相反，价值是随时间累积的，「越了解越喜欢」的体验很稀缺。你的关系课题在于：这份沉淀感需要时间才能被感知到，也意味着你投入的速度，天然比对方感受到你价值的速度更快——你已经在心里认定了这段关系，对方可能还停留在「还在了解」的阶段，容易比对方更早感觉到失衡，却说不清具体是哪里不对。投入一段关系时，有意识地放慢一拍，让对方的了解速度，有机会追上你投入的速度。",
    en: "You attract people less through a dazzling first impression than through a steadiness that deepens the longer someone knows you — appealing precisely because most connections lose heat over time, while yours does the opposite: your value accumulates, and \"the more I know you, the more I like you\" is rare to give someone. Your relationship work: because that steadiness takes time to register, you naturally invest faster than the other person's sense of your value can keep pace with — you've committed in your head while they're still getting to know you, and you feel the imbalance before they do without being able to name what's off. When you're falling for someone, deliberately slow your own pace, giving their understanding of you room to catch up to how much you've already invested.",
  },
  gentle: {
    zh: "你吸引人的方式，是一种不具攻击性的亲和力——让人觉得在你身边可以卸下防备，这份安全感之所以有吸引力，是因为大多数社交场合都带着一点评判和竞争，而你身上没有这个，让人难得地可以做自己。你的关系课题在于：这种「让别人舒服」的本能，太容易在关系里把自己的需求排到最后——你很擅长察觉别人需要什么，却很少同等地察觉自己需要什么，久而久之对方会习惯你「总是没问题」，你自己也会习惯这个设定。真正委屈的时候，第一反应常常是说「没事」，而不是说出真实的感受。练习在关系里主动说一次「其实我需要……」，哪怕这句话让你觉得不太自在。",
    en: "You attract people through an unthreatening warmth — being around you makes people feel safe enough to drop their guard, appealing precisely because most social settings carry a hint of judgment and competition, and yours doesn't, letting people rarely get to just be themselves. Your relationship work: that instinct to make others comfortable makes it too easy to push your own needs to last place — you're skilled at sensing what others need and far less practiced at sensing your own, until the other person gets used to you always being fine, and you get used to that role too. When something genuinely hurts, the first reflex is often to say \"it's fine\" instead of naming what you actually feel. Practice saying \"actually, I need...\" out loud at least once, even when it feels uncomfortable.",
  },
};

function band(score: number): 0 | 1 | 2 {
  if (score < 45) return 0;
  if (score < 70) return 1;
  return 2;
}

const OVERALL: Record<0 | 1 | 2, { zh: string; en: string }> = {
  0: { zh: "你的桃花磁场，目前偏安静——不是没有吸引力，是这份吸引力需要近距离、需要时间，才会被真正感知到，不是那种一进房间就被注意到的类型。容易出现的情况是：认识你比较久的人，反而比初次见面的人更容易被你吸引——原因很可能是你的魅力藏在细节里（一句话说到点子上、一个不经意的举动），需要对方停下来、仔细看，才看得到。与其在第一次见面就想办法「被记住」，不如把精力放在创造第二次、第三次接触的机会——逼自己在头五分钟出彩，反而是扬短避长。", en: "Your romance magnetism runs quiet right now — it's not that you lack appeal, it's that it only registers up close and over time, not the kind that gets noticed the moment you walk into a room. What this often looks like: people who've known you a while tend to be more drawn to you than people meeting you for the first time. The likely reason is that your appeal lives in the details — a comment that lands exactly right, an unshowy gesture — and it takes someone slowing down to actually see it. Instead of trying to be memorable in the first five minutes, put your energy into creating a second and third encounter. Your pull needs time to develop — forcing yourself to shine immediately plays against your actual strength." },
  1: { zh: "你的桃花磁场，处在一个比较均衡的区间——在合适的场合、合适的状态下，你的吸引力会被清楚地感知到，但它不是那种无论什么状态都在线的类型，跟你当下的能量状态关系很大。容易出现的情况是：状态好的时候，你会觉得自己很有吸引力；状态一般的时候，会怀疑自己是不是「魅力下降了」——其实不是能力变了，是这项能力本来就跟你当下的精力/情绪状态强绑定。留意一下你状态最好、最容易吸引人的那些时刻，具体是在做什么、处于什么场合——把那个条件有意识地多创造几次，而不是被动等状态自己变好。", en: "Your romance magnetism sits in a fairly balanced range — in the right setting and the right state, it reads clearly, but it isn't always-on; it tracks closely with your energy in the moment. What this often looks like: on a good day you feel genuinely magnetic; on an off day, you start wondering if you've \"lost it\" — nothing about your actual ability changed, this trait is just tightly bound to your current energy and mood. Notice what you're doing and what setting you're in during the moments you feel most magnetic, then deliberately recreate those conditions more often, instead of passively waiting for a good day to show up." },
  2: { zh: "你的桃花磁场，是比较外显的一类——大多数场合里，你的吸引力都容易被清楚地感知到，几乎不太挑状态。这也是需要留意的地方：正因为吸引人这件事对你来说太容易，你反而不太需要花力气去分辨「这个人是真的对我这个人感兴趣，还是单纯被吸引力本身吸引」——两种感觉一开始很像。容易出现的情况是：一段关系热度褪去之后，你才发现对方喜欢的其实是那份「被吸引」的感觉，不是你这个人。在一段关系升温得比较快的时候，主动放慢一拍，花时间聊一些不那么有魅力、比较日常的话题——能留在这些话题里的人，比较可能是冲着你这个人来的。", en: "Your romance magnetism runs strong and visible — in most settings it reads clearly, almost regardless of your mood. What's worth watching: exactly because attraction comes easily to you, you don't have much practice telling apart \"this person is interested in me\" from \"this person is drawn to the pull itself\" — the two feel nearly identical at first. What this often looks like: a connection cools off, and you realize the other person was into the feeling of being drawn in, not into you specifically. When something heats up fast, deliberately slow it down — spend time on the unglamorous, everyday topics. Whoever stays interested through those is more likely there for you, not the pull." },
};

const STYLE_BAND_INSIGHT: Record<string, { zh: string; en: string }> = {
  "independent|0": { zh: "\u4f60\u7684\u72ec\u7acb\u611f\u672c\u8eab\u5c31\u9700\u8981\u65f6\u95f4\u624d\u88ab\u611f\u77e5\u5230\uff0c\u52a0\u4e0a\u78c1\u573a\u76ee\u524d\u504f\u5b89\u9759\uff0c\u4e24\u4e2a\u53e0\u52a0\u610f\u5473\u7740\u4f60\u51e0\u4e4e\u4e0d\u4f1a\u88ab\u201c\u4e00\u89c1\u949f\u60c5\u201d\u8fd9\u79cd\u65b9\u5f0f\u9009\u4e2d\u2014\u2014\u5438\u5f15\u4f60\u7684\u4eba\uff0c\u51e0\u4e4e\u4e00\u5b9a\u662f\u5148\u82b1\u65f6\u95f4\u4e86\u89e3\u4f60\uff0c\u624d\u4f1a\u88ab\u4f60\u7684\u72ec\u7acb\u6253\u52a8\uff0c\u4e0d\u662f\u53cd\u8fc7\u6765\u3002", en: "Your independence already takes time to register, and your field runs quiet right now \u2014 together, you're almost never chosen at first sight. Whoever's drawn to you has nearly always spent time getting to know you first." },
  "independent|1": { zh: "\u72ec\u7acb\u611f\u5728\u72b6\u6001\u597d\u7684\u65f6\u5019\u683c\u5916\u6709\u5438\u5f15\u529b\uff0c\u72b6\u6001\u4e00\u822c\u65f6\u53cd\u800c\u5bb9\u6613\u88ab\u89e3\u8bfb\u6210\u201c\u51b7\u6de1\u201d\u800c\u4e0d\u662f\u201c\u4ece\u5bb9\u201d\u2014\u2014\u4f60\u9700\u8981\u7684\u5bf9\u8c61\uff0c\u662f\u5206\u5f97\u6e05\u8fd9\u4e24\u8005\u533a\u522b\u7684\u4eba\u3002", en: "Your independence reads as magnetic on a good day, and as coldness rather than composure on an off one \u2014 what you need is someone who can tell the two apart." },
  "independent|2": { zh: "\u4f60\u7684\u72ec\u7acb\u611f\u672c\u8eab\u5df2\u7ecf\u5f88\u6709\u8fa8\u8bc6\u5ea6\uff0c\u78c1\u573a\u53c8\u5916\u663e\u2014\u2014\u5bb9\u6613\u88ab\u5927\u91cf\u4eba\u540c\u65f6\u6ce8\u610f\u5230\u4f60\u7684\u201c\u4e0d\u9700\u8981\u8c01\u201d\u8fd9\u4efd\u6c14\u8d28\uff0c\u5374\u5f88\u5c11\u6709\u4eba\u771f\u7684\u9760\u8fd1\u5230\u80fd\u5206\u8fa8\u8fd9\u4efd\u72ec\u7acb\u80cc\u540e\u662f\u4ec0\u4e48\u3002", en: "Your independence is already distinctive, and your field runs visible \u2014 plenty of people notice your not-needing-anyone quality at once, but few get close enough to see what's actually underneath it." },
  "magnetic|0": { zh: "\u4f60\u7684\u793e\u4ea4\u80fd\u91cf\u5f88\u5f3a\uff0c\u4f46\u78c1\u573a\u603b\u5206\u76ee\u524d\u504f\u5b89\u9759\u2014\u2014\u8fd9\u4e2a\u7ec4\u5408\u6709\u70b9\u77db\u76fe\uff0c\u8bf4\u660e\u4f60\u66f4\u64c5\u957f\u201c\u5728\u573a\u201d\u65f6\u88ab\u559c\u6b22\uff0c\u4e0d\u64c5\u957f\u5728\u4e0d\u89c1\u9762\u7684\u65f6\u5019\u88ab\u8bb0\u4f4f\uff0c\u793e\u4ea4\u5e73\u53f0/\u5f02\u5730\u5173\u7cfb\u5bf9\u4f60\u6765\u8bf4\u4f1a\u6bd4\u8f83\u5403\u4e8f\u3002", en: "Strong social energy paired with a quiet overall field is a bit of a contradiction \u2014 you're better at being liked in person than remembered when you're not there. Online or long-distance connections work against you here." },
  "magnetic|1": { zh: "\u78c1\u573a\u5904\u5728\u5747\u8861\u533a\u95f4\uff0c\u52a0\u4e0a\u4f60\u81ea\u5e26\u7684\u793e\u4ea4\u80fd\u91cf\uff0c\u610f\u5473\u7740\u4f60\u7684\u5438\u5f15\u529b\u5f88\u4f9d\u8d56\u201c\u4eca\u5929\u72b6\u6001\u597d\u4e0d\u597d\u201d\u2014\u2014\u72b6\u6001\u597d\u7684\u65f6\u5019\u4f60\u51e0\u4e4e\u662f\u5168\u573a\u7126\u70b9\uff0c\u72b6\u6001\u4e00\u822c\u65f6\u5bb9\u6613\u88ab\u8bef\u4f1a\u6210\u201c\u6ca1\u90a3\u4e48\u70ed\u60c5\u4e86\u201d\u3002", en: "A balanced field plus your natural social energy means your pull depends heavily on how you're doing that day \u2014 on a good day you're the center of the room, on an off day people misread it as you cooling off." },
  "magnetic|2": { zh: "\u793e\u4ea4\u80fd\u91cf+\u9ad8\u78c1\u573a\u662f\u6700\u5bb9\u6613\u88ab\u5927\u91cf\u4eba\u540c\u65f6\u559c\u6b22\u4e0a\u7684\u7ec4\u5408\u2014\u2014\u8fd9\u4e5f\u662f\u4f60\u6700\u5927\u7684\u8bfe\u9898\uff1a\u4f60\u9700\u8981\u82b1\u6bd4\u522b\u4eba\u66f4\u591a\u7684\u529b\u6c14\uff0c\u624d\u80fd\u5206\u6e05\u8c01\u662f\u771f\u7684\u5bf9\u4f60\uff0c\u8c01\u53ea\u662f\u88ab\u4f60\u7684\u201c\u70ed\u95f9\u201d\u5438\u5f15\u3002", en: "Social energy plus a strong field is the combination most likely to get many people drawn to you at once \u2014 which is also your real challenge: it takes more effort than most to tell who's into you, and who's just into the buzz around you." },
  "devoted|0": { zh: "\u6df1\u5ea6\u4e13\u4e00\u578b\u672c\u8eab\u5c31\u9700\u8981\u65f6\u95f4\u624d\u88ab\u611f\u77e5\u5230\uff0c\u52a0\u4e0a\u78c1\u573a\u504f\u5b89\u9759\uff0c\u8fd9\u4e2a\u7ec4\u5408\u51e0\u4e4e\u6ce8\u5b9a\u4f60\u4e0d\u9002\u5408\u5feb\u8282\u594f\u7684\u76f8\u5904\u65b9\u5f0f\u2014\u2014\u9700\u8981\u7ed9\u81ea\u5df1\u627e\u90a3\u79cd\u613f\u610f\u6162\u6162\u6765\u7684\u5173\u7cfb\u73af\u5883\uff0c\u800c\u4e0d\u662f\u52c9\u5f3a\u81ea\u5df1\u9002\u5e94\u201c\u901f\u914d\u201d\u3002", en: "A devoted style already needs time to register, and a quiet field compounds that \u2014 this combination almost rules out fast-paced dating. Look for people willing to go slow, rather than forcing yourself into a speed-dating rhythm." },
  "devoted|1": { zh: "\u4f60\u7684\u6c89\u6dc0\u611f\u5728\u72b6\u6001\u597d\u65f6\u5f88\u6253\u52a8\u4eba\uff0c\u72b6\u6001\u4e00\u822c\u65f6\u5bb9\u6613\u88ab\u5ffd\u7565\u800c\u4e0d\u662f\u88ab\u8ba8\u538c\u2014\u2014\u6bd4\u8d77\u201c\u88ab\u66f4\u591a\u4eba\u770b\u5230\u201d\uff0c\u4f60\u66f4\u9700\u8981\u7684\u662f\u201c\u88ab\u5bf9\u7684\u4eba\u770b\u5230\u7684\u65f6\u5019\uff0c\u522b\u9519\u8fc7\u201d\u3002", en: "Your steadiness moves people on a good day, and gets overlooked rather than disliked on an off one \u2014 what you need isn't more visibility, it's not missing it when the right person is actually looking." },
  "devoted|2": { zh: "\u6df1\u5ea6\u4e13\u4e00\u578b+\u9ad8\u78c1\u573a\u662f\u6bd4\u8f83\u5c11\u89c1\u7684\u7ec4\u5408\u2014\u2014\u4f60\u65e2\u6709\u8ba9\u4eba\u4e00\u5f00\u59cb\u5c31\u6ce8\u610f\u5230\u7684\u5438\u5f15\u529b\uff0c\u53c8\u6709\u8ba9\u4eba\u8d8a\u4e86\u89e3\u8d8a\u559c\u6b22\u7684\u540e\u52b2\uff0c\u8fd9\u4e2a\u7ec4\u5408\u771f\u6b63\u7684\u98ce\u9669\u662f\uff1a\u5bb9\u6613\u5438\u5f15\u5230\u53ea\u60f3\u8981\u201c\u5f00\u59cb\u90a3\u4efd\u65b0\u9c9c\u611f\u201d\u3001\u7559\u4e0d\u4f4f\u201c\u8d8a\u4e86\u89e3\u8d8a\u559c\u6b22\u201d\u8fd9\u90e8\u5206\u7684\u4eba\u3002", en: "Devoted plus a strong field is a fairly rare combination \u2014 you have both instant appeal and the kind that deepens over time. The real risk: attracting people who want the initial spark and never stick around for the part that actually deepens." },
  "gentle|0": { zh: "\u6e29\u548c\u4eb2\u548c\u529b\u672c\u8eab\u4e0d\u5f20\u626c\uff0c\u52a0\u4e0a\u78c1\u573a\u504f\u5b89\u9759\uff0c\u8fd9\u4e2a\u7ec4\u5408\u4f1a\u8ba9\u4f60\u5728\u4eba\u7fa4\u91cc\u5f88\u5bb9\u6613\u88ab\u5ffd\u7565\u2014\u2014\u4e0d\u662f\u6ca1\u6709\u9b45\u529b\uff0c\u662f\u9700\u8981\u4e3b\u52a8\u521b\u9020\u88ab\u6ce8\u610f\u5230\u7684\u673a\u4f1a\uff0c\u800c\u4e0d\u662f\u7b49\u522b\u4eba\u5148\u53d1\u73b0\u4f60\u3002", en: "A gentle warmth is already understated, and a quiet field compounds it \u2014 easy to get overlooked in a crowd. It's not a lack of appeal; you need to actively create chances to be noticed, not wait to be found." },
  "gentle|1": { zh: "\u4f60\u7684\u6e29\u548c\u5728\u72b6\u6001\u597d\u65f6\u4f1a\u88ab\u611f\u77e5\u6210\u201c\u5f88\u8212\u670d\u201d\uff0c\u72b6\u6001\u4e00\u822c\u65f6\u5bb9\u6613\u88ab\u5f53\u6210\u201c\u6ca1\u4ec0\u4e48\u5b58\u5728\u611f\u201d\u2014\u2014\u4f60\u7684\u8bfe\u9898\u4e0d\u662f\u8981\u66f4\u5916\u5411\uff0c\u662f\u8981\u8ba9\u81ea\u5df1\u5728\u8fd8\u4e0d\u9519\u7684\u72b6\u6001\u91cc\uff0c\u88ab\u770b\u89c1\u7684\u673a\u4f1a\u591a\u4e00\u70b9\u3002", en: "Your warmth reads as comforting on a good day, and as forgettable on an off one \u2014 your task isn't to become more outgoing, it's to get more visibility during the decent-but-not-great days." },
  "gentle|2": { zh: "\u6e29\u548c\u4eb2\u548c+\u9ad8\u78c1\u573a\u662f\u5f88\u8ba8\u559c\u7684\u7ec4\u5408\uff0c\u4f46\u4e5f\u6700\u5bb9\u6613\u8ba9\u4f60\u88ab\u8fc7\u5ea6\u6d88\u8017\u2014\u2014\u5f88\u591a\u4eba\u4f1a\u4e60\u60ef\u6027\u5730\u627e\u4f60\u503e\u8bc9\u3001\u4f9d\u8d56\u4f60\u7684\u5305\u5bb9\uff0c\u4f60\u9700\u8981\u7ec3\u4e60\u5206\u8fa8\u201c\u559c\u6b22\u6211\u201d\u548c\u201c\u9700\u8981\u6211\u7684\u5305\u5bb9\u201d\u8fd9\u4e24\u79cd\u9760\u8fd1\u3002", en: "Gentle warmth plus a strong field is an easy combination to like, and also the one most likely to drain you \u2014 people will habitually come to you to vent, leaning on your patience. You need to practice telling apart being liked from being needed for your patience." },
};


const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u6843\u82b1\u78c1\u573a\u6e90\u70b9", titleEn: "Where Your Field Begins", descZh: "\u4e94\u4e2a\u7ef4\u5ea6\u548c\u5438\u5f15\u529b\u98ce\u683c\u653e\u5728\u4e00\u8d77\uff0c\u5f62\u6210\u4e86\u600e\u6837\u7684\u6574\u4f53\u6c14\u573a\u2014\u2014\u4e0d\u662f\u9010\u6761\u7ffb\u8bd1\u5206\u6570\uff0c\u662f\u770b\u6574\u4f53\u5f62\u72b6\u3002", descEn: "Your five dimensions and attraction style together, forming your real overall field." },
  { titleZh: "\u5438\u5f15\u529b\u7c7b\u578b", titleEn: "Attraction Type", descZh: "\u5177\u4f53\u5c55\u5f00\u4f60\u7684\u5438\u5f15\u529b\u98ce\u683c\uff0c\u522b\u4eba\u5177\u4f53\u662f\u600e\u4e48\u88ab\u8fd9\u79cd\u98ce\u683c\u611f\u77e5\u5230\u7684\u2014\u2014\u8d8a\u5177\u4f53\u8d8a\u597d\uff0c\u4e0d\u662f\u6cdb\u6cdb\u800c\u8c08\u3002", descEn: "A concrete unpacking of your specific style \u2014 exactly how people pick up on it." },
  { titleZh: "\u60c5\u611f\u8868\u8fbe\u6a21\u5f0f", titleEn: "Emotional Expression Pattern", descZh: "\u4f60\u559c\u6b22\u4e00\u4e2a\u4eba\u65f6\uff0c\u5177\u4f53\u7684\u8868\u8fbe\u65b9\u5f0f\u662f\u76f4\u63a5\u3001\u884c\u52a8\u3001\u966a\u4f34\u8fd8\u662f\u7406\u89e3\u2014\u2014\u7ed3\u5408\u5177\u4f53\u7ef4\u5ea6\u5206\u6570\u8bf4\u660e\u3002", descEn: "How you actually show you're into someone \u2014 tied to your specific dimension scores." },
  { titleZh: "\u5173\u7cfb\u9700\u6c42\u5730\u56fe", titleEn: "Relationship Needs Map", descZh: "\u4f60\u5728\u5173\u7cfb\u91cc\u771f\u6b63\u9700\u8981\u7684\u662f\u7a33\u5b9a\u3001\u81ea\u7531\u3001\u6210\u957f\u8fd8\u662f\u4ea4\u6d41\uff0c\u7ed3\u5408\u5177\u4f53\u5206\u6570\u8bf4\u660e\u4e3a\u4ec0\u4e48\u3002", descEn: "What you genuinely need in a relationship \u2014 stability, freedom, growth, or exchange \u2014 and why." },
  { titleZh: "\u9690\u85cf\u9b45\u529b\u8282\u70b9", titleEn: "Hidden Charm Point", descZh: "\u7ed3\u5408\u5206\u6570\u6700\u9ad8\u4f46\u5bb9\u6613\u88ab\u81ea\u5df1\u5ffd\u7565\u7684\u90a3\u4e2a\u7ef4\u5ea6\uff0c\u6307\u51fa\u4e00\u4e2a\u4f60\u81ea\u5df1\u53ef\u80fd\u6ca1\u610f\u8bc6\u5230\u7684\u9b45\u529b\u70b9\u3002", descEn: "Tied to your highest, most overlooked dimension \u2014 a charm point you likely don't know you have." },
  { titleZh: "\u5173\u7cfb\u4e92\u52a8\u6a21\u5f0f", titleEn: "Relationship Interaction Pattern", descZh: "\u8fdb\u5165\u5173\u7cfb\u65f6\uff0c\u4f60\u662f\u4e3b\u52a8\u9760\u8fd1\u3001\u6162\u6162\u89c2\u5bdf\u8fd8\u662f\u6df1\u5ea6\u8fde\u63a5\u2014\u2014\u5177\u4f53\u8bf4\u660e\u8fd9\u79cd\u6a21\u5f0f\u7684\u753b\u9762\u3002", descEn: "Whether you lean in fast, watch first, or go deep immediately \u2014 painted specifically." },
  { titleZh: "\u5438\u5f15\u529b\u6210\u957f\u65b9\u5411", titleEn: "Attraction Growth Direction", descZh: "\u4e0d\u662f\u53d8\u6210\u522b\u4eba\u559c\u6b22\u7684\u6837\u5b50\uff0c\u662f\u66f4\u5b8c\u6574\u5730\u8868\u8fbe\u81ea\u5df1\u2014\u2014\u7ed3\u5408\u4f60\u6700\u4f4e\u5206\u7ef4\u5ea6\uff0c\u7ed9\u51fa\u5177\u4f53\u53ef\u64cd\u4f5c\u7684\u65b9\u5411\u3002", descEn: "Not about becoming likeable \u2014 about expressing yourself more fully. Tied to your lowest score, with a real direction." },
  { titleZh: "\u60c5\u611f\u963b\u788d\u5730\u56fe", titleEn: "Emotional Obstacle Map", descZh: "\u7ed3\u5408\u5177\u4f53\u6570\u636e\uff0c\u6307\u51fa\u4f60\u5728\u5173\u7cfb\u91cc\u6700\u5bb9\u6613\u51fa\u73b0\u7684\u5177\u4f53\u963b\u788d\u6a21\u5f0f\u2014\u2014\u8981\u5177\u4f53\uff0c\u4e0d\u8981\u7b3c\u7edf\u3002", descEn: "The exact obstacle pattern most likely to show up for you \u2014 named specifically, not vaguely." },
  { titleZh: "\u7406\u60f3\u8fde\u63a5\u6a21\u5f0f", titleEn: "Ideal Connection Style", descZh: "\u6839\u636e\u4f60\u7684\u5177\u4f53\u7ed3\u6784\uff0c\u66f4\u5bb9\u6613\u5728\u4ec0\u4e48\u6837\u7684\u5173\u7cfb\u6a21\u5f0f\u91cc\u8212\u5c55\u2014\u2014\u5177\u4f53\u8bf4\u660e\u4e3a\u4ec0\u4e48\u3002", descEn: "The relationship style you're most likely to thrive in, and specifically why." },
  { titleZh: "\u6843\u82b1\u78c1\u573a\u6545\u4e8b", titleEn: "A Symbolic Story", descZh: "\u7528\u6709\u753b\u9762\u611f\u7684\u8c61\u5f81\u6bd4\u55bb\uff0c\u63cf\u7ed8\u4f60\u7684\u5438\u5f15\u529b\u8d28\u5730\u2014\u2014\u4e0d\u662f\u7a7a\u6d1e\u7684\u6bd4\u55bb\uff0c\u8981\u5177\u4f53\u3002", descEn: "A vivid, specific metaphor for the texture of your attraction \u2014 not a generic image." },
  { titleZh: "\u6843\u82b1\u78c1\u573a\u603b\u7ed3", titleEn: "Field Summary", descZh: "\u6536\u5c3e\u5fc5\u987b\u6307\u5411\u524d\u9762\u63d0\u5230\u8fc7\u7684\u5177\u4f53\u7ef4\u5ea6\u6216\u5224\u65ad\uff0c\u4e0d\u662f\u9760\u60c5\u7eea\u8bcd\u6536\u5c3e\u3002", descEn: "A closing tied to a specific dimension already discussed \u2014 not a warm-and-fuzzy sendoff." },
];

export default function RomanceFlow() {
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

      const res = await fetch("/api/romance/save", {
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
        window.location.href = `/romance/full?id=${data.id}`;
        return;
      }
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=romance-report&submissionId=${data.id}&name=${encodeURIComponent(unlockName)}&redirect=${encodeURIComponent(`/romance/full?id=${data.id}`)}`;
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
      const res = await fetch("/api/romance/calc", {
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
        fileName: "灵犀桃花磁场指数.pdf",
        // 粉桃花主题——卡片和PDF背景都换成更接近"粉/玫瑰"色调的暖色，
        // 跟品牌粉色（rose）和桃花海报插画呼应，不再是偏冷、发黑的
        // 深酒红色。
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
    const r = 70, c = 2 * Math.PI * r;
    const pct = result.score / 100;

    return (
      <>
      <div ref={reportRef} className="mx-auto max-w-xl px-6 py-16">
        <div className="flex items-center justify-between gap-3 lx-glass-romance px-6 py-4 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber/90">
            <Bi zh="灵犀场 · 桃花磁场指数" en="Lingxi Field · Romance Magnetism Index" />
          </p>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="flex shrink-0 items-center gap-2 rounded-sm border border-rose/40 px-4 py-2 text-xs uppercase tracking-widest2 text-rose transition hover:border-rose hover:text-bone disabled:opacity-50"
          >
            {downloading ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center lx-glass-romance p-8">
          <svg viewBox="0 0 180 180" className="w-44" style={{ filter: "drop-shadow(0 0 14px rgba(255,143,209,0.45))" }}>
            <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={r} fill="none" stroke="#FF8FD1" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${c}`} strokeDashoffset={`${c * (1 - pct)}`}
              transform="rotate(-90 90 90)"
            />
            <text x="90" y="82" textAnchor="middle" fontSize="40" fill="#F4EFFF" fontFamily="serif">{result.score}</text>
            <text x="90" y="108" textAnchor="middle" fontSize="12" fill="#E8B3D8">/ 100</text>
          </svg>
          <p className="mt-2 text-xs text-bone-dim">
            {t("金星", "Venus")} {langEn ? result.venusSignEn : result.venusSignZh}
            {result.hasTaoHua && <> · {t("命带桃花", "Chart carries Peach Blossom")}</>}
          </p>
        </div>

        <div className="mt-4 lx-glass-romance p-6">
          <p className="text-base leading-9 text-bone-dim">{t(OVERALL[band(result.score)].zh, OVERALL[band(result.score)].en)}</p>
        </div>

        <div className="mt-4 rounded-sm border border-amber/20 bg-amber/5 p-6">
          <p className="text-sm uppercase tracking-widest2 text-amber"><Bi zh={STYLE_LABEL[result.style].zh} en={STYLE_LABEL[result.style].en} /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">{t(STYLE_TEXT[result.style].zh, STYLE_TEXT[result.style].en)}</p>
        </div>

        {STYLE_BAND_INSIGHT[`${result.style}|${band(result.score)}`] && (
          <div className="mt-4 lx-glass-romance p-6">
            <p className="text-sm uppercase tracking-widest2 text-bone"><Bi zh="这个风格 × 这个磁场强度，具体会怎样" en="This Style × This Field Strength" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              {t(STYLE_BAND_INSIGHT[`${result.style}|${band(result.score)}`].zh, STYLE_BAND_INSIGHT[`${result.style}|${band(result.score)}`].en)}
            </p>
          </div>
        )}

        {result.hasTaoHua && (
          <div className="mt-4 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-sm uppercase tracking-widest2 text-lattice"><Bi zh="命带桃花" en="Peach Blossom in Your Chart" /></p>
            <p className="mt-2 text-base leading-8 text-bone-dim">
              <Bi
                zh={`你的${result.foundIn.join("、")}上，带着传统命理里说的「桃花」地支（${result.taohuaBranch}）——这是命理古法里，专门用来判断人际吸引力是否容易被外界感知到的一条规则，不是说你的关系必然如何，是说你的吸引力，天生就更容易被人注意到。`}
                en={`Your ${result.foundIn.join(", ")} carries what classical Chinese astrology calls a "Peach Blossom" branch (${result.taohuaBranch}) — a traditional marker for interpersonal magnetism that's easily noticed by others. It doesn't determine your relationships; it means your appeal tends to be visible by nature.`}
              />
            </p>
          </div>
        )}

        <div className="mt-4 lx-glass-romance p-6">
          <p className="text-sm uppercase tracking-widest2 text-lattice"><Bi zh="这个分数是怎么来的" en="Where This Score Comes From" /></p>
          <p className="mt-2 text-base leading-8 text-bone-dim">
            <Bi
              zh="不是临场编的。灵犀场底层是一套「生命向量引擎」——先用真实天文数据（此刻行星在黄道上的精确位置）和真实历法数据（你的四柱八字），算出一组固定的数字，人格倾向、情感深度、社交驱动这些维度，全部是先算出分数，场域才根据这些已经算好的数字去写解读，不是场域自己决定要不要说你「有吸引力」。同一份出生数据，任何时候重新算，前面的分数都是一样的——这是它跟一般算命网站最大的不同：别的网站是「直接问、直接给答案」，这里是「先算出结构，场域只负责讲清楚这个结构」。这个桃花磁场分数，是从你完整命盘里，只抽出跟「吸引力」相关的这一部分。"
              en="This isn't improvised. Underneath, Lingxi Field runs on a life-vector engine — real astronomical data (the planets' exact positions right now) and real calendrical data (your Bazi pillars) are used to compute a fixed set of numbers first — personality tendencies, emotional depth, social drive — before any text gets written. The field writes based on numbers already computed; it doesn't decide on its own whether to call you magnetic. Recompute the same birth data anytime, and the underlying scores come out identical. That's the core difference from a typical fortune-telling site: they ask a question and hand you an answer directly; here, the structure is computed first, and the field only explains it. This magnetism score is pulled from just the attraction-related slice of your full chart."
            />
          </p>
        </div>

        <div className="mt-6 lx-glass-romance px-6 py-3 text-center">
          <p className="text-sm text-bone-dim">
            <Bi zh="这是一份自我探索与反思的参考，不是关系预言。" en="This is a reference for self-reflection, not a prophecy about your relationships." />
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-xl px-6">
        <div className="lx-glass-romance p-6 text-center">
          <p className="font-display text-sm uppercase tracking-widest2 text-bone">
            <Bi zh="想看得更深？" en="Want to go deeper?" />
          </p>
          <p className="mt-2 text-sm leading-7 text-bone-dim">
            <Bi
              zh="这个分数背后，还有一份完整档案——五个磁场维度、吸引力风格、命理桃花星逐一展开，成一份可以下载、永久保存的深度报告。"
              en="Behind this score is a full archive — your five field dimensions, attraction style, and traditional chart signals, unfolded into a downloadable report you keep for life."
            />
          </p>

          <div className="mt-6 space-y-5 border-t border-white/10 pt-6 text-left">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-bone">
              <Bi zh="完整档案会逐一展开" en="What the Full Archive Unfolds" />
            </p>
            {TEASER_CHAPTERS.map((c, i) => (
              <div key={i}>
                <p className="font-display text-sm text-bone"><span className="text-rose">{String(i + 1).padStart(2, "0")}</span> · <Bi zh={c.titleZh} en={c.titleEn} /></p>
                <p className="mt-1.5 text-sm leading-7 text-bone-dim">
                  <Bi zh={c.descZh} en={c.descEn} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* v264：姓名输入框和解锁按钮之前压在上面这块带真实报告封面图
            背景的卡片里——那张封面图底部本来就印着"lingxifield.com"
            这类落款文字，输入框叠上去，两边文字互相打架，看不清楚。
            这里拆成单独一块纯色玻璃面板，不再压在任何背景图上。 */}
        <div className="lx-glass-romance mt-4 p-6 text-center">
          <input
            type="text"
            value={unlockName}
            onChange={(e) => setUnlockName(e.target.value)}
            placeholder={t("你的名字（选填）", "Your name (optional)")}
            className="w-full rounded-sm border border-white/15 bg-transparent px-4 py-2 text-center text-sm text-bone outline-none focus:border-rose/60"
          />
          <button
            onClick={unlock}
            disabled={unlocking}
            className="mt-4 w-full bg-rose px-8 py-3 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
          >
            {unlocking ? <Bi zh="准备中…" en="Preparing…" /> : <Bi zh={`展开桃花磁场档案 · ¥${getProduct("romance-report")?.priceRmb}`} en={`Unfold the Full Attraction Archive · $${getProduct("romance-report")?.priceUsd}`} />}
          </button>
          {error && <ErrorWithLoginPrompt error={error} className="mt-3" />}
        </div>
      </div>

      {/* v261：这段"查看完整生命图谱"的引导，之前排在1-11点清单前面，
          这次挪到解锁按钮之后。 */}
      <div className="mx-auto mt-6 max-w-xl px-6">
        <div className="lx-glass-romance p-6 text-center">
          <p className="text-base leading-8 text-bone-dim">
            <Bi
              zh="同一份命盘还能算出：你的生命韧性指数、你的财富来源类型、你内在最核心的矛盾是什么——这些现在都还没被解读。完整生命图谱会把这些维度全部展开，交叉引用同一组数据，不是另外重新算一份。"
              en="The same chart also determines your resilience index, your wealth archetype, and the core tension at your center — none of that has been unpacked yet. The full Life Map expands all of it, cross-referencing the same underlying data, not a separate calculation."
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
          text={t("我测了灵犀场的桃花磁场指数，去看看你自己的：", "I got my Lingxi Field Romance Magnetism reading — check out your own:")}
          url="https://lingxifield.com/romance"
          label={{ zh: "分享这份结果", en: "Share this result" }}
        />
      </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="lx-glass-romance p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-widest2 text-amber/90">
          <Bi zh="灵犀场 · 桃花磁场指数" en="Lingxi Field · Romance Magnetism Index" />
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
          <Bi zh="你的吸引力，正在向世界传递什么？" en="What is your magnetism telling the world?" />
        </h1>
        <p className="mt-4 text-base leading-8 text-bone-dim">
          <Bi
            zh="每个人都有自己的吸引方式——有人靠表达，有人靠温度，有人无需刻意靠近，也会让别人感受到他的存在。吸引力不仅是外在表现，更是一种生命互动方式。场域读取你的生命结构，探索你的吸引力来源、你的关系连接模式、你容易被哪类人感受到，以及你在人际互动中的独特频率。了解自己的磁场，不是为了证明「有没有桃花」，而是看见你正在如何与世界建立连接——即时呈现，不需要登录。"
            en="Everyone has their own way of drawing people in — some through expression, some through warmth, some simply by being present. Magnetism isn't only about how you appear; it's a way of interacting with life. The field reads your structure to explore where your pull comes from, how you connect, who tends to feel it, and your own frequency in how you meet people. This isn't about proving you 'have romance luck' — it's about seeing how you're already connecting with the world, shown to you right away, no sign-in needed."
          />
        </p>
      </div>

      <div className="mt-6 lx-glass-romance p-6">
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
        <div className="mt-4 lx-glass-romance p-4">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !year || !month || !day}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="测出我的桃花磁场指数" en="Get My Romance Magnetism Index" />}
      </button>
      <FaqSection items={ROMANCE_FAQ} />
    </div>
  );
}
