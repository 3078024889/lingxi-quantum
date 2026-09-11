import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type FoundryKnowledgeHit = {
  id: string;
  title: string;
  statement: string;
  category: string;
  tier: string;
  quality_score: number | null;
  score: number;
};

export type FoundryCharacterHit = {
  id: string;
  display_name: string;
  character_key: string;
  identity_slice: string;
};

export type RetrieveFoundryContextResult = {
  items: FoundryKnowledgeHit[];
  characters: FoundryCharacterHit[];
  query: string;
};

export type RetrieveFoundryContextOpts = {
  knowledgeLimit?: number;
  characterLimit?: number;
  candidatePool?: number;
};

const TIER_WEIGHT: Record<string, number> = { gold: 3, silver: 2, bronze: 1 };

function tokenize(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/[^\u4e00-\u9fff\w\s-]/g, " ")
    .trim();
  if (!normalized) return [];
  const parts = normalized.split(/\s+/).filter(Boolean);
  const tokens = new Set<string>();
  for (const part of parts) {
    if (part.length >= 2) tokens.add(part);
    if (/[\u4e00-\u9fff]/.test(part) && part.length >= 2) {
      for (let i = 0; i < part.length - 1; i += 1) {
        tokens.add(part.slice(i, i + 2));
      }
      if (part.length >= 3) tokens.add(part.slice(0, 3));
    }
  }
  return [...tokens].slice(0, 24);
}

function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function scoreText(haystack: string, tokens: string[]): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (lower.includes(token)) score += token.length >= 3 ? 2 : 1;
  }
  return score;
}

function identitySlice(identity: unknown, max = 280): string {
  try {
    const raw = typeof identity === "string" ? identity : JSON.stringify(identity ?? {});
    return raw.length > max ? `${raw.slice(0, max)}…` : raw;
  } catch {
    return "{}";
  }
}

/**
 * Retrieve private Foundry knowledge + character summaries for Ask grounding.
 * Uses ILIKE candidate pull when possible, then ranks by keyword overlap in TS.
 */
export async function retrieveFoundryContext(
  admin: SupabaseClient,
  userId: string,
  query: string,
  opts: RetrieveFoundryContextOpts = {},
): Promise<RetrieveFoundryContextResult> {
  const knowledgeLimit = Math.min(Math.max(opts.knowledgeLimit ?? 10, 1), 12);
  const characterLimit = Math.min(Math.max(opts.characterLimit ?? 3, 1), 5);
  const candidatePool = Math.min(Math.max(opts.candidatePool ?? 80, knowledgeLimit), 120);
  const trimmed = query.trim();
  const tokens = tokenize(trimmed);

  let itemsQuery = admin
    .from("cangxuan_knowledge_items")
    .select("id,title,statement,category,tier,quality_score,created_at")
    .eq("user_id", userId)
    .neq("review_status", "rejected")
    .order("created_at", { ascending: false })
    .limit(candidatePool);

  if (tokens.length) {
    const primary = escapeIlike(tokens.slice(0, 4).join("%"));
    itemsQuery = itemsQuery.or(`title.ilike.%${primary}%,statement.ilike.%${primary}%`);
  }

  let { data: rawItems, error: itemsError } = await itemsQuery;
  if (itemsError || !(rawItems?.length)) {
    const fallback = await admin
      .from("cangxuan_knowledge_items")
      .select("id,title,statement,category,tier,quality_score,created_at")
      .eq("user_id", userId)
      .neq("review_status", "rejected")
      .order("quality_score", { ascending: false })
      .limit(candidatePool);
    if (fallback.error) throw fallback.error;
    rawItems = fallback.data;
  }

  const ranked: FoundryKnowledgeHit[] = (rawItems ?? [])
    .map((row) => {
      const textScore = scoreText(`${row.title} ${row.statement}`, tokens);
      const tierBoost = TIER_WEIGHT[String(row.tier)] ?? 0;
      const quality = typeof row.quality_score === "number" ? row.quality_score : Number(row.quality_score) || 0;
      const score = textScore * 10 + tierBoost * 2 + quality;
      return {
        id: row.id as string,
        title: String(row.title ?? ""),
        statement: String(row.statement ?? ""),
        category: String(row.category ?? ""),
        tier: String(row.tier ?? "bronze"),
        quality_score: typeof row.quality_score === "number" ? row.quality_score : Number(row.quality_score) || null,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, knowledgeLimit);

  const items =
    tokens.length && ranked.every((item) => item.score < 2)
      ? ranked.filter((item) => item.tier === "gold" || item.tier === "silver").slice(0, Math.min(4, knowledgeLimit))
      : ranked;

  const { data: rawCharacters, error: charactersError } = await admin
    .from("cangxuan_characters")
    .select("id,display_name,character_key,permanent_identity,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(40);
  if (charactersError) throw charactersError;

  const queryLower = trimmed.toLowerCase();
  const named = (rawCharacters ?? []).filter((row) => {
    const name = String(row.display_name ?? "").toLowerCase();
    const key = String(row.character_key ?? "").toLowerCase();
    return name && (queryLower.includes(name) || tokens.some((t) => name.includes(t) || key.includes(t)));
  });
  const characterSource = named.length ? named : (rawCharacters ?? []).slice(0, characterLimit);
  const characters: FoundryCharacterHit[] = characterSource.slice(0, characterLimit).map((row) => ({
    id: row.id as string,
    display_name: String(row.display_name ?? ""),
    character_key: String(row.character_key ?? ""),
    identity_slice: identitySlice(row.permanent_identity),
  }));

  return { items, characters, query: trimmed };
}
