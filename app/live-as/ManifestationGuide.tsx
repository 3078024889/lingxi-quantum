import Link from "next/link";
import Bi from "@/components/Bi";

type GuideChapter = {
  id: string;
  number: string;
  glyph: string;
  titleZh: string;
  titleEn: string;
  introZh: string;
  introEn: string;
  sections: Array<{
    titleZh: string;
    titleEn: string;
    pointsZh: string[];
    pointsEn: string[];
  }>;
  quoteZh: string;
  quoteEn: string;
};

const CHAPTERS: GuideChapter[] = [
  {
    id: "method",
    number: "01",
    glyph: "◎",
    titleZh: "先看清完整路径",
    titleEn: "See the whole path first",
    introZh: "意识显化不是空想未来，而是把想要的生活写成今天的你：先稳定内在，再让现实行动慢慢跟上。",
    introEn: "Manifestation is not passive wishing. Write the life you want as the self you are practising today, steady the inner state, then let real action follow.",
    sections: [
      {
        titleZh: "进入后这样做",
        titleEn: "The daily sequence",
        pointsZh: ["打开意识显化入口。", "进入「已经拥有」的状态。", "写下今天我正在做什么。", "写下此刻我的感受。", "使用现在时、肯定句与具体细节。", "每天签到 5–10 分钟，持续记录。"],
        pointsEn: ["Open Manifestation.", "Enter the state of already having.", "Write what you are doing today.", "Write how you feel now.", "Use present tense, affirmative language and concrete detail.", "Return for a 5–10 minute check-in each day."],
      },
      {
        titleZh: "为什么这样练习",
        titleEn: "Why this practice is structured this way",
        pointsZh: ["重复进入同一状态，能训练注意力不再只停留在缺失与等待。", "持续写下「正在发生」的生活，让注意、感受与行动逐步一致。", "当内在版本更清晰，现实中的选择、关系与机会也更容易被看见和回应。"],
        pointsEn: ["Repeatedly entering one state trains attention away from lack and waiting.", "Writing life as it is unfolding helps attention, feeling and action become more coherent.", "A clearer inner version can make real choices, relationships and opportunities easier to notice and respond to."],
      },
      {
        titleZh: "如果暂时没有明显变化",
        titleEn: "When change is not yet obvious",
        pointsZh: ["缩小目标，从一个具体变化开始。", "连续记录至少 7–21 天，不频繁更换愿景。", "回看现实回路，先辨认情绪、行动、关系与机会中已经开始变化的部分。"],
        pointsEn: ["Reduce the scope and begin with one concrete change.", "Stay with the same vision for at least 7–21 days.", "Review the Reality Loop for changes already beginning in emotion, action, relationships or opportunity."],
      },
    ],
    quoteZh: "先稳定内在，再让现实慢慢跟上。",
    quoteEn: "Steady the inner world, then let reality catch up through action.",
  },
  {
    id: "already-have",
    number: "02",
    glyph: "◌",
    titleZh: "第一步：进入「已经拥有」的状态",
    titleEn: "Step one: enter the state of already having",
    introZh: "先进入那个版本，再开始书写。不是假装结果已经发生，而是暂时离开“我还缺什么”，感受那个版本会如何生活。",
    introEn: "Enter the version before you write. This is not pretending an outcome is guaranteed; it is a short shift away from lack toward how that version would live.",
    sections: [
      {
        titleZh: "开始前的十秒",
        titleEn: "The first ten seconds",
        pointsZh: ["打开「意识显化」，安静十秒。", "想象你已经生活在目标现实里。", "不要先盘点还缺什么，只感受：它已经属于我时，我会怎样存在。"],
        pointsEn: ["Open Manifestation and become still for ten seconds.", "Imagine living inside the reality you are moving toward.", "Do not begin by listing what is missing; notice how you would be if it already belonged in your life."],
      },
      {
        titleZh: "问自己的两句话",
        titleEn: "Two questions",
        pointsZh: ["今天的我，正在做什么？", "此刻的我，是什么感受？", "把答案写下来，不用夸张，只要真实而笃定。"],
        pointsEn: ["What am I doing today?", "How do I feel in this moment?", "Write the answers without exaggeration—only truth and steadiness."],
      },
      {
        titleZh: "为什么先进入状态",
        titleEn: "Why state comes first",
        pointsZh: ["人更容易回到反复体验过的状态。", "当你先成为那个版本，现实中的选择会开始围绕它重新组织。", "显化的起点不是索取，而是对齐。"],
        pointsEn: ["We return more easily to states we have repeatedly experienced.", "When you practise being that version, your choices can begin to organise around it.", "The starting point is not demanding an outcome; it is alignment."],
      },
    ],
    quoteZh: "当你真正生活在已经拥有的频率里，一切都会开始不同。",
    quoteEn: "When you genuinely live from the state of having, your next choices begin to change.",
  },
  {
    id: "write-today",
    number: "03",
    glyph: "▤",
    titleZh: "第二步：把未来写成今天",
    titleEn: "Step two: write the future as today",
    introZh: "把遥远愿望改写成今天能被身体、语言与行动承接的现实叙述。",
    introEn: "Turn a distant wish into a present account that your body, language and actions can carry today.",
    sections: [
      {
        titleZh: "从等待式语言，转向正在发生",
        titleEn: "Move from waiting language to lived language",
        pointsZh: ["不要写「我希望以后可以……」；写「我正在稳定地活出这个版本」。", "不要写「如果有一天我能……」；写「今天的我，自然地在做这件事」。", "不要写「等条件成熟了我就……」；写「我已经在这样的现实里行动」。", "不要写「我想要，但现在还没有……」；写「我的感受是平静、笃定、被支持」。"],
        pointsEn: ["Instead of “I hope I can someday,” write “I am steadily living this version.”", "Instead of “If one day I can,” write “Today I am naturally doing this.”", "Instead of “When conditions are ready,” write “I am already acting inside this reality.”", "Instead of “I want it but do not have it,” name a grounded feeling: calm, certain, supported."],
      },
      {
        titleZh: "书写原则",
        titleEn: "Writing principles",
        pointsZh: ["使用现在时。", "使用肯定句。", "写具体动作与具体感受。", "越贴近真实，越容易长期坚持。"],
        pointsEn: ["Use present tense.", "Use affirmative language.", "Name concrete actions and feelings.", "The closer it is to truth, the easier it is to sustain."],
      },
      {
        titleZh: "这样写的原因",
        titleEn: "Why this wording matters",
        pointsZh: ["持续用今天的语气书写未来，会逐渐把注意力从愿望拉回当下可执行的现实。"],
        pointsEn: ["Writing the future in today’s language gradually returns attention from wishful distance to present, executable reality."],
      },
    ],
    quoteZh: "不是写下你想要的生活，而是写下你已经在过的生活。",
    quoteEn: "Do not only describe the life you want; practise describing the life you are beginning to live.",
  },
  {
    id: "action-feeling",
    number: "04",
    glyph: "↗",
    titleZh: "第三步：写下行动，也写下感受",
    titleEn: "Step three: write action and feeling",
    introZh: "行动让愿景落地，感受让你辨认自己是否真正进入了那个版本。两者缺一，记录就容易变成计划或想象。",
    introEn: "Action grounds the vision; feeling shows whether you have actually entered that version. Without both, a record easily becomes only a plan or a fantasy.",
    sections: [
      {
        titleZh: "今天我在做什么",
        titleEn: "What I am doing today",
        pointsZh: ["写真实而具体的行动。", "例如：我正在专注工作、稳定输出、自然接住机会。", "例如：我正在经营关系、学习、创作、运动、成交。", "重点不是夸大，而是写出那个版本的日常节奏。"],
        pointsEn: ["Write a real, concrete action.", "For example: I am working with focus, creating steadily and responding to opportunities.", "Or: I am caring for relationships, learning, creating, exercising or completing a deal.", "The point is not grandeur; it is the daily rhythm of that version."],
      },
      {
        titleZh: "此刻我的感受",
        titleEn: "How I feel now",
        pointsZh: ["写下身体与情绪的状态。", "例如：平静、丰盛、被支持、安心、清晰、感恩。", "不必表演兴奋，而是进入真实的稳定感。", "你反复体验的感受，会成为下一次更容易返回的基线。"],
        pointsEn: ["Name the state of your body and emotion.", "For example: calm, resourced, supported, safe, clear, grateful.", "Do not perform excitement; enter genuine steadiness.", "A repeatedly experienced feeling becomes a baseline you can return to more easily."],
      },
      {
        titleZh: "为什么两者都要写",
        titleEn: "Why both matter",
        pointsZh: ["只有行动，容易变成空壳计划。", "只有感受，容易停留在想象里。", "行动与感受同时出现，新的现实才会进入你的生活节奏与内在系统。"],
        pointsEn: ["Action alone can become an empty plan.", "Feeling alone can drift into imagination.", "Together, action and feeling place the new reality inside both daily rhythm and inner experience."],
      },
    ],
    quoteZh: "不只是写下目标，更是写下你正在成为的自己。",
    quoteEn: "Record not only the goal, but the self you are becoming.",
  },
  {
    id: "daily-return",
    number: "05",
    glyph: "∞",
    titleZh: "第四步：每日签到，保持连接",
    titleEn: "Step four: return daily and stay connected",
    introZh: "最重要的不是一次写得多好，而是每天返回同一愿景、同一状态，与灵犀场持续建立可回看的连接。",
    introEn: "The essential practice is not one perfect entry. It is returning to the same vision and state each day, building a connection with Lingxi Field that you can review.",
    sections: [
      {
        titleZh: "每天要做多久",
        titleEn: "How long each day",
        pointsZh: ["5–10 分钟就够。", "不求一次写很多，只求每天都回来。", "让意识显化成为一项固定而轻盈的日常动作。"],
        pointsEn: ["Five to ten minutes is enough.", "Do not demand a long entry; simply return each day.", "Let Manifestation become a light, consistent daily action."],
      },
      {
        titleZh: "如何保持与灵犀场连接",
        titleEn: "How to stay connected with Lingxi Field",
        pointsZh: ["围绕同一个目标持续书写。", "不频繁更换愿景。", "每日回到相同的感受基调。", "签到，就是反复把自己放回那个版本。"],
        pointsEn: ["Keep writing around one goal.", "Do not switch visions constantly.", "Return to the same emotional baseline each day.", "A check-in is the act of placing yourself back inside that version."],
      },
      {
        titleZh: "为什么持续最重要",
        titleEn: "Why continuity matters most",
        pointsZh: ["重复会形成新的现实回路。", "连续性比一时的高昂情绪更重要。", "当你长期对齐，外部世界才可能逐步给出可观察的回应。"],
        pointsEn: ["Repetition forms a new Reality Loop.", "Continuity matters more than an emotional high.", "Long-term alignment creates room for observable responses in the world around you."],
      },
    ],
    quoteZh: "目标不乱，书写不断，共振不散，现实靠拢。",
    quoteEn: "Keep the goal steady, the writing alive and the connection unbroken.",
  },
  {
    id: "material-reality",
    number: "06",
    glyph: "◇",
    titleZh: "显化如何走向物质层面",
    titleEn: "How manifestation reaches material reality",
    introZh: "先在意识中对齐，再在现实中显现。这里观察的是内在、语言、选择、行动与结果之间的连续变化，不承诺任何特定外部结果。",
    introEn: "Align inwardly, then observe what becomes visible through real action. This practice traces continuity between state, language, choice, action and result; it does not promise a specific outcome.",
    sections: [
      {
        titleZh: "你可能先看到什么",
        titleEn: "What you may notice first",
        pointsZh: ["心更定了：内在更平静，情绪更稳定。", "拖延减少了：开始更容易行动，不再一再推迟。", "判断更清晰了：更知道什么对你真正重要。", "开始更自然地做对的事：不再用力，而是顺势而为。"],
        pointsEn: ["A steadier inner state and more stable emotion.", "Less delay and an easier start to action.", "Clearer judgement about what genuinely matters.", "More natural movement toward the right actions, with less force."],
      },
      {
        titleZh: "现实回路如何出现",
        titleEn: "How the Reality Loop unfolds",
        pointsZh: ["内在状态对齐：回到平静、清晰、笃定的你。", "语言与叙事重塑：用新的语言描述和创造现实。", "选择开始变化：做出更一致的选择。", "行动节奏变稳：持续行动，积累能量。", "机会与结果开始显现：物质层面的变化逐步到来。"],
        pointsEn: ["Inner alignment: return to a calm, clear and steady self.", "Language and narrative reshape: describe and create with a new vocabulary.", "Choice changes: make decisions consistent with that self.", "Action stabilises: repeat useful action and accumulate momentum.", "Opportunity and result become visible: material changes may gradually follow."],
      },
      {
        titleZh: "现实可能怎样回应",
        titleEn: "How reality may respond",
        pointsZh: ["新的关系与资源靠近，遇见更契合的人与能量。", "更适合的合作与机会出现，你也更能主动回应。", "收入、成果与反馈逐步改善，形成现实层面的正向循环。", "旧的内耗模式慢慢松开，不再反复陷入消耗性循环。"],
        pointsEn: ["New relationships and resources may come within reach.", "Better-fitting collaborations and opportunities can become easier to recognise and answer.", "Income, outcomes or feedback may improve as a positive real-world cycle forms.", "Old patterns of inner depletion can gradually loosen."],
      },
      {
        titleZh: "灵犀场在这里做什么",
        titleEn: "What Lingxi Field contributes",
        pointsZh: ["让你每天回到同一愿景、同一状态、同一频率。", "帮助你持续书写、持续签到、持续对齐。", "当内在更稳定，现实行动与结果也更有机会稳定下来。"],
        pointsEn: ["Bring you back to one vision, one state and one rhythm each day.", "Support continued writing, check-ins and alignment.", "As the inner state becomes steadier, real action and outcomes have a better chance to stabilise too."],
      },
    ],
    quoteZh: "意识是种子，现实是它在行动中的花朵。",
    quoteEn: "Awareness is the seed; reality is what action allows it to become.",
  },
];

export function ManifestationEntrances({ unlocked, signedIn }: { unlocked: boolean; signedIn: boolean }) {
  const target = unlocked ? "#daily-connection" : signedIn ? "/membership#manifestation" : "/account";
  return (
    <>
      <div className="manifest-stage-grid">
        {CHAPTERS.map((chapter) => (
          <Link key={chapter.id} href={unlocked ? `#${chapter.id}` : target} className="manifest-stage-card">
            <div className="manifest-stage-index"><span>{chapter.number}</span><b aria-hidden="true">{chapter.glyph}</b></div>
            <div className="manifest-stage-copy">
              <p><Bi zh={chapter.titleZh} en={chapter.titleEn} /></p>
              <small><Bi zh={chapter.introZh} en={chapter.introEn} /></small>
              <b><Bi zh={unlocked ? "展开完整内容" : "查看简介"} en={unlocked ? "Open full chapter" : "View introduction"} /> →</b>
            </div>
          </Link>
        ))}
      </div>
      {!unlocked && (
        <div className="manifest-access-gate">
          <span aria-hidden="true">∞</span>
          <div>
            <p><Bi zh="六个入口免费可见，完整练习在连接后展开" en="Six introductions are open; the complete practice unfolds after connection" /></p>
            <small><Bi zh="登录并激活意识显化后，可阅读六章全部细节，进入每日书写、签到、场域回应与历史回看。这里不会显示虚构进度。" en="Sign in and activate Manifestation to read all six chapters, write and check in daily, receive a field response and review your real history. No invented progress is shown." /></small>
          </div>
          <Link href={target}><Bi zh={signedIn ? "查看意识显化订阅" : "登录后继续"} en={signedIn ? "View Manifestation access" : "Sign in to continue"} /> →</Link>
        </div>
      )}
    </>
  );
}

export function ManifestationChapters() {
  return (
    <div className="manifest-chapters">
      {CHAPTERS.map((chapter) => (
        <article id={chapter.id} key={chapter.id} className="manifest-chapter">
          <div className="manifest-chapter-rail" aria-hidden="true"><span>{chapter.number}</span><b>{chapter.glyph}</b><i /></div>
          <div className="manifest-chapter-body">
            <p className="manifest-chapter-number">CHAPTER {chapter.number}</p>
            <h2><Bi zh={chapter.titleZh} en={chapter.titleEn} /></h2>
            <p className="manifest-chapter-intro"><Bi zh={chapter.introZh} en={chapter.introEn} /></p>
            <div className="manifest-chapter-sections">
              {chapter.sections.map((section) => (
                <section key={section.titleEn}>
                  <h3><Bi zh={section.titleZh} en={section.titleEn} /></h3>
                  <ul>
                    {section.pointsZh.map((point, pointIndex) => (
                      <li key={section.pointsEn[pointIndex]}><span>{String(pointIndex + 1).padStart(2, "0")}</span><Bi zh={point} en={section.pointsEn[pointIndex]} /></li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <blockquote><Bi zh={chapter.quoteZh} en={chapter.quoteEn} /></blockquote>
          </div>
        </article>
      ))}
    </div>
  );
}
