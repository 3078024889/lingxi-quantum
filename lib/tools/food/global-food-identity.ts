import{foodRegionsForCountry,type FoodRegionCode}from"./region-hierarchy";
export type FoodIdentity={
 key:string; names:Record<string,string>; aliases:string[]; countries:string[]; regions:FoodRegionCode[];
 category:string; searchTerms:string[]; components?:string[];
};
const F=(key:string,zh:string,en:string,countries:string[],category:string,aliases:string[]=[],components?:string[]):FoodIdentity=>({
 key,names:{zh,en},aliases:[zh,en,...aliases],countries,regions:[...new Set(countries.flatMap(foodRegionsForCountry))],category,
 searchTerms:[en,key.replaceAll("-"," "),...aliases],components
});
export const GLOBAL_FOOD_IDENTITIES:FoodIdentity[]=[
 F("youtiao","油条","Youtiao / Chinese fried dough",["CN","HK","TW","SG","MY"],"fried-dough",["油條","油炸鬼","油炸粿","you tiao","yu char kway","cakoi","chinese cruller","fried dough stick"]),
 F("jianbing-guozi","煎饼果子","Jianbing guozi",["CN"],"mixed-dish",["煎餅果子","煎饼","jianbing","jian bing"],["crepe","egg","sauce"]),
 F("baozi","包子","Baozi / steamed stuffed bun",["CN","SG","MY"],"steamed-bun",["肉包","菜包","steamed bun"]),
 F("mantou","馒头","Mantou / steamed bread",["CN","SG","MY"],"steamed-bun",["饅頭","steamed bread","chinese steamed bun"]),
 F("congee","粥","Congee / rice porridge",["CN","HK","TW","SG","MY"],"porridge",["白粥","稀饭","稀飯","rice porridge"]),
 F("cheung-fun","肠粉","Cheung fun / rice noodle rolls",["CN","HK","SG","MY"],"rice-noodle",["腸粉","猪肠粉","豬腸粉","rice noodle roll"]),
 F("shaomai","烧卖","Shaomai / siu mai",["CN","HK","SG","MY"],"dumpling",["燒賣","烧麦","燒麥","siu mai","shumai"]),
 F("zongzi","粽子","Zongzi / sticky rice dumpling",["CN","HK","TW","SG","MY"],"rice-dish",["粽","rice dumpling","sticky rice dumpling"]),
 F("liangpi","凉皮","Liangpi / cold skin noodles",["CN"],"noodle",["涼皮","cold skin noodles"]),
 F("roujiamo","肉夹馍","Roujiamo",["CN"],"sandwich",["肉夾饃","chinese pork burger"]),
 F("malatang","麻辣烫","Malatang",["CN","SG","MY"],"mixed-dish",["麻辣燙","mala tang"],["broth","vegetables","protein","noodles"]),
 F("luosifen","螺蛳粉","Luosifen",["CN"],"noodle",["螺螄粉","luo si fen","river snail rice noodles"]),
 F("hulatang","胡辣汤","Hulatang / pepper soup",["CN"],"soup",["胡辣湯","hot pepper soup"]),
 F("char-siu","叉烧","Char siu / Chinese BBQ pork",["CN","HK","SG","MY"],"meat",["叉燒","char siew","bbq pork"]),
 F("wonton-noodles","云吞面","Wonton noodles",["CN","HK","SG","MY"],"noodle",["雲吞麵","馄饨面","餛飩麵"]),
 F("hainanese-chicken-rice","海南鸡饭","Hainanese chicken rice",["SG","MY","CN"],"rice-dish",["海南雞飯","chicken rice"]),
 F("laksa","叻沙","Laksa",["SG","MY"],"noodle",["laksa lemak"]),
 F("nasi-lemak","椰浆饭","Nasi lemak",["SG","MY"],"rice-dish",["椰漿飯"]),
 F("kaya-toast","咖椰吐司","Kaya toast",["SG","MY"],"bread",["咖椰面包","kaya bread"]),
 F("char-kway-teow","炒粿条","Char kway teow",["SG","MY"],"noodle",["炒粿條","炒贵刁"]),
 F("nasi-goreng","印尼炒饭","Nasi goreng",["ID","MY","SG"],"rice-dish",["印尼炒飯"]),
 F("pad-thai","泰式炒河粉","Pad Thai",["TH"],"noodle",["泰式炒粉","phat thai"]),
 F("pho","越南河粉","Pho",["VN"],"noodle",["越南粉","phở"]),
 F("banh-mi","越南法棍","Banh mi",["VN"],"sandwich",["越南三明治","bánh mì"]),
 F("sushi","寿司","Sushi",["JP"],"rice-dish",["壽司","すし"]),
 F("ramen","拉面","Ramen",["JP"],"noodle",["拉麵","ラーメン"]),
 F("udon","乌冬面","Udon",["JP"],"noodle",["烏冬麵","うどん"]),
 F("tempura","天妇罗","Tempura",["JP"],"fried-food",["天婦羅","てんぷら"]),
 F("onigiri","饭团","Onigiri",["JP"],"rice-dish",["飯糰","おにぎり","rice ball"]),
 F("bibimbap","韩式拌饭","Bibimbap",["KR"],"rice-dish",["韓式拌飯","비빔밥"]),
 F("kimchi-jjigae","泡菜汤","Kimchi jjigae",["KR"],"soup",["泡菜湯","김치찌개"]),
 F("tteokbokki","辣炒年糕","Tteokbokki",["KR"],"rice-cake",["떡볶이"]),
 F("bulgogi","韩式烤肉","Bulgogi",["KR"],"meat",["韓式烤肉","불고기"]),
 F("biryani","印度香饭","Biryani",["IN"],"rice-dish",["印度香飯","बिरयानी"]),
 F("dosa","多萨薄饼","Dosa",["IN"],"crepe",["多薩","dosai"]),
 F("idli","蒸米糕","Idli",["IN"],"steamed-cake",["इडली"]),
 F("tacos","塔可","Tacos",["MX","US"],"mixed-dish",["墨西哥塔可","taco"]),
 F("burrito","墨西哥卷饼","Burrito",["MX","US"],"wrap",["墨西哥卷餅"]),
 F("quesadilla","墨西哥芝士饼","Quesadilla",["MX","US"],"mixed-dish",["墨西哥芝士餅"]),
 F("paella","西班牙海鲜饭","Paella",["ES"],"rice-dish",["西班牙海鮮飯"]),
 F("croissant","可颂","Croissant",["FR"],"pastry",["可頌","羊角包"]),
 F("fish-and-chips","炸鱼薯条","Fish and chips",["GB"],"mixed-dish",["炸魚薯條"]),
 F("fruit-salad","水果沙拉","Fruit salad",["US","GB","FR","DE","ES","SG","CN"],"fruit",["salade de fruits","obstsalat","ensalada de frutas","salada de frutas","سلطة فواكه"]),
 F("fruit-platter","水果拼盘","Mixed fruit platter",["CN","HK","TW","SG","MY","US"],"fruit",["水果拼盤","水果盘","水果盤","fruit platter","mixed fruit plate","mixed fruit"]),
 F("cheese-platter","奶酪拼盘","Cheese platter",["FR","GB","US"],"mixed-dish",["芝士拼盘","奶酪拼盤","cheese board","charcuterie board"])
];
const norm=(s:string)=>s.normalize("NFKC").trim().toLowerCase().replace(/[’']/g,"").replace(/[_-]+/g," ").replace(/\s+/g," ");
const index=new Map<string,FoodIdentity>();
for(const f of GLOBAL_FOOD_IDENTITIES)for(const a of [f.key,...f.aliases,...Object.values(f.names)])index.set(norm(a),f);
export function resolveFoodIdentity(input:string,country?:string|null){
 const n=norm(input);const exact=index.get(n);if(exact)return{food:exact,score:1,reason:"exact-alias"};
 const regionSet=new Set(foodRegionsForCountry(country));let best:{food:FoodIdentity;score:number;reason:string}|null=null;
 for(const f of GLOBAL_FOOD_IDENTITIES){
  let score=0;for(const a of [f.key,...f.aliases,...Object.values(f.names)]){const q=norm(a);if(q.includes(n)||n.includes(q))score=Math.max(score,Math.min(q.length,n.length)/Math.max(q.length,n.length));}
  if(f.countries.includes(String(country||"").toUpperCase()))score+=.12;else if(f.regions.some(r=>regionSet.has(r)))score+=.06;
  score=Math.min(score,1);if(score>=.56&&(!best||score>best.score))best={food:f,score,reason:"fuzzy-region"};
 } return best;
}
export function foodSearchTerms(input:string,country?:string|null){
 const r=resolveFoodIdentity(input,country);return r?Array.from(new Set([input,r.food.names.en,r.food.names.zh,...r.food.aliases,...r.food.searchTerms])).slice(0,32):[input];
}
