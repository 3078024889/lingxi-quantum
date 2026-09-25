/**
 * Thinnest Node → Python ContinuityGate bridge.
 * Calls copernicus-twentywatts/engine/continuity_gate_foundation.py `bridge`
 * for locked identity facts + temporal look_state.
 *
 * On any failure: returns { ok:false, fallback:true } so callers keep the
 * existing fake-field ContinuityGate behavior. Does NOT claim production_ready.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

/** Candidate roots for the Python weld (box + common Windows mounts). */
export function resolveWeldScript(explicit) {
  if (explicit && existsSync(explicit)) return explicit;
  const env = process.env.CONTINUITY_GATE_FOUNDATION_PY;
  if (env && existsSync(env)) return env;
  const candidates = [
    // box layout
    resolve('/workspace/copernicus-twentywatts/engine/continuity_gate_foundation.py'),
    // sibling of lingxi-quantum on box
    resolve(__dir, '../../../../copernicus-twentywatts/engine/continuity_gate_foundation.py'),
    // Windows D: sync targets (when Node runs there)
    'D:/二十瓦特/copernicus-twentywatts/engine/continuity_gate_foundation.py',
    'D:/copernicus-twentywatts/engine/continuity_gate_foundation.py',
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function pickPython() {
  const env = process.env.CONTINUITY_BRIDGE_PYTHON;
  if (env) return env;
  // Prefer python3 on box/linux; python on Windows if needed
  for (const bin of ['python3', 'python']) {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return bin;
  }
  return 'python3';
}

/**
 * Ask Python adapter for locked facts + look_state for one character.
 * @param {{ character?: string, project?: string, proposed?: Record<string, unknown>, weldScript?: string, timeoutMs?: number }} opts
 */
export function fetchFoundationCanon(opts = {}) {
  const character = opts.character || '望舒';
  const project = opts.project || 'Galileo-望舒';
  const weld = resolveWeldScript(opts.weldScript);
  if (!weld) {
    return {
      ok: false,
      fallback: true,
      character,
      project,
      locked_facts: {},
      look_states: {},
      error: 'continuity_gate_foundation.py not found',
      production_ready: false,
      source: 'continuity-foundation-bridge.mjs',
    };
  }
  const py = pickPython();
  const args = [
    weld,
    'bridge',
    '--character', character,
    '--project', project,
  ];
  if (opts.proposed && typeof opts.proposed === 'object') {
    args.push('--proposed-json', JSON.stringify(opts.proposed));
  }
  const r = spawnSync(py, args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs || 20000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  if (r.error || r.status !== 0) {
    const err = r.error?.message || (r.stderr || '').trim() || `exit ${r.status}`;
    return {
      ok: false,
      fallback: true,
      character,
      project,
      locked_facts: {},
      look_states: {},
      error: err,
      stderr: (r.stderr || '').slice(0, 500),
      production_ready: false,
      source: 'continuity-foundation-bridge.mjs',
      weld,
    };
  }
  // Parse last JSON object from stdout (ignore trailing non-JSON noise)
  const out = (r.stdout || '').trim();
  let payload;
  try {
    payload = JSON.parse(out);
  } catch {
    const start = out.indexOf('{');
    const end = out.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        payload = JSON.parse(out.slice(start, end + 1));
      } catch (e) {
        return {
          ok: false,
          fallback: true,
          character,
          project,
          locked_facts: {},
          look_states: {},
          error: `JSON parse failed: ${e.message}`,
          production_ready: false,
          source: 'continuity-foundation-bridge.mjs',
          weld,
        };
      }
    } else {
      return {
        ok: false,
        fallback: true,
        character,
        project,
        locked_facts: {},
        look_states: {},
        error: 'no JSON in bridge stdout',
        production_ready: false,
        source: 'continuity-foundation-bridge.mjs',
        weld,
      };
    }
  }
  return {
    ...payload,
    ok: payload?.ok !== false,
    fallback: payload?.ok === false,
    production_ready: false,
    weld,
    source: payload?.source || 'continuity-foundation-bridge.mjs',
  };
}

/**
 * Merge foundation locked facts into a gate refs bag (optional).
 * Does not mutate existing fake-field gate logic when bridge fails.
 */
export function foundationRefsForGate(bridge, refs = {}) {
  if (!bridge?.ok) return { ...refs, foundation: null, foundation_fallback: true };
  return {
    ...refs,
    foundation: {
      locked_facts: bridge.locked_facts || {},
      look_states: bridge.look_states || {},
      character: bridge.character,
      project: bridge.project,
    },
    foundation_fallback: false,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const character = process.argv[2] || '望舒';
  const project = process.argv[3] || 'Galileo-望舒';
  const result = fetchFoundationCanon({ character, project });
  console.log(JSON.stringify(result, null, 2));
  const hair = result.locked_facts?.hair;
  const wardrobe = result.look_states?.wardrobe;
  const pass =
    result.ok === true &&
    hair?.locked === true &&
    hair?.value === '乌发如瀑' &&
    wardrobe?.value === '银白月华纱衣';
  console.log(pass ? 'PASS' : 'FAIL', 'wangshu-bridge', {
    hair: hair?.value,
    hair_locked: hair?.locked,
    wardrobe: wardrobe?.value,
    fallback: result.fallback || false,
    production_ready: false,
  });
  process.exit(pass ? 0 : 1);
}
