import type {LingxiLang} from "@/lib/lingxi-i18n";
export type CanonicalFood={key:string;query:string;names:Partial<Record<LingxiLang,string>>;aliases:string[]};
const F=(key:string,query:string,names:CanonicalFood["names"],aliases:string[]=[]):CanonicalFood=>({key,query,names,aliases});
const FOODS=[
F("tacos","taco",{zh:"墨西哥塔可",en:"Tacos",ja:"タコス",ko:"타코",fr:"Tacos",de:"Tacos",es:"Tacos",pt:"Tacos",ar:"تاكو"},["tacos","塔可"]),
F("pizza","pizza",{zh:"披萨",en:"Pizza",ja:"ピザ",ko:"피자",fr:"Pizza",de:"Pizza",es:"Pizza",pt:"Pizza",ar:"بيتزا"}),
F("rice","rice",{zh:"米饭",en:"Rice",ja:"ご飯",ko:"밥",fr:"Riz",de:"Reis",es:"Arroz",pt:"Arroz",ar:"أرز"}),
F("egg","egg",{zh:"鸡蛋",en:"Egg",ja:"卵",ko:"달걀",fr:"Œuf",de:"Ei",es:"Huevo",pt:"Ovo",ar:"بيض"}),
F("apple","apple",{zh:"苹果",en:"Apple",ja:"りんご",ko:"사과",fr:"Pomme",de:"Apfel",es:"Manzana",pt:"Maçã",ar:"تفاح"}),
F("milk","milk",{zh:"牛奶",en:"Milk",ja:"牛乳",ko:"우유",fr:"Lait",de:"Milch",es:"Leche",pt:"Leite",ar:"حليب"}),
F("chicken","chicken",{zh:"鸡肉",en:"Chicken",ja:"鶏肉",ko:"닭고기",fr:"Poulet",de:"Hähnchen",es:"Pollo",pt:"Frango",ar:"دجاج"})
];
const norm=(s:string)=>s.trim().toLocaleLowerCase().normalize("NFKC");
const map=new Map<string,CanonicalFood>();for(const f of FOODS)for(const s of [f.key,f.query,...f.aliases,...Object.values(f.names)])if(s)map.set(norm(s),f);
export function canonicalFood(input:string){return map.get(norm(input))??{key:norm(input).replace(/\s+/g,"-"),query:input.trim(),names:{},aliases:[]}}
export function canonicalQuery(input:string){return canonicalFood(input).query}
export function canonicalDisplay(input:string,lang:LingxiLang){const f=canonicalFood(input);return f.names[lang]||f.names.en||input}
