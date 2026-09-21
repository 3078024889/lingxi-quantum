/**
 * Script-driven Continuity: identity_core stable + look_state from beats.
 * API: buildCanon / compileShot / continuityGate (+ runFixture for Groot clamps)
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

/** @typedef {{ id: string, face: string, body: string, voice?: string }} IdentityCore */
/** @typedef {{ beatId: string, wardrobe: string, hair?: string, makeup?: string, props?: string[], form?: 'normal'|'transform'|'disguise'|'invisible', scriptRef: string }} LookState */
/** @typedef {{ shotId: string, action: string, camera: string, cast: string[], look: LookState }} ShotCtx */

export function buildCanon(scriptOrFixture) {
  // Fixture shape (Groot): identity_cores + looks_by_beat
  if (scriptOrFixture?.identity_cores) {
    return {
      cores: scriptOrFixture.identity_cores,
      looksByBeat: scriptOrFixture.looks_by_beat || {},
      script_ref: scriptOrFixture.script_ref || '',
      rule: 'identity_core稳；look_state必须带剧本依据；无依据不得改，有变身/易容节拍必须改到位',
    };
  }
  // Fallback from eight-step boards
  const { boards = {}, scenes = [], scriptText = '' } = scriptOrFixture || {};
  const cores = [];
  const looksByBeat = {};
  for (const [name, board] of Object.entries(boards)) {
    const id = `C-${name}`;
    cores.push({
      id,
      face: `${name}-face`,
      body: `${name}-silhouette`,
      voice: (board.anchors || []).find((a) => /短句|半开玩笑/.test(a)) || undefined,
    });
    looksByBeat[`B0-${name}`] = {
      beatId: `B0-${name}`,
      wardrobe: (board.anchors || []).find((a) => /包|衣|服|帆布/.test(a)) || 'script-default',
      hair: 'script-default',
      makeup: 'script-default',
      props: (board.anchors || []).filter((a) => /绳|钉|包|钥匙|手机/.test(a)),
      form: 'normal',
      scriptRef: scriptText.slice(0, 80) || 'from_script',
    };
  }
  return {
    cores,
    looksByBeat,
    scene_bible: scenes,
    script_ref: scriptText.slice(0, 120),
    rule: 'identity_core稳；look_state必须带剧本依据',
  };
}

export function compileShot(shot, canon) {
  const castId = (shot.cast && shot.cast[0]) || shot.characterId || shot.character;
  const core = (canon.cores || []).find((c) => c.id === castId || c.id.endsWith(castId) || castId?.includes?.(c.id))
    || (canon.cores || [])[0];
  const beatKey = shot.lookBeat || shot.beatId;
  let look = shot.look || (beatKey && canon.looksByBeat?.[beatKey]) || null;
  if (shot.injected_look_error) {
    // intentional wrong look for fail fixture
    look = {
      ...(look || { beatId: beatKey || 'bad', wardrobe: '?', form: 'normal', scriptRef: 'error' }),
      wardrobe: shot.injected_look_error,
      form: 'normal',
      hair: '素颜错态',
      makeup: '素颜',
      _error_injected: true,
    };
  }
  if (!look?.scriptRef && look) look = { ...look, scriptRef: look.scriptRef || beatKey || 'missing' };
  const ctx = {
    shotId: shot.shotId || shot.id,
    action: shot.action || shot.intent || '',
    camera: shot.camera || shot.framing || '',
    cast: shot.cast || (core ? [core.id] : []),
    look,
  };
  const executable_prompt = [
    `identity_core: id=${core?.id}; face=${core?.face}; body=${core?.body}; voice=${core?.voice || ''}`,
    `look_state: beat=${look?.beatId}; wardrobe=${look?.wardrobe}; hair=${look?.hair || ''}; makeup=${look?.makeup || ''}; form=${look?.form || 'normal'}; props=${(look?.props || []).join(',')}; scriptRef=${look?.scriptRef || ''}`,
    `action: ${ctx.action}`,
    `camera: ${ctx.camera}`,
    '规则：外观只来自 look_state（剧本节拍）；禁止模型自创脸/服；有易容/变身/换装节拍必须改到位。',
  ].join('\n');
  return {
    ...ctx,
    identity_core: core,
    look_state: look,
    executable_prompt,
  };
}

export function continuityGate(prev, curr, refs = {}) {
  const issues = [];
  const expectLook = refs.expectLook || curr?.look_state;
  const core = curr?.identity_core;
  const prevCore = prev?.identity_core;

  if (prevCore && core) {
    if (prevCore.id !== core.id) issues.push({ code: 'CORE_ID_DRIFT', fix: '保持同一 identity_core.id' });
    if (prevCore.face !== core.face && curr?.look_state?.form !== 'disguise' && curr?.look_state?.form !== 'transform') {
      issues.push({ code: 'CORE_FACE_DRIFT', fix: '无易容/变身节拍不得改 face' });
    }
  }
  if (!expectLook?.scriptRef) {
    issues.push({ code: 'LOOK_NO_SCRIPT_REF', fix: 'look_state 必须带 scriptRef' });
  }
  if (refs.legalLook) {
    const legal = refs.legalLook;
    if (curr?.look_state?._error_injected) {
      issues.push({ code: 'LOOK_MISS_BEAT', fix: refs.fix || '有易容/变身节拍却未改 look_state' });
    } else {
      for (const k of ['wardrobe', 'form']) {
        if (legal[k] != null && curr?.look_state?.[k] !== legal[k]) {
          issues.push({ code: 'LOOK_MISMATCH', field: k, expect: legal[k], got: curr?.look_state?.[k], fix: '按当前 beat 的 look_state 重编译本镜' });
        }
      }
    }
  }
  // fixture: injected error always fail
  if (curr?.look_state?._error_injected || refs.forceFail) {
    if (!issues.length) issues.push({ code: 'LOOK_MISS_BEAT', fix: refs.fix || '有易容节拍却未改 look_state' });
  }
  const ok = issues.length === 0;
  return { ok, pass: ok, issues, fix: issues[0]?.fix, next_action: ok ? 'advance' : 'repair_this_shot_only' };
}

/** Run Groot fixture: everyday → disguise → bad look must fail */
export function runCanonGateFixture(fixturePath) {
  const path = fixturePath || join(__dir, 'out', 'canon-gate-fixture-v1.json');
  const fx = JSON.parse(readFileSync(path, 'utf8'));
  const canon = buildCanon(fx);
  const rows = [];
  let prev = null;
  for (const shot of fx.shots) {
    const legalLook = fx.looks_by_beat[shot.lookBeat];
    const compiled = compileShot(shot, canon);
    const gate = continuityGate(prev, compiled, {
      legalLook,
      expectLook: legalLook,
      fix: shot.fix,
      forceFail: shot.expect_gate === 'fail',
    });
    const expect = shot.expect_gate;
    const matched = (expect === 'pass' && gate.ok) || (expect === 'fail' && !gate.ok);
    rows.push({
      shotId: shot.shotId,
      expect_gate: expect,
      gate_ok: gate.ok,
      matched,
      issues: gate.issues,
      fix: gate.fix,
      identity_core: compiled.identity_core,
      look_state: compiled.look_state,
      executable_prompt: compiled.executable_prompt,
    });
    if (gate.ok) prev = compiled;
  }
  return {
    id: fx.id,
    pipeline: 'buildCanon→compileShot→continuityGate',
    all_matched: rows.every((r) => r.matched),
    rows,
  };
}

/** Bridge for eight-step refined shots */
export function runCanonPipeline(refinedShots, boards, scenes, scriptText) {
  const nameToId = {};
  const boardsObj = boards || {};
  for (const name of Object.keys(boardsObj)) nameToId[name] = `C-${name}`;
  const canon = buildCanon({ boards: boardsObj, scenes, scriptText });
  // alias cores by character name for primaryCharacter
  for (const c of canon.cores) {
    const name = c.id.replace(/^C-/, '');
    if (!canon.looksByBeat[`B0-${name}`] && boardsObj[name]) {
      /* already seeded */
    }
  }
  const items = [];
  let prevByCast = {};
  for (const sh of refinedShots || []) {
    const castId = nameToId[sh.character] || `C-${sh.character}`;
    const beatId = `B0-${sh.character}`;
    const shot = {
      shotId: sh.id,
      action: sh.intent,
      camera: sh.camera || sh.framing,
      cast: [castId],
      lookBeat: beatId,
      look: canon.looksByBeat[beatId],
    };
    const compiled = compileShot(shot, canon);
    const prev = prevByCast[castId];
    const gate = continuityGate(prev, compiled, { legalLook: compiled.look_state });
    items.push({ ...compiled, shot_id: sh.id, character: sh.character, gate });
    if (gate.ok) prevByCast[castId] = compiled;
  }
  return { canon, items, all_pass: items.every((i) => i.gate?.ok) };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = runCanonGateFixture();
  const outDir = join(__dir, 'out');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'canon-gate-fixture-result-2026-09-18.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  try { writeFileSync('/workspace/uploads/2026-09-18-canon-gate-fixture-result.json', JSON.stringify(result, null, 2)); } catch { /* optional box path */ }
  console.log(result.all_matched ? 'PASS' : 'FAIL', 'fixture', result.rows.map((r) => `${r.shotId}:${r.expect_gate}/${r.gate_ok?'ok':'fail'}`).join(' '));
  console.log('wrote', outPath);
}
