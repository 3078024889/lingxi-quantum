/** Offline drama 8-step automaton + prompt compiler. Steps 7–8 stubbed with assembly hook. */

export const SAMPLE_SCRIPT = `林秋在图书馆夜班。门锁坏了。周晨答应替她值后半夜，并交接钥匙。
林秋左手腕有细红绳，肩上旧军绿帆布包。周晨半开玩笑，不许突然导师腔。`;

type Boards = Record<string, { anchors: string[]; forbid: string[] }>;

function parseScript(text: string) {
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const characters_mentioned = [...new Set(text.match(/林秋|周晨/g) || [])];
  return { step: 1 as const, name: '剧本解析', beats: lines, characters_mentioned };
}

function characterBoards(parsed: ReturnType<typeof parseScript>) {
  const catalog: Boards = {
    林秋: { anchors: ['左手腕细红绳', '旧军绿帆布包', '短句'], forbid: ['鸡汤口号', '突然全知旁白'] },
    周晨: { anchors: ['耳骨钉', '手机壳裂痕右上角', '半开玩笑'], forbid: ['突然人生导师腔'] },
  };
  const boards: Boards = {};
  for (const n of parsed.characters_mentioned) boards[n] = catalog[n] || { anchors: [], forbid: [] };
  return { step: 2 as const, name: '人物身份板', boards };
}

function sceneBoards() {
  return {
    step: 3 as const,
    name: '场景身份板',
    scenes: [
      { id: 'S1', place: '社区图书馆夜间值班台', props: ['坏掉的门锁', '柜台上的钥匙'] },
      { id: 'S2', place: '图书馆后门过道', props: ['应急灯', '帆布包'] },
    ],
  };
}

function episodes(parsed: ReturnType<typeof parseScript>) {
  const mid = Math.max(1, Math.ceil(parsed.beats.length / 2));
  return {
    step: 4 as const,
    name: '分集',
    episodes: [
      { id: 'E01', title: '夜班与坏锁', beats: parsed.beats.slice(0, mid) },
      { id: 'E02', title: '替班与交接', beats: parsed.beats.slice(mid) },
    ].filter((e) => e.beats.length),
  };
}

function storyboard(
  eps: ReturnType<typeof episodes>,
  scenes: ReturnType<typeof sceneBoards>,
) {
  const shots: Array<{
    id: string; episode: string; scene: string; intent: string; framing: string;
  }> = [];
  let i = 1;
  for (const ep of eps.episodes) {
    for (const beat of ep.beats) {
      shots.push({
        id: `SH${String(i).padStart(2, '0')}`,
        episode: ep.id,
        scene: scenes.scenes[(i - 1) % scenes.scenes.length].id,
        intent: beat,
        framing: i % 2 ? '中景' : '近景',
      });
      i += 1;
    }
  }
  return { step: 5 as const, name: '故事板', shots };
}

function primaryCharacter(intent: string, boards: Boards) {
  const names = Object.keys(boards);
  for (const n of names) if (intent.includes(n)) return n;
  return names[0] || '角色';
}

function refineShots(story: ReturnType<typeof storyboard>, chars: ReturnType<typeof characterBoards>) {
  return {
    step: 6 as const,
    name: '精分镜',
    refined: story.shots.map((sh) => {
      const who = primaryCharacter(sh.intent, chars.boards);
      const board = chars.boards[who] || { anchors: [], forbid: [] };
      return {
        ...sh,
        character: who,
        visual_anchors: board.anchors,
        forbid: board.forbid,
        camera: sh.framing === '近景' ? '固定近景，眼平' : '过肩中景，缓慢推',
        continuity_check: 'A身份板+B上一镜事实+C当前词 须无冲突',
      };
    }),
  };
}


type SkillTeachItem = { pack: string; title: string; drama_steps: number[] };

/** Priority teach packs (synced from skill-teach/priority-compiler-index.json). */
const PRIORITY_SKILL_TEACH: SkillTeachItem[] = [
  {
    "pack": "drama-skills",
    "title": "short-drama-write",
    "drama_steps": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-video-prompts",
    "drama_steps": [
      1,
      2,
      5,
      6,
      7
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-edit",
    "drama_steps": [
      1,
      3,
      5,
      7,
      8
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-assets",
    "drama_steps": [
      1,
      2,
      3,
      5
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-image-prompts",
    "drama_steps": [
      1,
      2,
      3,
      5,
      6,
      8
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-storyboard",
    "drama_steps": [
      1,
      2,
      3,
      5,
      6
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-produce",
    "drama_steps": [
      1,
      5,
      6,
      7,
      8
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-review",
    "drama_steps": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-develop",
    "drama_steps": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-novel-analyze",
    "drama_steps": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama",
    "drama_steps": [
      1,
      2,
      4,
      5,
      7,
      8
    ]
  },
  {
    "pack": "drama-skills",
    "title": "short-drama-knowhow",
    "drama_steps": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    "pack": "seedance-director",
    "title": "seedance-director",
    "drama_steps": [
      1,
      2,
      3,
      5,
      7
    ]
  },
  {
    "pack": "video-prompt-engineer",
    "title": "video-prompt-engineer",
    "drama_steps": [
      1,
      2,
      3,
      5,
      6,
      7
    ]
  }
];

function teachForStep(step: number) {
  return PRIORITY_SKILL_TEACH.filter((it) => it.drama_steps.includes(step));
}

export function compilePrompts(refined: ReturnType<typeof refineShots>) {
  const step6 = teachForStep(6);
  const step7 = teachForStep(7);
  const seedanceTips = step7
    .filter((t) => /seedance|video-prompt/i.test(`${t.pack} ${t.title}`))
    .map((t) => t.title);
  const dramaTips = step6.concat(step7)
    .filter((t) => /drama|storyboard|prompt/i.test(`${t.pack} ${t.title}`))
    .map((t) => t.title);
  const seedanceLine = seedanceTips.length
    ? `\n教具：${seedanceTips.slice(0, 3).join('、')} —— 单镜清晰动作、人物站位、跨镜锚点不丢。`
    : '\n风格：电影感夜戏，干净光线，写实。';
  const jimengLine = dramaTips.length
    ? `\n教具：${dramaTips.slice(0, 3).join('、')} —— 即梦友好单镜头，禁止换脸换衣无场记。`
    : '\n即梦友好：单镜头清晰动作，人物站位明确。';
  return {
    step: 'compiler' as const,
    name: '提示词编译',
    providers: ['seedance_style', 'jimeng_style'] as const,
    skill_teach: {
      loaded: true as const,
      n: PRIORITY_SKILL_TEACH.length,
      packs: [...new Set(PRIORITY_SKILL_TEACH.map((i) => i.pack))],
    },
    items: refined.refined.map((sh) => {
      const anchors = sh.visual_anchors.join('，');
      const forbid = sh.forbid.join('；');
      const core = [
        `镜头${sh.id}｜${sh.framing}｜${sh.camera}`,
        `角色：${sh.character}（视觉锚点：${anchors}）`,
        `场景：${sh.scene}｜意图：${sh.intent}`,
        `禁止：${forbid}`,
        '保持人物跨镜一致；不要换脸换衣无场记说明。',
      ].join('\n');
      return {
        shot_id: sh.id,
        executable_prompt: `${core}${seedanceLine}`,
        skill_refs: [...new Set(seedanceTips.concat(dramaTips))].slice(0, 8),
        seedance_style: {
          prompt: `${core}${seedanceLine}`,
          negative: 'face morph, wardrobe change, mentor speech, text watermark',
        },
        jimeng_style: {
          prompt: `${core}${jimengLine}`,
          negative: '多脸混乱, 服装漂移, 鸡汤独白',
        },
      };
    }),
  };
}

export function createAssemblyHook(compiled: ReturnType<typeof compilePrompts>) {
  return {
    interface: 'SasiDramaAssemblyV0',
    inputs: {
      shots: compiled.items.map((it) => ({
        shot_id: it.shot_id,
        prompt: it.executable_prompt || it.seedance_style.prompt,
      })),
    },
    methods: {
      generateClips: 'TODO provider submitSasiVideo per shot',
      stitchTimeline: 'TODO concat + audio bed',
      exportMaster: 'TODO write delivery object',
    },
    status: 'stub' as const,
  };
}

export function runEightStep(script: string = SAMPLE_SCRIPT) {
  const text = String(script || SAMPLE_SCRIPT).trim() || SAMPLE_SCRIPT;
  const s1 = parseScript(text);
  const s2 = characterBoards(s1);
  const s3 = sceneBoards();
  const s4 = episodes(s1);
  const s5 = storyboard(s4, s3);
  const s6 = refineShots(s5, s2);
  const compiled = compilePrompts(s6);
  const assembly = createAssemblyHook(compiled);
  return {
    ok: true as const,
    pipeline: 'drama-8step-offline-v0',
    honest: 'demo/API 通到精分镜+编译 ≠ 网站已稳一键成片',
    artifacts: {
      s1, s2, s3, s4, s5, s6, compiled,
      s7: { step: 7 as const, name: '视频镜头（占位）', assembly },
      s8: { step: 8 as const, name: '配音字幕/成片（占位）', assembly },
    },
  };
}

export type AssemblyJobPayload = {
  shot_id: string;
  prompt: string;
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  quality: 'standard' | 'high';
  selectionHint: 'seedance' | 'xai' | 'openai' | 'wan' | 'none';
};

/** Build provider-ready clip jobs from compiled prompts. Does not call network. */
export function buildClipJobs(
  compiled: ReturnType<typeof compilePrompts>,
  opts?: { duration?: number; aspectRatio?: AssemblyJobPayload['aspectRatio'] },
): AssemblyJobPayload[] {
  const duration = opts?.duration ?? 5;
  const aspectRatio = opts?.aspectRatio ?? '16:9';
  return compiled.items.map((it) => ({
    shot_id: it.shot_id,
    prompt: it.seedance_style.prompt,
    duration,
    aspectRatio,
    quality: 'standard' as const,
    selectionHint: 'seedance' as const,
  }));
}

export function planAssembly(script?: string) {
  const eight = runEightStep(script);
  const jobs = buildClipJobs(eight.artifacts.compiled);
  return {
    ...eight,
    assemblyPlan: {
      status: 'planned' as const,
      clipJobs: jobs,
      stitch: { status: 'stub' as const, note: 'concat after clips return URLs' },
      export: { status: 'stub' as const, note: 'write sasi_deliveries when master ready' },
      next: 'Call submitSasiVideo per clipJob when ARK_API_KEY/verified providers ready',
    },
  };
}
