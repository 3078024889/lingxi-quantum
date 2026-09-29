import type {LingxiLang} from "@/lib/lingxi-i18n";

export const FOOD_LANGS=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;

type Entity={
 canonical:string;
 names:Partial<Record<LingxiLang,string>>;
 aliases:string[];
 region?:string[];
};

const E:Entity[]=[
 {canonical:"tacos",names:{zh:"墨西哥塔可",en:"Tacos",ja:"タコス",ko:"타코",fr:"Tacos",de:"Tacos",es:"Tacos",pt:"Tacos",ar:"تاكو"},aliases:["taco","tacos","墨西哥塔可","塔可","タコス","타코","تاكو"],region:["MX","US"]},
 {canonical:"rice",names:{zh:"米饭",en:"Cooked rice",ja:"ご飯",ko:"밥",fr:"Riz cuit",de:"Gekochter Reis",es:"Arroz cocido",pt:"Arroz cozido",ar:"أرز مطبوخ"},aliases:["rice","cooked rice","白米饭","米饭","ご飯","밥","riz","reis","arroz","أرز"]},
 {canonical:"fried rice",names:{zh:"炒饭",en:"Fried rice",ja:"チャーハン",ko:"볶음밥",fr:"Riz frit",de:"Gebratener Reis",es:"Arroz frito",pt:"Arroz frito",ar:"أرز مقلي"},aliases:["fried rice","egg fried rice","炒饭","蛋炒饭","チャーハン","볶음밥","riz frit","gebratener reis","arroz frito","أرز مقلي"]},
 {canonical:"dumplings",names:{zh:"饺子",en:"Dumplings",ja:"餃子",ko:"만두",fr:"Raviolis",de:"Teigtaschen",es:"Empanadillas",pt:"Bolinhos recheados",ar:"زلابية محشوة"},aliases:["dumplings","dumpling","饺子","水饺","餃子","만두"]},
 {canonical:"noodles",names:{zh:"面条",en:"Noodles",ja:"麺",ko:"국수",fr:"Nouilles",de:"Nudeln",es:"Fideos",pt:"Macarrão",ar:"نودلز"},aliases:["noodles","面条","面","麺","국수","nouilles","nudeln","fideos","macarrão","نودلز"]},
 {canonical:"ramen",names:{zh:"拉面",en:"Ramen",ja:"ラーメン",ko:"라멘",fr:"Ramen",de:"Ramen",es:"Ramen",pt:"Ramen",ar:"رامن"},aliases:["ramen","拉面","ラーメン","라멘","رامن"]},
 {canonical:"sushi",names:{zh:"寿司",en:"Sushi",ja:"寿司",ko:"초밥",fr:"Sushi",de:"Sushi",es:"Sushi",pt:"Sushi",ar:"سوشي"},aliases:["sushi","寿司","초밥","سوشي"]},
 {canonical:"bibimbap",names:{zh:"韩式拌饭",en:"Bibimbap",ja:"ビビンバ",ko:"비빔밥",fr:"Bibimbap",de:"Bibimbap",es:"Bibimbap",pt:"Bibimbap",ar:"بيبيمباب"},aliases:["bibimbap","韩式拌饭","拌饭","ビビンバ","비빔밥","بيبيمباب"]},
 {canonical:"pho",names:{zh:"越南河粉",en:"Pho",ja:"フォー",ko:"쌀국수",fr:"Phở",de:"Pho",es:"Pho",pt:"Pho",ar:"فو"},aliases:["pho","phở","越南河粉","フォー","쌀국수","فو"]},
 {canonical:"pizza",names:{zh:"披萨",en:"Pizza",ja:"ピザ",ko:"피자",fr:"Pizza",de:"Pizza",es:"Pizza",pt:"Pizza",ar:"بيتزا"},aliases:["pizza","披萨","比萨","ピザ","피자","بيتزا"]},
 {canonical:"hamburger",names:{zh:"汉堡",en:"Hamburger",ja:"ハンバーガー",ko:"햄버거",fr:"Hamburger",de:"Hamburger",es:"Hamburguesa",pt:"Hambúrguer",ar:"برغر"},aliases:["hamburger","burger","汉堡","ハンバーガー","햄버거","hamburguesa","hambúrguer","برغر"]},
 {canonical:"chicken curry",names:{zh:"咖喱鸡",en:"Chicken curry",ja:"チキンカレー",ko:"치킨 카레",fr:"Curry de poulet",de:"Hähnchencurry",es:"Curry de pollo",pt:"Caril de frango",ar:"كاري الدجاج"},aliases:["chicken curry","咖喱鸡","チキンカレー","치킨 카레","curry de poulet","hähnchencurry","curry de pollo","caril de frango","كاري الدجاج"]},
 {canonical:"apple",names:{zh:"苹果",en:"Apple",ja:"りんご",ko:"사과",fr:"Pomme",de:"Apfel",es:"Manzana",pt:"Maçã",ar:"تفاح"},aliases:["apple","苹果","りんご","사과","pomme","apfel","manzana","maçã","تفاح"]},
 {canonical:"banana",names:{zh:"香蕉",en:"Banana",ja:"バナナ",ko:"바나나",fr:"Banane",de:"Banane",es:"Plátano",pt:"Banana",ar:"موز"},aliases:["banana","香蕉","バナナ","바나나","banane","plátano","موز"]},
 {canonical:"dragon fruit",names:{zh:"火龙果",en:"Dragon fruit",ja:"ドラゴンフルーツ",ko:"용과",fr:"Fruit du dragon",de:"Drachenfrucht",es:"Pitahaya",pt:"Pitaya",ar:"فاكهة التنين"},aliases:["dragon fruit","pitaya","pitahaya","火龙果","ドラゴンフルーツ","용과","fruit du dragon","drachenfrucht","فاكهة التنين"]},
 {canonical:"egg",names:{zh:"鸡蛋",en:"Egg",ja:"卵",ko:"계란",fr:"Œuf",de:"Ei",es:"Huevo",pt:"Ovo",ar:"بيض"},aliases:["egg","鸡蛋","蛋","卵","계란","œuf","oeuf","ei","huevo","ovo","بيض"]},
 {canonical:"chicken breast",names:{zh:"鸡胸肉",en:"Chicken breast",ja:"鶏むね肉",ko:"닭가슴살",fr:"Blanc de poulet",de:"Hähnchenbrust",es:"Pechuga de pollo",pt:"Peito de frango",ar:"صدر دجاج"},aliases:["chicken breast","鸡胸肉","鶏むね肉","닭가슴살","blanc de poulet","hähnchenbrust","pechuga de pollo","peito de frango","صدر دجاج"]},
 {canonical:"salmon",names:{zh:"三文鱼",en:"Salmon",ja:"サーモン",ko:"연어",fr:"Saumon",de:"Lachs",es:"Salmón",pt:"Salmão",ar:"سلمون"},aliases:["salmon","三文鱼","鲑鱼","サーモン","연어","saumon","lachs","salmón","salmão","سلمون"]},
 {canonical:"avocado",names:{zh:"牛油果",en:"Avocado",ja:"アボカド",ko:"아보카도",fr:"Avocat",de:"Avocado",es:"Aguacate",pt:"Abacate",ar:"أفوكادو"},aliases:["avocado","牛油果","鳄梨","アボカド","아보카도","avocat","aguacate","abacate","أفوكادو"]},
 {canonical:"broccoli",names:{zh:"西兰花",en:"Broccoli",ja:"ブロッコリー",ko:"브로콜리",fr:"Brocoli",de:"Brokkoli",es:"Brócoli",pt:"Brócolis",ar:"بروكلي"},aliases:["broccoli","西兰花","青花菜","ブロッコリー","브로콜리","brocoli","brokkoli","brócoli","brócolis","بروكلي"]},
];

const norm=(s:string)=>s.normalize("NFKC").trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ");
const index=new Map<string,Entity>();
for(const e of E){index.set(norm(e.canonical),e);for(const a of e.aliases)index.set(norm(a),e);for(const n of Object.values(e.names))if(n)index.set(norm(n),e)}

export function resolveFoodEntity(input:string){
 const n=norm(input);const exact=index.get(n);
 if(exact)return{canonical:exact.canonical,names:exact.names,region:exact.region??[],confidence:1};
 const candidates=E.map(e=>({e,score:e.aliases.concat(e.canonical,Object.values(e.names).filter(Boolean) as string[]).reduce((m,a)=>{
  const x=norm(a); return Math.max(m,x.includes(n)||n.includes(x)?Math.min(x.length,n.length)/Math.max(x.length,n.length):0)
 },0)})).filter(x=>x.score>=.55).sort((a,b)=>b.score-a.score);
 const hit=candidates[0];
 return hit?{canonical:hit.e.canonical,names:hit.e.names,region:hit.e.region??[],confidence:hit.score}:{canonical:n,names:{en:input},region:[],confidence:0};
}
export function foodSearchTerms(input:string){
 const r=resolveFoodEntity(input);const e=index.get(norm(r.canonical));
 return Array.from(new Set([r.canonical,input,...(e?.aliases??[]),...Object.values(e?.names??{}).filter(Boolean) as string[]])).slice(0,16);
}
export function foodDisplayName(input:string,lang:LingxiLang){
 const r=resolveFoodEntity(input);return r.names[lang]||r.names.en||r.canonical;
}
