export type DirectorMode = "motion-comic" | "short-drama" | "film" | "advertising" | "music-video" | "game-cg";

export type DirectorBrief = { title:string; premise:string; protagonist:string; mode:DirectorMode; genre:string; episodes:number; secondsPerEpisode:number };
export type DirectorBlueprint = {
  projectLine:string; modeMandate:string[]; worldRules:string[];
  characterBible:Array<{ role:string; identity:string; visualLock:string; dramaticFunction:string }>;
  episodeArc:Array<{ beat:string; purpose:string }>;
  shots:Array<{ seconds:number; framing:string; action:string; sound:string }>;
  continuityLocks:string[]; providerPrompt:string;
};

export const DIRECTOR_MODES:Array<{ id:DirectorMode; zh:string; en:string; glyph:string; noteZh:string; noteEn:string; defaultGenre:string; defaultEpisodes:number; defaultSeconds:number }> = [
  { id:"motion-comic", zh:"漫剧导演", en:"Motion Comic", glyph:"漫", noteZh:"把小说与 IP 拆成连续分集，统一人物造型、画风和叙事节奏。", noteEn:"Turn novels and IP into episodes with consistent characters, art direction and rhythm.", defaultGenre:"古装复仇", defaultEpisodes:24, defaultSeconds:60 },
  { id:"short-drama", zh:"短剧导演", en:"Short Drama", glyph:"剧", noteZh:"围绕人物欲望安排钩子、冲突与反转，让每集都有推进和回报。", noteEn:"Shape hooks, conflict and reversals around desire so every episode advances and rewards.", defaultGenre:"都市情感", defaultEpisodes:50, defaultSeconds:90 },
  { id:"film", zh:"电影导演", en:"Film", glyph:"影", noteZh:"以人物弧线统领长叙事、表演调度、摄影语法与声音母题。", noteEn:"Unify long-form story, performance, cinematography and sound through the character arc.", defaultGenre:"悬疑反转", defaultEpisodes:1, defaultSeconds:300 },
  { id:"advertising", zh:"广告导演", en:"Advertising", glyph:"告", noteZh:"把产品利益转化为清晰创意、关键特写与可被记住的品牌画面。", noteEn:"Translate product value into a clear idea, signature shots and memorable brand imagery.", defaultGenre:"品牌广告", defaultEpisodes:1, defaultSeconds:30 },
  { id:"music-video", zh:"MV 导演", en:"Music Video", glyph:"乐", noteZh:"跟随歌曲段落组织表演、视觉母题与情绪高潮，让声音拥有画面。", noteEn:"Map performance, visual motifs and emotional peaks to the song's structure.", defaultGenre:"音乐叙事", defaultEpisodes:1, defaultSeconds:180 },
  { id:"game-cg", zh:"游戏 CG 导演", en:"Game CG", glyph:"界", noteZh:"先讲清世界规则与角色目标，再设计可读动作、奇观和视觉预演。", noteEn:"Establish world rules and character goals before readable action and spectacle.", defaultGenre:"游戏幻想", defaultEpisodes:1, defaultSeconds:90 },
];

const genreTone:Record<string,string> = {
  古装复仇:"克制的东方冷色、权力空间与高密度身份反转", 都市情感:"真实城市质感、细微表演与关系张力",
  仙侠成长:"东方奇观、清晰境界规则与逐级成长回报", 悬疑反转:"受限信息、可回溯伏笔与递进式视觉线索",
  品牌广告:"单一价值主张、精确产品特写与高级商业光影", 音乐叙事:"以节拍、段落与反复视觉母题组织情绪",
  游戏幻想:"规则清晰的世界奇观、可读动作与英雄尺度",
};

const modeRules:Record<DirectorMode,{ label:string; mandate:string[] }> = {
  "motion-comic":{ label:"AI 漫剧", mandate:["先锁定角色正侧脸、服饰与场景母版，再生成镜头。","每集只推进一个核心冲突，旁白与画面分工明确。"] },
  "short-drama":{ label:"真人短剧", mandate:["前三秒必须出现人物处境或未完成动作。","反转来自身份、利益或选择，不依赖无依据巧合。"] },
  film:{ label:"电影预演", mandate:["以人物弧线统领场面调度，不用奇观代替叙事。","建立统一镜头语法、色彩脚本与声音母题。"] },
  advertising:{ label:"商业广告", mandate:["只保留一个核心价值主张，并用可验证产品利益支撑。","品牌或产品在情绪峰值进入，结尾形成明确记忆资产。"] },
  "music-video":{ label:"音乐影像", mandate:["按前奏、主歌、副歌、桥段与尾奏建立视觉段落。","用可重复视觉母题连接表演、叙事和节拍变化。"] },
  "game-cg":{ label:"游戏 CG", mandate:["先交代世界规则与角色目标，再释放动作奇观。","战斗保持空间方向、能力因果与角色轮廓可读。"] },
};

export function buildDirectorBlueprint(brief:DirectorBrief):DirectorBlueprint {
  const lead=brief.protagonist.trim()||"主角";
  const premise=brief.premise.trim()||"一个普通人在压力中发现真正想守护的事物";
  const tone=genreTone[brief.genre]??"明确的情绪曲线、可信动机与克制的电影语言";
  const mode=modeRules[brief.mode];
  const shotLength=Math.max(2,Math.floor(brief.secondsPerEpisode/5));
  return {
    projectLine:`${brief.title||"未命名作品"}是一部${brief.genre}${mode.label}：${premise}。以“选择带来代价”为核心，让每一段都推进人物与作品目标，而不只堆叠奇观。`,
    modeMandate:mode.mandate,
    worldRules:[`视觉原则：${tone}。`,"叙事原则：开场迅速建立可理解的问题，结尾留下由人物选择产生的新后果。","真实性原则：所有转折必须能从已出现的人物动机、产品证据、道具或信息中回溯。",`生产边界：${brief.episodes} 个交付单元，每单元约 ${brief.secondsPerEpisode} 秒；单镜优先控制在 ${shotLength}–${shotLength+2} 秒。`],
    characterBible:[
      { role:"核心角色", identity:`${lead}｜推动作品的主动选择者`, visualLock:"正脸、45°、侧脸、全身与三种核心表情建立同一参考资产；发型、年龄感与主服装不可漂移。", dramaticFunction:"每个段落至少做出一次改变局面的选择。" },
      { role:"对抗力量", identity:"与主角目标冲突，但拥有可信利益与价值判断", visualLock:"固定轮廓、主色与标志性道具；避免只用夸张表情表现阻力。", dramaticFunction:"制造代价，迫使主角或品牌主张显露真正价值。" },
      { role:"关系角色", identity:"见证并放大主角变化的人", visualLock:"固定与主角的身高差、空间距离和关系色温。", dramaticFunction:"提供情感回声、信息反差或选择后果。" },
    ],
    episodeArc:[{ beat:"钩子",purpose:"用正在发生的动作、声音或一句未完成的话建立问题。" },{ beat:"目标",purpose:`${lead}明确本段必须完成的事情。` },{ beat:"阻力",purpose:"外部阻碍与内部信念同时收紧。" },{ beat:"选择",purpose:"主角付出代价，局面不可逆地改变。" },{ beat:"余韵",purpose:"展示选择的新后果或品牌记忆，而不是机械截断。" }],
    shots:[
      { seconds:shotLength,framing:"环境远景 → 缓慢推进",action:"建立空间规则，并让冲突已经发生。",sound:"环境声先行，音乐只给一个识别动机。" },
      { seconds:shotLength,framing:"中近景 / 肩后机位",action:`${lead}看见关键信息，先有微反应再行动。`,sound:"保留呼吸与衣料声，避免对白覆盖表演。" },
      { seconds:shotLength+1,framing:"物件特写 → 眼神特写",action:"把伏笔、产品证据或人物判断放在同一剪辑关系中。",sound:"关键音效只出现一次。" },
      { seconds:shotLength+1,framing:"双人中景 / 稳定构图",action:"对抗升级，画面位置争夺主导。",sound:"对白或歌词留停顿，不用连续旁白解释。" },
      { seconds:shotLength,framing:"近景 → 反向移动",action:"选择落地并留下新的问题或记忆点。",sound:"音乐在动作完成后进入。" },
    ],
    continuityLocks:[`${lead}：脸型、发型、年龄感、主服装、声音与核心欲望。`,"场景：出入口方向、主光方向、核心家具/道具位置与时段。","时间：伤痕、衣物状态、已获得信息和人物关系必须承接上一镜。","镜头：同一动作遵守轴线与视线匹配；跳时必须有明确转场依据。","版本：任何角色、产品或场景资产变更均建立新版本，不覆盖已锁定镜头。"],
    providerPrompt:`${mode.label}，${brief.genre}。${premise}。角色 ${lead} 使用固定身份参考，保持面部、发型、年龄、服装和声音连续。${tone}。电影级构图，动作可读，表演克制，空间方向一致，不出现文字、水印、标志或随机换装。`,
  };
}
