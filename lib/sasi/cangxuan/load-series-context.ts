import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveContinuityTimeline } from "@/lib/sasi/cangxuan-foundry";

export type DirectorFoundryCharacter = {
  id: string;
  project_id: string | null;
  character_key: string;
  display_name: string;
  permanent_identity: Record<string, unknown>;
  identity_version: number;
};

export type DirectorFoundryContinuity = {
  id: string;
  character_id: string;
  character_key: string;
  display_name: string;
  episode: number;
  scene: number;
  sequence: number;
  script_event: string;
  state_patch: Record<string, unknown>;
  resolvedState: Record<string, unknown>;
};

export type DirectorFoundryKnowledge = {
  id: string;
  category: string;
  title: string;
  statement: string;
  tier: string;
  quality_score: number | null;
};

export type DirectorFoundryPack = {
  characters: DirectorFoundryCharacter[];
  continuity: DirectorFoundryContinuity[];
  knowledge: DirectorFoundryKnowledge[];
  loadedAt: string;
  empty: boolean;
};

export type LoadDirectorFoundryPackOpts = {
  projectId?: string;
  characterKeys?: string[];
  episode?: number;
  characterLimit?: number;
  knowledgeLimit?: number;
  continuityLimit?: number;
};

const PRIORITY_CATEGORIES = new Set(["RULE", "CONTINUITY", "PREFERENCE"]);
const RENSHIN_RE = /人设|人格|renshin|身份板|permanent.?identity|角色锁定|造型锁/i;
const TIER_WEIGHT: Record<string, number> = { gold: 3, silver: 2, bronze: 1 };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function compactJson(value: unknown, max = 360): string {
  try {
    const raw = typeof value === "string" ? value : JSON.stringify(value ?? {});
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
  } catch {
    return "{}";
  }
}

function normalizeKeys(keys: string[] | undefined): string[] {
  if (!keys?.length) return [];
  const out = new Set<string>();
  for (const key of keys) {
    const normalized = String(key ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
    if (normalized.length >= 3) out.add(normalized);
  }
  return [...out].slice(0, 24);
}

/**
 * Force-read Foundry identity boards + continuity (+ priority knowledge / 人设) for drama start.
 * Soft-empty packs are allowed — callers must not block billing video on empty vault.
 */
export async function loadDirectorFoundryPack(
  admin: SupabaseClient,
  userId: string,
  opts: LoadDirectorFoundryPackOpts = {},
): Promise<DirectorFoundryPack> {
  const characterLimit = Math.min(Math.max(opts.characterLimit ?? 8, 1), 12);
  const knowledgeLimit = Math.min(Math.max(opts.knowledgeLimit ?? 10, 1), 16);
  const continuityLimit = Math.min(Math.max(opts.continuityLimit ?? 40, 1), 80);
  const characterKeys = normalizeKeys(opts.characterKeys);
  const episode =
    typeof opts.episode === "number" && Number.isFinite(opts.episode) && opts.episode >= 1
      ? Math.floor(opts.episode)
      : undefined;
  const projectId = typeof opts.projectId === "string" && opts.projectId.length >= 8 ? opts.projectId : undefined;

  let charactersQuery = admin
    .from("cangxuan_characters")
    .select("id,project_id,character_key,display_name,permanent_identity,identity_version,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (characterKeys.length) {
    charactersQuery = charactersQuery.in("character_key", characterKeys);
  }

  const { data: rawCharacters, error: charactersError } = await charactersQuery;
  if (charactersError) throw charactersError;

  let selected = (rawCharacters ?? []) as Array<Record<string, unknown>>;
  if (projectId) {
    const projectScoped = selected.filter((row) => row.project_id === projectId);
    const unscoped = selected.filter((row) => row.project_id == null);
    selected = (projectScoped.length ? [...projectScoped, ...unscoped] : selected).slice(0, characterLimit);
  } else {
    selected = selected.slice(0, characterLimit);
  }

  const characters: DirectorFoundryCharacter[] = selected.map((row) => ({
    id: String(row.id),
    project_id: row.project_id == null ? null : String(row.project_id),
    character_key: String(row.character_key ?? ""),
    display_name: String(row.display_name ?? ""),
    permanent_identity: asRecord(row.permanent_identity),
    identity_version: Number(row.identity_version) || 1,
  }));

  const characterIds = characters.map((c) => c.id);
  const continuity: DirectorFoundryContinuity[] = [];

  if (characterIds.length) {
    let eventsQuery = admin
      .from("cangxuan_continuity_events")
      .select("id,character_id,episode,scene,sequence,script_event,state_patch,created_at")
      .eq("user_id", userId)
      .in("character_id", characterIds)
      .order("episode", { ascending: true })
      .order("scene", { ascending: true })
      .order("sequence", { ascending: true })
      .limit(500);

    if (episode != null) {
      eventsQuery = eventsQuery.lte("episode", episode);
    }

    const { data: rawEvents, error: eventsError } = await eventsQuery;
    if (eventsError) throw eventsError;

    for (const character of characters) {
      const owned = (rawEvents ?? []).filter((event) => event.character_id === character.id);
      const resolved = resolveContinuityTimeline(
        owned.map((event) => ({
          ...event,
          state_patch: asRecord(event.state_patch),
        })),
      );
      const perCharCap = Math.max(4, Math.ceil(continuityLimit / Math.max(characters.length, 1)));
      for (const event of resolved.slice(-perCharCap)) {
        continuity.push({
          id: String(event.id),
          character_id: character.id,
          character_key: character.character_key,
          display_name: character.display_name,
          episode: Number(event.episode) || 1,
          scene: Number(event.scene) || 1,
          sequence: Number(event.sequence) || 1,
          script_event: String(event.script_event ?? ""),
          state_patch: asRecord(event.state_patch),
          resolvedState: asRecord(event.resolvedState),
        });
      }
    }

    continuity.sort((a, b) => a.episode - b.episode || a.scene - b.scene || a.sequence - b.sequence);
    if (continuity.length > continuityLimit) continuity.length = continuityLimit;
  }

  const { data: rawKnowledge, error: knowledgeError } = await admin
    .from("cangxuan_knowledge_items")
    .select("id,category,title,statement,tier,quality_score,created_at")
    .eq("user_id", userId)
    .neq("review_status", "rejected")
    .order("quality_score", { ascending: false })
    .limit(120);
  if (knowledgeError) throw knowledgeError;

  const nameHints = characters.map((c) => c.display_name.toLowerCase()).filter(Boolean);

  const knowledge: DirectorFoundryKnowledge[] = (rawKnowledge ?? [])
    .map((row) => {
      const category = String(row.category ?? "");
      const title = String(row.title ?? "");
      const statement = String(row.statement ?? "");
      const tier = String(row.tier ?? "bronze");
      const quality = typeof row.quality_score === "number" ? row.quality_score : Number(row.quality_score) || 0;
      const text = `${title} ${statement}`;
      const priority = PRIORITY_CATEGORIES.has(category) ? 8 : 0;
      const renshin = RENSHIN_RE.test(text) ? 6 : 0;
      const nameHit = nameHints.some((name) => name && text.toLowerCase().includes(name)) ? 4 : 0;
      const score = priority + renshin + nameHit + (TIER_WEIGHT[tier] ?? 0) * 2 + quality;
      return {
        id: String(row.id),
        category,
        title,
        statement,
        tier,
        quality_score: typeof row.quality_score === "number" ? row.quality_score : Number(row.quality_score) || null,
        score,
      };
    })
    .filter((item) => PRIORITY_CATEGORIES.has(item.category) || RENSHIN_RE.test(`${item.title} ${item.statement}`) || item.score >= 6)
    .sort((a, b) => b.score - a.score || (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, knowledgeLimit)
    .map(({ score: _score, ...item }) => item);

  return {
    characters,
    continuity,
    knowledge,
    loadedAt: new Date().toISOString(),
    empty: characters.length === 0 && continuity.length === 0 && knowledge.length === 0,
  };
}

/** Soft assert: warn when empty, never throw — do not block paid video. */
export function assertDirectorFoundryLoaded(pack: DirectorFoundryPack): DirectorFoundryPack {
  if (pack.empty) {
    console.warn("[cangxuan L5] director foundry pack empty — identity boards not attached; continuing production");
  } else {
    console.info(
      `[cangxuan L5] foundry pack loaded characters=${pack.characters.length} continuity=${pack.continuity.length} knowledge=${pack.knowledge.length}`,
    );
  }
  return pack;
}

export function formatDirectorFoundryPromptBlock(pack: DirectorFoundryPack, maxChars = 1400): string {
  if (pack.empty) return "";
  const lines: string[] = ["【苍玄·开拍强制读库（记起自己；禁术语堆砌） / Foundry】"];

  if (pack.characters.length) {
    lines.push("身份板:");
    for (const character of pack.characters.slice(0, 6)) {
      lines.push(
        `- ${character.display_name}(${character.character_key}) v${character.identity_version}: ${compactJson(character.permanent_identity, 220)}`,
      );
    }
  }

  if (pack.continuity.length) {
    lines.push("连续性:");
    for (const event of pack.continuity.slice(-8)) {
      lines.push(
        `- E${event.episode}/S${event.scene}#${event.sequence} ${event.display_name}: ${event.script_event.slice(0, 80)} | state=${compactJson(event.resolvedState, 120)}`,
      );
    }
  }

  if (pack.knowledge.length) {
    lines.push("规则/偏好/人设:");
    for (const item of pack.knowledge.slice(0, 8)) {
      lines.push(`- [${item.tier}/${item.category}] ${item.title}: ${item.statement.slice(0, 120)}`);
    }
  }

  lines.push("约束: 上述身份板与连续性优先于临场发挥；不可漂移脸型/发型/主服装/声线；未入库处不得编造。");
  let text = lines.join("\n");
  if (text.length > maxChars) text = `${text.slice(0, maxChars - 1)}…`;
  return text;
}

export function composeDirectorProductionPrompt(userPrompt: string, pack: DirectorFoundryPack, maxLen = 4000): string {
  const trimmed = userPrompt.trim();
  const block = formatDirectorFoundryPromptBlock(pack, Math.min(1400, Math.floor(maxLen * 0.35)));
  if (!block) return trimmed.slice(0, maxLen);
  const sep = "\n\n---\n";
  const budget = Math.max(120, maxLen - block.length - sep.length);
  const body = trimmed.length > budget ? `${trimmed.slice(0, budget - 1)}…` : trimmed;
  return `${block}${sep}${body}`.slice(0, maxLen);
}

export function summarizeFoundryPackMeta(pack: DirectorFoundryPack) {
  return {
    loadedAt: pack.loadedAt,
    empty: pack.empty,
    characterIds: pack.characters.map((c) => c.id),
    characterKeys: pack.characters.map((c) => c.character_key),
    continuityEventIds: pack.continuity.map((e) => e.id).slice(0, 40),
    knowledgeIds: pack.knowledge.map((k) => k.id),
    counts: {
      characters: pack.characters.length,
      continuity: pack.continuity.length,
      knowledge: pack.knowledge.length,
    },
  };
}
