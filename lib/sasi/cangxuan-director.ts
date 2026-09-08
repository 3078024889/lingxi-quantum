export type DirectorMedium = "motion-comic" | "live-action";

export type DirectorBrief = {
  title: string;
  premise: string;
  protagonist: string;
  medium: DirectorMedium;
  genre: string;
  episodes: number;
  secondsPerEpisode: number;
};

export type DirectorBlueprint = {
  projectLine: string;
  worldRules: string[];
  characterBible: Array<{ role: string; identity: string; visualLock: string; dramaticFunction: string }>;
  episodeArc: Array<{ beat: string; purpose: string }>;
  shots: Array<{ seconds: number; framing: string; action: string; sound: string }>;
  continuityLocks: string[];
  providerPrompt: string;
};

const genreTone: Record<string, string> = {
  古装复仇: "克制的东方冷色、权力空间与高密度身份反转",
  都市情感: "真实城市质感、细微表演与关系张力",
  仙侠成长: "东方奇观、清晰境界规则与逐级成长回报",
  悬疑反转: "受限信息、可回溯伏笔与递进式视觉线索",
  品牌广告: "单一价值主张、精确产品特写与高级商业光影",
};

export function buildDirectorBlueprint(brief: DirectorBrief): DirectorBlueprint {
  const lead = brief.protagonist.trim() || "主角";
  const premise = brief.premise.trim() || "一个普通人在压力中发现真正想守护的事物";
  const tone = genreTone[brief.genre] ?? "明确的情绪曲线、可信动机与克制的电影语言";
  const medium = brief.medium === "live-action" ? "真人短剧" : "AI 漫剧";
  const shotLength = Math.max(2, Math.floor(brief.secondsPerEpisode / 5));

  return {
    projectLine: `${brief.title || "未命名作品"}是一部${brief.genre}${medium}：${premise}。以“选择带来代价”为核心，让每一集都推进人物，而不只堆叠奇观。`,
    worldRules: [
      `视觉原则：${tone}。`,
      "叙事原则：每集前 3 秒出现可理解的冲突，结尾留下由人物选择产生的悬念。",
      "真实性原则：所有转折必须能从已出现的人物动机、道具或信息中回溯。",
      `生产边界：${brief.episodes} 集，每集约 ${brief.secondsPerEpisode} 秒；单镜优先控制在 ${shotLength}–${shotLength + 2} 秒。`,
    ],
    characterBible: [
      { role: "核心角色", identity: `${lead}｜推动故事的主动选择者`, visualLock: "正脸、45°、侧脸、全身与三种核心表情建立同一参考资产；发型、年龄感与主服装不可漂移。", dramaticFunction: "每集至少做出一次改变局面的选择。" },
      { role: "对抗角色", identity: "与主角目标冲突，但拥有可信利益与价值判断", visualLock: "固定轮廓、主色与标志性道具；避免只用夸张表情表现反派。", dramaticFunction: "制造代价，迫使主角暴露真实欲望。" },
      { role: "关系角色", identity: "见证并放大主角变化的人", visualLock: "固定与主角的身高差、空间距离和关系色温。", dramaticFunction: "提供情感回声、信息反差或选择后果。" },
    ],
    episodeArc: [
      { beat: "钩子", purpose: "用正在发生的动作或一句未完成的话建立问题。" },
      { beat: "目标", purpose: `${lead}明确本集必须完成的事情。` },
      { beat: "阻力", purpose: "外部阻碍与内部信念同时收紧。" },
      { beat: "选择", purpose: "主角付出代价，局面不可逆地改变。" },
      { beat: "悬念", purpose: "展示选择的新后果，而不是机械截断。" },
    ],
    shots: [
      { seconds: shotLength, framing: "环境远景 → 缓慢推进", action: "建立空间规则，并让冲突已经发生。", sound: "环境声先行，音乐只给一个识别动机。" },
      { seconds: shotLength, framing: "中近景 / 肩后机位", action: `${lead}看见关键信息，先有微反应再行动。`, sound: "保留呼吸与衣料声，避免对白覆盖表演。" },
      { seconds: shotLength + 1, framing: "物件特写 → 眼神特写", action: "把伏笔与人物判断放在同一剪辑关系中。", sound: "关键音效只出现一次。" },
      { seconds: shotLength + 1, framing: "双人中景 / 稳定构图", action: "对抗升级，人物在画面位置上争夺主导。", sound: "对白留停顿，不用连续旁白解释。" },
      { seconds: shotLength, framing: "近景 → 反向移动", action: "选择落地并留下下一集的新问题。", sound: "音乐在动作完成后进入，形成集尾记忆点。" },
    ],
    continuityLocks: [
      `${lead}：脸型、发型、年龄感、主服装、声音与核心欲望。`,
      "场景：出入口方向、主光方向、核心家具/道具位置与时段。",
      "时间：伤痕、衣物状态、已获得信息和人物关系必须承接上一镜。",
      "镜头：同一动作遵守轴线与视线匹配；跳时必须有明确转场依据。",
      "版本：任何角色或场景资产变更均建立新版本，不覆盖已锁定镜头。",
    ],
    providerPrompt: `${medium}，${brief.genre}。${premise}。角色 ${lead} 使用固定身份参考，保持面部、发型、年龄、服装和声音连续。${tone}。电影级构图，动作可读，表演克制，空间方向一致，不出现文字、水印、标志或随机换装。`,
  };
}
