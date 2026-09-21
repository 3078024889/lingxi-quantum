/**
 * Director control plane: shotPack (multi-track) + timelinePack + fake field gates.
 * External APIs only consume compiled packs; fail → retry that track only.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCanon, compileShot, continuityGate, runCanonGateFixture } from './character-canon.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const TRACKS = ['visual', 'dialogue', 'subtitle', 'vo', 'bgm', 'sfx'];

function hasScriptRef(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.scriptRef) return true;
  if (Array.isArray(obj.lines) && obj.lines.every((l) => l.scriptRef)) return true;
  if (Array.isArray(obj.cues) && obj.cues.every((c) => c.scriptRef || c.beatRef)) return true;
  if (obj.beatRef || obj.cueId) return true;
  return false;
}

/** Fake gate: field completeness + scriptRef; no network. */
export function gateTracks(shotPack) {
  const issues = [];
  const tracks = shotPack.tracks || {};
  for (const name of TRACKS) {
    if (!tracks[name]) {
      issues.push({ track: name, code: 'TRACK_MISSING', fix: `补齐 tracks.${name}` });
      continue;
    }
    const t = tracks[name];
    if (name === 'visual') {
      if (!t.executable_prompt) issues.push({ track: name, code: 'NO_EXECUTABLE_PROMPT', fix: '编译 visual.executable_prompt' });
      if (!t.ref_assets?.length) issues.push({ track: name, code: 'NO_REF_ASSETS', fix: '弱档纯文生；优先补 face_ref/look_ref' });
      if (!shotPack.identity_core) issues.push({ track: name, code: 'NO_IDENTITY_CORE', fix: '注入 identity_core' });
      if (!shotPack.look_state?.scriptRef) issues.push({ track: name, code: 'LOOK_NO_SCRIPT_REF', fix: 'look_state 必须 scriptRef' });
    }
    if (name === 'dialogue') {
      if (!t.forbid_rewrite) issues.push({ track: name, code: 'REWRITE_ALLOWED', fix: 'forbid_rewrite=true' });
      if (!hasScriptRef(t)) issues.push({ track: name, code: 'NO_SCRIPT_REF', fix: '对白行必须 scriptRef' });
    }
    if (name === 'subtitle') {
      if (!hasScriptRef(t)) issues.push({ track: name, code: 'NO_SCRIPT_REF', fix: '字幕 cue 必须 scriptRef' });
      const d0 = tracks.dialogue?.lines?.[0]?.text;
      const s0 = t.cues?.[0]?.text;
      if (d0 && s0 && d0 !== s0) issues.push({ track: name, code: 'SUB_NE_DIALOGUE', fix: '字幕必须等于剧本对白' });
    }
    if (name === 'vo') {
      if (!t.voiceId) issues.push({ track: name, code: 'NO_VOICE_ID', fix: '固定 voiceId' });
      if (shotPack.identity_core?.voiceId && t.voiceId !== shotPack.identity_core.voiceId) {
        issues.push({ track: name, code: 'VOICE_MISMATCH', fix: 'voiceId 必须与角色固定声线一致' });
      }
      if (!hasScriptRef(t)) issues.push({ track: name, code: 'NO_SCRIPT_REF', fix: '配音行必须 scriptRef' });
    }
    if (name === 'bgm' && !hasScriptRef(t) && !t.beatRef && !t.cueId) {
      issues.push({ track: name, code: 'NO_BEAT_REF', fix: 'BGM 必须 beatRef/cueId' });
    }
    if (name === 'sfx' && !hasScriptRef(t)) {
      issues.push({ track: name, code: 'NO_BEAT_REF', fix: 'SFX cue 必须 beatRef' });
    }
  }
  const ok = issues.length === 0;
  return {
    ok,
    mode: 'fake_field_scriptRef',
    issues,
    on_fail: shotPack.gate_policy?.on_fail || 'retry_that_track_only',
    max_retries_per_track: shotPack.gate_policy?.max_retries_per_track || 3,
    never_advance_with: shotPack.gate_policy?.never_advance_with || ['wrong_face', 'rewritten_dialogue'],
  };
}

export function buildShotPackFromCompiled(compiled, extras = {}) {
  const core = compiled.identity_core || extras.identity_core;
  const look = compiled.look_state || extras.look_state;
  const dialogue = extras.dialogue || { lines: [], forbid_rewrite: true };
  const tracks = {
    visual: {
      action: compiled.action || extras.action || '',
      camera: compiled.camera || extras.camera || '',
      executable_prompt: compiled.executable_prompt,
      negative_prompt: extras.negative_prompt || 'wrong face, identity swap, unscripted wardrobe',
      ref_assets: extras.ref_assets || [],
      api_hints: extras.api_hints || { prefer: ['i2i', 'character_ref'], weak: ['pure_t2i'], max_retries: 3 },
      gate: ['identity_core_match', 'look_state_match'],
    },
    dialogue: { ...dialogue, forbid_rewrite: true, gate: ['exact_script_text'] },
    subtitle: extras.subtitle || { cues: (dialogue.lines || []).map((l, i) => ({ start_ms: i * 1000, end_ms: i * 1000 + 1500, text: l.text, scriptRef: l.scriptRef })), gate: ['text_equals_dialogue'] },
    vo: extras.vo || { voiceId: core?.voiceId || core?.voice || 'VO-unset', lines: dialogue.lines || [], align_to: 'subtitle', gate: ['same_voiceId_per_cast', 'text_equals_script'] },
    bgm: extras.bgm || { cueId: 'BGM-default', beatRef: look?.beatId || extras.beatId, enter_ms: 0, gate: ['theme_matches_beat'] },
    sfx: extras.sfx || { cues: [], gate: ['cue_on_beat_sheet'] },
  };
  const pack = {
    shotId: compiled.shotId || compiled.shot_id,
    beatId: look?.beatId || extras.beatId,
    scriptRef: look?.scriptRef || extras.scriptRef,
    identity_core: core,
    look_state: look,
    tracks,
    gate_policy: {
      order: ['dialogue', 'subtitle', 'vo', 'visual', 'bgm', 'sfx'],
      on_fail: 'retry_that_track_only',
      max_retries_per_track: 3,
      never_advance_with: ['wrong_face', 'rewritten_dialogue', 'subtitle_desync', 'wrong_voiceId'],
    },
  };
  pack.gate = gateTracks(pack);
  return pack;
}

export function buildTimelinePack(episode, shotPacks, globalLocks = {}) {
  return {
    episode,
    shots: shotPacks.map((p) => p.shotId),
    packs: shotPacks,
    global_locks: {
      dialogue_source: 'script_only',
      subtitle_must_match_dialogue: true,
      ...globalLocks,
    },
    assembly_gate: {
      all_shot_gates_pass: shotPacks.every((p) => p.gate?.ok),
      no_track_missing_scriptRef: shotPacks.every((p) => p.gate?.ok),
    },
    note: '外站 API 只消费编译包；失败只重做该轨该镜',
  };
}

export function runShotpackFixtures() {
  const outDir = join(__dir, 'out');
  const tracksPath = join(outDir, 'shotpack-tracks-v1.json');
  const contractPath = join(outDir, 'shotpack-contract-v1.json');
  const timelinePath = join(outDir, 'timelinepack-v1.json');
  const tracksFx = JSON.parse(readFileSync(tracksPath, 'utf8'));
  // ensure identity_core.voiceId for vo gate
  if (tracksFx.identity_core && !tracksFx.identity_core.voiceId && tracksFx.tracks?.vo?.voiceId) {
    tracksFx.identity_core.voiceId = tracksFx.tracks.vo.voiceId;
  }
  const tracksGate = gateTracks(tracksFx);
  const canonFx = runCanonGateFixture(join(outDir, 'canon-gate-fixture-v1.json'));

  // bad pack: missing scriptRef on dialogue
  const bad = JSON.parse(JSON.stringify(tracksFx));
  bad.tracks.dialogue.lines[0].scriptRef = '';
  bad.tracks.dialogue.lines[0].text = '模型乱改的台词';
  const badGate = gateTracks(bad);

  const contract = existsSync(contractPath) ? JSON.parse(readFileSync(contractPath, 'utf8')) : null;
  const timeline = existsSync(timelinePath) ? JSON.parse(readFileSync(timelinePath, 'utf8')) : null;

  const result = {
    at: new Date().toISOString(),
    canon_fixture: { all_matched: canonFx.all_matched, rows: canonFx.rows.map((r) => ({ shotId: r.shotId, expect: r.expect_gate, ok: r.gate_ok, matched: r.matched })) },
    tracks_fixture: { id: tracksFx.id, gate_ok: tracksGate.ok, issues: tracksGate.issues },
    bad_dialogue_fixture: { gate_ok: badGate.ok, expect_fail: true, matched: badGate.ok === false, issues: badGate.issues.slice(0, 4) },
    contract_present: Boolean(contract),
    timeline_present: Boolean(timeline),
    honest: '可控可拦可修；外站 API 一次零失误不保证；不过门不准进成片',
  };
  result.pass = result.canon_fixture.all_matched && result.tracks_fixture.gate_ok && result.bad_dialogue_fixture.matched;
  writeFileSync(join(outDir, 'shotpack-gate-result-2026-09-18.json'), JSON.stringify(result, null, 2));
  try { writeFileSync('/workspace/uploads/2026-09-18-shotpack-gate-result.json', JSON.stringify(result, null, 2)); } catch { /* optional box path */ }
  return result;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const r = runShotpackFixtures();
  console.log(r.pass ? 'PASS' : 'FAIL', JSON.stringify({
    canon: r.canon_fixture.all_matched,
    tracks: r.tracks_fixture.gate_ok,
    bad_caught: r.bad_dialogue_fixture.matched,
  }));
}
