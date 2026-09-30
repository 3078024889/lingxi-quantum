export const FOOD_LOCALES=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;
export type FoodLocale=(typeof FOOD_LOCALES)[number];
type Names=Record<FoodLocale,string>;
export type CanonicalFood={key:string;query:string;names:Names;aliases:string[]};

const F=(key:string,query:string,names:Names,aliases:string[]=[]):CanonicalFood=>({key,query,names,aliases});
export const COMMON_FOODS:CanonicalFood[]=[
F("tacos","taco",{zh:"墨西哥塔可",en:"Tacos",ja:"タコス",ko:"타코",fr:"Tacos",de:"Tacos",es:"Tacos",pt:"Tacos",ar:"تاكو"},["taco","tacos","墨西哥塔可","塔可","タコス","타코","تاكو"]),
F("pizza","pizza",{zh:"披萨",en:"Pizza",ja:"ピザ",ko:"피자",fr:"Pizza",de:"Pizza",es:"Pizza",pt:"Pizza",ar:"بيتزا"},["pizza","披萨","比萨","ピザ","피자","بيتزا"]),
F("rice","rice",{zh:"米饭",en:"Rice",ja:"ご飯",ko:"밥",fr:"Riz",de:"Reis",es:"Arroz",pt:"Arroz",ar:"أرز"},["rice","米饭","大米","ご飯","밥","riz","reis","arroz","أرز"]),
F("egg","egg",{zh:"鸡蛋",en:"Egg",ja:"卵",ko:"달걀",fr:"Œuf",de:"Ei",es:"Huevo",pt:"Ovo",ar:"بيض"},["egg","eggs","鸡蛋","蛋","卵","달걀","œuf","ei","huevo","ovo","بيض"]),
F("apple","apple",{zh:"苹果",en:"Apple",ja:"りんご",ko:"사과",fr:"Pomme",de:"Apfel",es:"Manzana",pt:"Maçã",ar:"تفاح"},["apple","苹果","りんご","사과","pomme","apfel","manzana","maçã","تفاح"]),
F("milk","milk",{zh:"牛奶",en:"Milk",ja:"牛乳",ko:"우유",fr:"Lait",de:"Milch",es:"Leche",pt:"Leite",ar:"حليب"},["milk","牛奶","牛乳","우유","lait","milch","leche","leite","حليب"]),
F("chicken","chicken",{zh:"鸡肉",en:"Chicken",ja:"鶏肉",ko:"닭고기",fr:"Poulet",de:"Hähnchen",es:"Pollo",pt:"Frango",ar:"دجاج"},["chicken","鸡肉","鶏肉","닭고기","poulet","hähnchen","pollo","frango","دجاج"])
];
const norm=(s:string)=>s.trim().toLocaleLowerCase().normalize("NFKC");
const byAlias=new Map<string,CanonicalFood>(); for(const f of COMMON_FOODS){byAlias.set(norm(f.key),f);for(const a of [f.query,...f.aliases,...Object.values(f.names)])byAlias.set(norm(a),f)}
export function resolveCanonicalFood(input:string){return byAlias.get(norm(input))??{key:norm(input).replace(/\s+/g,"-"),query:input.trim(),names:Object.fromEntries(FOOD_LOCALES.map(l=>[l,input.trim()])) as Names,aliases:[input.trim()]}}
export function displayFood(keyOrLabel:string,locale:FoodLocale){return resolveCanonicalFood(keyOrLabel).names[locale]}
