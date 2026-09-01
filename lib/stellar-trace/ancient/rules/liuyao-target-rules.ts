export const ANIMAL_BRANCH: Record<string,string> = {
  cattle:"丑", horse:"午", pig:"亥", sheep:"未", dog:"戌", cat:"寅", chicken:"酉",
};
export const FIVE_ELEMENT_DISTANCE_BASE: Record<string,number> = { water:1, fire:2, wood:3, metal:4, earth:5 };
export const SEASONAL_FACTOR: Record<string,number> = { 旺:2, 相:2, 休:1, 囚:0.5, 死:0.5 };

export function liuyaoAnimalSearchRule(args:{
  species: keyof typeof ANIMAL_BRANCH;
  animalLineState: "生旺"|"休囚"|"空绝"|"胎墓"|"死气";
  prosperDirection?: string | null;
}) {
  const useBranch = ANIMAL_BRANCH[args.species];
  const status = args.animalLineState === "空绝" ? "难寻" : args.animalLineState === "胎墓" ? "有被关拦/困住之象" : args.animalLineState === "死气" ? "凶象，须现实层立即扩大核验" : args.animalLineState === "生旺" ? "可寻象较强" : "证据偏弱";
  return { useBranch, status, searchDirectionZh: args.prosperDirection ?? null, sourceRuleId:"LY-ANIMAL-001" };
}
