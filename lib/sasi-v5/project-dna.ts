export type SasiCharacterDNA = {
  name: string;
  role?: string;
  age?: string;
  appearance?: string;
  hairstyle?: string;
  wardrobe?: string[];
  voice?: string;
  personality?: string;
  negativeConstraints?: string[];
  referenceAssetIds?: string[];
};

export type SasiStyleDNA = {
  color?: string;
  contrast?: string;
  lighting?: string;
  lens?: string;
  composition?: string;
  texture?: string;
  cameraLanguage?: string;
  subtitleStyle?: string;
  font?: string;
  musicStyle?: string;
  transitionStyle?: string;
  negativeConstraints?: string[];
};

function cleanString(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function cleanList(value: unknown, maxItems = 24, maxLen = 180) {
  return Array.isArray(value)
    ? value.slice(0, maxItems).map((v) => cleanString(v, maxLen)).filter(Boolean)
    : [];
}

export function sanitizeProjectDNA(input: unknown) {
  const value = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const charactersRaw = Array.isArray(value.characters) ? value.characters.slice(0, 40) : [];
  const characters: SasiCharacterDNA[] = charactersRaw.flatMap((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const c = row as Record<string, unknown>;
    const name = cleanString(c.name, 100);
    if (!name) return [];
    return [{
      name,
      role: cleanString(c.role, 100) || undefined,
      age: cleanString(c.age, 80) || undefined,
      appearance: cleanString(c.appearance, 1600) || undefined,
      hairstyle: cleanString(c.hairstyle, 500) || undefined,
      wardrobe: cleanList(c.wardrobe),
      voice: cleanString(c.voice, 800) || undefined,
      personality: cleanString(c.personality, 1200) || undefined,
      negativeConstraints: cleanList(c.negativeConstraints),
      referenceAssetIds: cleanList(c.referenceAssetIds, 24, 100),
    }];
  });

  const s = value.style && typeof value.style === "object" && !Array.isArray(value.style)
    ? value.style as Record<string, unknown>
    : {};
  const style: SasiStyleDNA = {
    color: cleanString(s.color, 500) || undefined,
    contrast: cleanString(s.contrast, 300) || undefined,
    lighting: cleanString(s.lighting, 800) || undefined,
    lens: cleanString(s.lens, 500) || undefined,
    composition: cleanString(s.composition, 800) || undefined,
    texture: cleanString(s.texture, 500) || undefined,
    cameraLanguage: cleanString(s.cameraLanguage, 1200) || undefined,
    subtitleStyle: cleanString(s.subtitleStyle, 800) || undefined,
    font: cleanString(s.font, 200) || undefined,
    musicStyle: cleanString(s.musicStyle, 600) || undefined,
    transitionStyle: cleanString(s.transitionStyle, 600) || undefined,
    negativeConstraints: cleanList(s.negativeConstraints),
  };

  return { characters, style };
}
