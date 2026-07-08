// ────────────────────────────────────────────────────────────────
//  显化案例池（无限符号轮播的数据源）
//  —— 每条：tagZh/tagEn 领域 · zh/en 正文 · byZh/byEn 署名
//
//  ⚠️ 这些是示例文案，用于演示轮播效果。正式对外前，
//     请把它们逐条替换成真实的显化反馈，
//     不要把虚构内容当作真实用户评价展示。
//     健康类只描述放松/睡眠/精力等主观感受，不涉及疾病与疗效承诺。
//
//  想增减：直接在数组里加/删对象即可，轮播与光点数量会自动跟着变。
// ────────────────────────────────────────────────────────────────
export type ManifestStory = {
  tagZh: string;
  tagEn: string;
  zh: string;
  en: string;
  byZh: string;
  byEn: string;
};

const BY_ZH = "一位灵犀践行者";
const BY_EN = "A Lingxi practitioner";

const raw: [string, string, string, string][] = [
  ["金钱", "Abundance", "连续 21 天写现实回路后，一个搁置半年的合作主动找上门，数字刚好是我写下的那个。", "After 21 days of writing my reality loop, a deal stalled for half a year came to me — the exact figure I'd written."],
  ["关系", "Relationship", "我没有去追赶，只是每天活成「已经被爱」的版本。三周后，那个人先开了口。", "I stopped chasing and simply lived as the version already loved. Three weeks later, they reached out first."],
  ["健康", "Wellbeing", "量子暂停呼吸成了我睡前的锚。焦虑退潮的那晚，我第一次一觉到天亮。", "The quantum pause became my anchor at night. The evening the anxiety eased, I slept through for the first time."],
  ["命运", "Path", "反复出现的那个梦，在解梦里读懂后就停了。它一直在提醒我该转的那个弯。", "The recurring dream stopped once I understood it. It had been pointing at the turn I needed to take."],
  ["心灵", "Inner", "上升心经练到第 9 天，我不再急着改变什么，一切反而开始对齐。", "By day nine of the Ascending Heart, I stopped rushing to change things — and they began to align."],
  ["事业", "Work", "面试前，我先在意识里坐进了那个工位。两天后，录用电话真的来了。", "Before the interview I sat at that desk in my mind. Two days later, the offer call actually came."],
  ["机缘", "Synchronicity", "反复看见同一组数字，跟着那份牵引走，遇见了后来一起共事的人。", "The same numbers kept appearing. Following the pull, I met the person I'd later work alongside."],
  ["自由", "Freedom", "写下「轻盈地生活」三周后，压了我三年的那件事，忽然有了退路。", "Three weeks after writing 'live lightly,' the thing that had weighed on me for years suddenly had a way out."],
  ["金钱", "Abundance", "我停止盯着账户余额，开始每天感谢已有的。月底，一笔意外收入补上了缺口。", "I stopped staring at my balance and began thanking what I had. By month's end, an unexpected sum filled the gap."],
  ["关系", "Relationship", "和母亲的心结，在一次「上升心经」后松开了。我们十年来第一次好好说了话。", "A knot with my mother loosened after one Ascending Heart session. We spoke properly for the first time in ten years."],
  ["事业", "Work", "把「我已经是那个岗位的人」写进日记两周，内部转岗的机会就落到了我头上。", "Two weeks of journaling 'I already hold that role,' and the internal transfer landed on me."],
  ["创造", "Creation", "搁置很久的作品，在梦里看清了结构。醒来一口气写完了它。", "The long-shelved piece revealed its shape in a dream. I woke and finished it in one sitting."],
  ["健康", "Wellbeing", "每天十分钟呼吸练习后，那种胸口发紧的感觉一点点退去，人松下来了。", "After ten minutes of breathwork each day, the tightness in my chest slowly receded and I softened."],
  ["居所", "Home", "我把想要的家一笔笔写下来。看房那天，走进去就认出了它。", "I wrote out the home I wanted, detail by detail. On viewing day, I walked in and recognized it."],
  ["心灵", "Inner", "不再向外求答案后，我在自己的安静里，第一次清楚地听见了内在的声音。", "When I stopped seeking answers outside, I heard my inner voice clearly for the first time, in my own quiet."],
  ["命运", "Path", "那个一直逃避的决定，在场域里想清楚后，反而成了我最轻松的一步。", "The decision I kept avoiding — once seen clearly in the field — became my lightest step yet."],
  ["金钱", "Abundance", "把「匮乏」的旧程序改写成「足够」，我竟敢开口谈了从没敢开的价。", "Rewriting the old 'lack' program into 'enough,' I dared to name a price I never had before."],
  ["关系", "Relationship", "我先在心里原谅了他。那周,他发来了迟到多年的道歉。", "I forgave him first, inwardly. That week, an apology years overdue arrived from him."],
  ["机缘", "Synchronicity", "只是随口说想学的东西，第二天就有人把入门的门递到了我面前。", "I casually mentioned wanting to learn it. The next day, someone handed me the doorway in."],
  ["自由", "Freedom", "松开「必须证明自己」的执念后，我反而做出了这些年最好的成果。", "Letting go of 'I must prove myself,' I produced my best work in years."],
  ["学业", "Study", "考前把「我从容作答」演练成画面，进考场时，紧张真的没来。", "I rehearsed 'I answer with ease' as a vivid scene. Walking in, the nerves simply didn't show up."],
  ["健康", "Wellbeing", "跟着节律呼吸一段时间，久违的清晨精力回来了，起床不再费劲。", "After a stretch of rhythmic breathing, my morning energy returned — waking up stopped being a struggle."],
  ["事业", "Work", "把项目「已经顺利交付」的画面每天过一遍，卡住的环节一个个自己通了。", "Running the scene of 'already delivered' daily, the stuck pieces resolved themselves one by one."],
  ["创造", "Creation", "灵感枯竭时我停下来只是呼吸。安静里，整段旋律自己浮了上来。", "Creatively dry, I stopped and just breathed. In the stillness, a whole melody surfaced on its own."],
  ["家庭", "Family", "我先让自己安定下来，家里的气氛竟跟着松了，争执少了大半。", "I settled myself first, and the whole household eased — the quarrels dropped by half."],
  ["心灵", "Inner", "写下「我信任时机」之后，那种非得掌控一切的焦躁，慢慢就散了。", "After writing 'I trust the timing,' the restless need to control everything gradually dissolved."],
  ["命运", "Path", "一个陌生城市在梦里反复出现。一年后，我因为一份好工作搬了过去。", "A strange city kept recurring in dreams. A year later, a good job moved me there."],
  ["金钱", "Abundance", "我不再把钱当敌人，开始当作流动的能量。收入的通道也跟着松开了。", "I stopped treating money as an enemy and saw it as flowing energy. The channels loosened too."],
  ["关系", "Relationship", "把「值得被善待」写进现实回路，我身边慢慢只剩下让我安心的人。", "Writing 'worthy of kindness' into my loop, only the people who feel safe slowly remained around me."],
  ["自由", "Freedom", "辞职前我在意识里活了整整一个月的自由。真辞的那天，心里全是笃定。", "Before quitting, I lived a full month of freedom in my mind. The day I did, I felt only certainty."],
  ["机缘", "Synchronicity", "翻开的那本书，正好停在我此刻最需要的那句话上。", "The book fell open to the exact sentence I most needed in that moment."],
  ["健康", "Wellbeing", "把「身体值得被好好照顾」当成信念，我第一次真心愿意早睡、好好吃饭。", "Holding 'my body deserves good care,' I truly wanted, for once, to sleep early and eat well."],
  ["事业", "Work", "我把理想客户的样子写清楚。一个月内，几乎一模一样的人发来了邀约。", "I described my ideal client precisely. Within a month, almost that exact person sent an invitation."],
  ["学业", "Study", "反复演练「我已经懂了」，那门一直学不进的课，忽然就通了。", "Rehearsing 'I already get it,' the subject I could never absorb suddenly clicked."],
  ["创造", "Creation", "我停止评判自己的作品，只是持续地做。回头一看，风格自己长成了。", "I stopped judging my work and just kept making. Looking back, a style had grown on its own."],
  ["家庭", "Family", "为孩子先修好自己的情绪后，他也奇妙地平静了下来。", "When I tended my own emotions first, for my child, he mysteriously grew calm too."],
  ["心灵", "Inner", "「我本自具足」这句话练久了，那个总觉得缺点什么的洞，被填满了。", "Practiced long enough, 'I am already whole' filled the hole that always felt like something missing."],
  ["命运", "Path", "长久的迷茫在一次深呼吸后散开，我清楚地知道了下一步该往哪走。", "A long fog cleared after one deep breath, and I knew exactly where my next step led."],
  ["金钱", "Abundance", "我把「先给予」当练习。付出的当月，回流的比我想象的多。", "I practiced 'give first.' The month I gave, more returned than I'd imagined."],
  ["关系", "Relationship", "不再急着被理解，我先去理解对方。关系反而先暖了起来。", "Instead of rushing to be understood, I understood them first. The bond warmed sooner for it."],
  ["自由", "Freedom", "写下「我不必取悦所有人」，胸口那块压了很久的石头，落地了。", "Writing 'I needn't please everyone,' the stone long pressing on my chest finally set down."],
  ["机缘", "Synchronicity", "错过的那班车，让我遇见了改变整件事走向的一次谈话。", "The train I missed placed me in a conversation that changed the whole course of things."],
  ["健康", "Wellbeing", "把睡前刷手机换成三分钟呼吸，两周后，入睡快得让我自己都吃惊。", "Swapping bedtime scrolling for three minutes of breath, in two weeks I fell asleep faster than I believed."],
  ["事业", "Work", "我把「合作而非竞争」设为底色，对手变成了后来最重要的伙伴。", "I set 'collaborate, not compete' as my base note; a rival became my most important partner."],
  ["居所", "Home", "心里放下「留不住」的恐惧后，一处久等的房子，条件忽然全谈拢了。", "Once I released the fear of 'it won't last,' a long-awaited place suddenly came together on every term."],
  ["创造", "Creation", "我允许作品先「难看」，反而越做越顺，第一次做完了想做很久的东西。", "I let the work be 'ugly' first, and it flowed — for once I finished what I'd long wanted to make."],
  ["心灵", "Inner", "把每天的小对齐当成练习，某天回头，才发现整个人都变轻了。", "Treating each small alignment as practice, I turned around one day to find my whole self lighter."],
  ["命运", "Path", "梦里那扇门我推开了。醒来后，现实里对应的那扇，也刚好向我敞开。", "In the dream I pushed the door open. Awake, its real counterpart happened to open for me too."],
  ["金钱", "Abundance", "停止和别人比较后，我才看清自己真正想要多少——然后，它来得很稳。", "When I stopped comparing, I saw how much I truly wanted — and then it arrived, steadily."],
  ["关系", "Relationship", "我先成为那个我想遇见的人。没多久，同频的人就出现了。", "I became the person I hoped to meet first. Before long, someone on the same frequency appeared."],
  ["自由", "Freedom", "把「时间是够的」写进信念，那种被追赶的慌乱，慢慢就退场了。", "Writing 'there is enough time' into belief, the hunted feeling of rushing quietly left."],
  ["机缘", "Synchronicity", "心里刚问出一个问题，答案就从一段陌生人的闲聊里递了过来。", "The moment I asked inwardly, the answer arrived through a stranger's passing words."],
  ["健康", "Wellbeing", "把「我与身体是一队的」当真，那些自我苛责的念头，一点点安静了。", "Taking 'my body and I are one team' seriously, the self-critical thoughts slowly quieted."],
  ["事业", "Work", "我不再等「准备好」，先动手做起来。机会是在路上，才一个个出现的。", "I stopped waiting to feel 'ready' and began. The chances appeared only once I was moving."],
  ["学业", "Study", "把「学习是探索不是任务」重写进心里，我第一次因为想懂而学。", "Rewriting 'learning is exploration, not a task,' I studied from wanting to understand for the first time."],
  ["家庭", "Family", "先照顾好自己这盏灯，家里其他的灯，竟一盏盏也亮了起来。", "Tending my own lamp first, the other lamps in the house lit, one after another."],
  ["心灵", "Inner", "在一次长长的暂停里，我终于把「不够好」这句旧咒语，还了回去。", "In one long pause, I finally handed back the old spell of 'not good enough.'"],
  ["命运", "Path", "顺着那股说不清的牵引搬了城，后来发现，一切都在那里等着我。", "Following an unnameable pull, I moved cities — and found everything had been waiting there."],
  ["金钱", "Abundance", "我把「配得上富足」练成日常，机会来敲门时，我这次没有再躲。", "I practiced 'worthy of abundance' daily; when opportunity knocked, this time I didn't hide."],
  ["关系", "Relationship", "先把爱给自己之后，我不再从别人那里讨要它——关系反而稳了。", "Once I gave love to myself first, I stopped begging it from others — and the bond steadied."],
  ["创造", "Creation", "把「我是通道，不是源头」记在心里，创作时的用力和焦虑都松开了。", "Holding 'I am the channel, not the source,' the strain and anxiety of creating let go."],
  ["自由", "Freedom", "写下「我可以重新选择」，那条以为只能一直走的路，忽然有了岔口。", "Writing 'I can choose again,' the road I thought was the only one suddenly forked."],
  ["健康", "Wellbeing", "每天几次刻意的深呼吸后，那种一整天绷着的疲惫，明显轻了。", "After a few deliberate deep breaths each day, the all-day braced-up fatigue clearly eased."],
  ["机缘", "Synchronicity", "临时改的行程，让我恰好赶上了那场后来改变方向的相遇。", "A last-minute change of plans put me right in time for the meeting that redirected everything."],
  ["心灵", "Inner", "当我真正相信「现实会随意识对齐」，我便不再那么用力地推它了。", "When I truly believed 'reality aligns with consciousness,' I stopped pushing it so hard."],
  ["命运", "Path", "把这些年反复出现的心结一道道走过之后，我终于看清：每一面镜子照的都是我自己。", "Having walked through the recurring knots of these years, one by one, I saw at last: every mirror had been reflecting me."],
];

export const STORIES: ManifestStory[] = raw.map(([tagZh, tagEn, zh, en]) => ({
  tagZh,
  tagEn,
  zh,
  en,
  byZh: BY_ZH,
  byEn: BY_EN,
}));
