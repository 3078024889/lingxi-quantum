import type{LingxiLang}from"@/lib/lingxi-i18n";
export const FOOD_QUERY_ALIASES:Record<string,string>={
 "馒头":"steamed bread bun","饅頭":"steamed bread bun","mantou":"steamed bread bun",
 "包子":"steamed stuffed bun","米饭":"rice cooked","米飯":"rice cooked","白饭":"rice cooked",
 "面条":"noodles cooked","麵條":"noodles cooked","鸡蛋":"egg whole cooked","雞蛋":"egg whole cooked",
 "牛奶":"milk whole","豆浆":"soy milk","豆漿":"soy milk","豆腐":"tofu","鸡胸肉":"chicken breast cooked",
 "雞胸肉":"chicken breast cooked","苹果":"apple","蘋果":"apple","香蕉":"banana","橙子":"orange",
 "沙拉":"salad","水果沙拉":"fruit salad","披萨":"pizza","披薩":"pizza","汉堡":"hamburger","漢堡":"hamburger",
 "ラーメン":"noodles","ご飯":"rice cooked","卵":"egg","牛乳":"milk","사과":"apple","밥":"rice cooked",
 "계란":"egg","우유":"milk","pain":"bread","riz":"rice","oeuf":"egg","milch":"milk","brot":"bread",
 "reis":"rice","ei":"egg","arroz":"rice","huevo":"egg","leche":"milk","pão":"bread","ovo":"egg",
 "leite":"milk","أرز":"rice","خبز":"bread","بيض":"egg","حليب":"milk"
};
const LABELS:Record<string,Partial<Record<LingxiLang,string>>>={
 "steamed bread bun":{zh:"馒头",en:"Steamed bun",ja:"蒸しパン",ko:"찐빵",fr:"Pain vapeur",de:"Gedämpftes Brötchen",es:"Pan al vapor",pt:"Pão cozido no vapor",ar:"خبز مطهو على البخار"},
 "rice cooked":{zh:"米饭",en:"Cooked rice",ja:"ご飯",ko:"밥",fr:"Riz cuit",de:"Gekochter Reis",es:"Arroz cocido",pt:"Arroz cozido",ar:"أرز مطبوخ"},
 "egg":{zh:"鸡蛋",en:"Egg",ja:"卵",ko:"계란",fr:"Œuf",de:"Ei",es:"Huevo",pt:"Ovo",ar:"بيض"},
 "milk":{zh:"牛奶",en:"Milk",ja:"牛乳",ko:"우유",fr:"Lait",de:"Milch",es:"Leche",pt:"Leite",ar:"حليب"},
 "apple":{zh:"苹果",en:"Apple",ja:"りんご",ko:"사과",fr:"Pomme",de:"Apfel",es:"Manzana",pt:"Maçã",ar:"تفاح"},
 "fruit salad":{zh:"水果沙拉",en:"Fruit salad",ja:"フルーツサラダ",ko:"과일 샐러드",fr:"Salade de fruits",de:"Obstsalat",es:"Ensalada de frutas",pt:"Salada de frutas",ar:"سلطة فواكه"}
};
export function normalizeFoodQuery(q:string){const s=q.trim();return FOOD_QUERY_ALIASES[s.toLowerCase()]||FOOD_QUERY_ALIASES[s]||s}
export function localizedFoodName(input:{name_zh?:string|null;name_en?:string|null},lang:LingxiLang,query=""){
 const key=normalizeFoodQuery(query).toLowerCase();for(const[k,v]of Object.entries(LABELS))if(key.includes(k)&&v[lang])return v[lang]!;
 if(lang==="zh"&&input.name_zh&&/[\u3400-\u9fff]/.test(input.name_zh))return input.name_zh;
 return input.name_en||input.name_zh||query;
}
