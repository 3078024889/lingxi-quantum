#!/usr/bin/env node
/**
 * Offline SASI drama 8-step automaton.
 * Steps 1–6 + prompt compiler; 7–8 assembly stubs with reserved interfaces.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCanonPipeline } from './character-canon.mjs';
import { buildShotPackFromCompiled, buildTimelinePack } from './shotpack.mjs';

const __skillDir = dirname(fileURLToPath(import.meta.url));

/** Load Groot dual-fed teach index (priority packs). Missing file = empty teach, never throw. */
export function loadSkillTeachIndex() {
  const candidates = [
    join(__skillDir, 'skill-teach', 'priority-compiler-index.json'),
    join(__skillDir, '../../../uploads/2026-09-18-skill-teach-priority.json'),
    '/workspace/uploads/2026-09-18-skill-teach-priority.json',
  ];
  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        const raw = JSON.parse(readFileSync(p, 'utf8'));
        return { path: p, n: raw.n || (raw.items || []).length, items: raw.items || [], hooks: raw.compiler_hooks || {} };
      }
    } catch { /* ignore */ }
  }
  return { path: null, n: 0, items: [], hooks: {} };
}

function teachForStep(teach, step) {
  return (teach.items || []).filter((it) => (it.drama_steps || []).includes(step));
}

export const SAMPLE_SCRIPT = `林秋在图书馆夜班。门锁坏了。周晨答应替她值后半夜，并交接钥匙。
林秋左手腕有细红绳，肩上旧军绿帆布包。周晨半开玩笑，不许突然导师腔。`;

function parseScript(text) {
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const names = [...new Set((text.match(/林秋|周晨/g) || []))];
  return { step: 1, name: '剧本解析', beats: lines, characters_mentioned: names };
}

function characterBoards(parsed) {
  const catalog = {
    林秋: { anchors: ['左手腕细红绳', '旧军绿帆布包', '短句'], forbid: ['鸡汤口号', '突然全知旁白'] },
    周晨: { anchors: ['耳骨钉', '手机壳裂痕右上角', '半开玩笑'], forbid: ['突然人生导师腔'] },
  };
  const boards = {};
  for (const n of parsed.characters_mentioned) boards[n] = catalog[n] || { anchors: [], forbid: [] };
  return { step: 2, name: '人物身份板', boards };
}

function sceneBoards() {
  return {
    step: 3,
    name: '场景身份板',
    scenes: [
      { id: 'S1', place: '社区图书馆夜间值班台', props: ['坏掉的门锁', '柜台上的钥匙'] },
      { id: 'S2', place: '图书馆后门过道', props: ['应急灯', '帆布包'] },
    ],
  };
}

function episodes(parsed) {
  return {
    step: 4,
    name: '分集',
    episodes: [
      { id: 'E01', title: '夜班与坏锁', beats: parsed.beats.slice(0, Math.max(1, Math.ceil(parsed.beats.length / 2))) },
      { id: 'E02', title: '替班与交接', beats: parsed.beats.slice(Math.ceil(parsed.beats.length / 2)) },
    ].filter((e) => e.beats.length),
  };
}

function storyboard(eps, scenes) {
  const shots = [];
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
  return { step: 5, name: '故事板', shots };
}

function primaryCharacter(intent, boards) {
  const names = Object.keys(boards);
  for (const n of names) if (intent.includes(n)) return n;
  return names[0] || '角色';
}

function refineShots(story, chars) {
  return {
    step: 6,
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

export function compilePrompts(refined, teach = loadSkillTeachIndex()) {
  const step6 = teachForStep(teach, 6);
  const step7 = teachForStep(teach, 7);
  const seedanceTips = step7.filter((t) => /seedance|video-prompt/i.test(`${t.pack} ${t.title}`)).map((t) => t.title);
  const dramaTips = step6.concat(step7).filter((t) => /drama|storyboard|prompt/i.test(`${t.pack} ${t.title}`)).map((t) => t.title);
  const seedanceLine = seedanceTips.length
    ? `\n教具：${seedanceTips.slice(0, 3).join('、')} —— 单镜清晰动作、人物站位、跨镜锚点不丢。`
    : '\n风格：电影感夜戏，干净光线，写实。';
  const jimengLine = dramaTips.length
    ? `\n教具：${dramaTips.slice(0, 3).join('、')} —— 即梦友好单镜头，禁止换脸换衣无场记。`
    : '\n即梦友好：单镜头清晰动作，人物站位明确。';
  return {
    step: 'compiler',
    name: '提示词编译',
    providers: ['seedance_style', 'jimeng_style'],
    skill_teach: {
      loaded: Boolean(teach.path),
      n: teach.n,
      path: teach.path,
      packs: [...new Set((teach.items || []).map((i) => i.pack))],
      hooks: teach.hooks,
    },
    items: refined.refined.map((sh) => {
      const anchors = (sh.visual_anchors || []).join('，');
      const forbid = (sh.forbid || []).join('；');
      const core = [
        `镜头${sh.id}｜${sh.framing}｜${sh.camera}`,
        `角色：${sh.character}（视觉锚点：${anchors}）`,
        `场景：${sh.scene}｜意图：${sh.intent}`,
        `禁止：${forbid}`,
        '保持人物跨镜一致；不要换脸换衣无场记说明。',
      ].join('\n');
      return {
        shot_id: sh.id,
        executable_prompt: core + seedanceLine,
        skill_refs: [...new Set(seedanceTips.concat(dramaTips))].slice(0, 8),
        seedance_style: {
          prompt: core + seedanceLine,
          negative: 'face morph, wardrobe change, mentor speech, text watermark',
        },
        jimeng_style: {
          prompt: core + jimengLine,
          negative: '多脸混乱, 服装漂移, 鸡汤独白',
        },
      };
    }),
  };
}

/** Reserved assembly interface for steps 7–8 */
export function createAssemblyHook(compiled) {
  return {
    interface: 'SasiDramaAssemblyV0',
    inputs: {
      shots: compiled.items.map((it) => ({ shot_id: it.shot_id, prompt: it.seedance_style.prompt })),
    },
    methods: {
      generateClips: 'TODO provider submitSasiVideo per shot',
      stitchTimeline: 'TODO concat + audio bed',
      exportMaster: 'TODO write delivery object',
    },
    status: 'stub',
  };
}

export function runEightStep(script = SAMPLE_SCRIPT) {
  const text = String(script || SAMPLE_SCRIPT).trim() || SAMPLE_SCRIPT;
  const s1 = parseScript(text);
  const s2 = characterBoards(s1);
  const s3 = sceneBoards();
  const s4 = episodes(s1);
  const s5 = storyboard(s4, s3);
  const s6 = refineShots(s5, s2);
  const compiled = compilePrompts(s6);
  const canonRun = runCanonPipeline(s6.refined, s2.boards, s3.scenes, text);
  // inject canon look into executable prompts when present
  for (const it of compiled.items) {
    const c = canonRun.items.find((x) => x.shot_id === it.shot_id);
    if (c?.executable_prompt) {
      it.executable_prompt = c.executable_prompt;
      it.identity_core = c.identity_core;
      it.look_state = c.look_state;
      it.continuity_gate = c.gate;
    }
  }
  const assembly = createAssemblyHook(compiled);
  const out = {
    ok: true,
    pipeline: 'drama-8step-offline-v0+canon-gate+shotPack',
    honest: 'demo/API 通到精分镜+编译+假门禁 ≠ 网站已稳一键成片',
    artifacts: {
      s1, s2, s3, s4, s5, s6, compiled,
      canon: canonRun.canon,
      continuity: { mode: 'fake', all_pass: canonRun.all_pass, items: canonRun.items },
      shotPacks: canonRun.items.map((it) => buildShotPackFromCompiled(it, {
        ref_assets: [{ kind: 'face_ref', path: `assets/canon/${it.identity_core?.id || 'unknown'}/face.png`, weight: 0.85 }],
      })),
      s7: { step: 7, name: '视频镜头（占位）', assembly, gate_note: '过 ContinuityGate 才进下一镜' },
      s8: { step: 8, name: '配音字幕/成片（占位）', assembly },
    },
  };
  out.artifacts.timelinePack = buildTimelinePack('offline-demo', out.artifacts.shotPacks || []);
  return out;
}
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const out = runEightStep(process.argv.slice(2).join('\n') || SAMPLE_SCRIPT);
  const outDir = join(__dirname, 'out');
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, 'eight-step-demo.json');
  writeFileSync(path, JSON.stringify(out, null, 2), 'utf8');
  console.log('PASS steps1-6+compiler');
  console.log('shots', out.artifacts.s6.refined.length);
  console.log('compiled', out.artifacts.compiled.items.length);
  console.log('wrote', path);
}
