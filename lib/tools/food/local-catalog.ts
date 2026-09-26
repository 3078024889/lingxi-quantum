export type LocalFood = {
  food_id:number; code:string; name_zh:string; name_en:string; category:string; aliases:string[];
  kcal_per_100g:number; protein_g_per_100g:number; carbs_g_per_100g:number; fat_g_per_100g:number;
  fiber_g_per_100g:number; sugar_g_per_100g:number; sodium_mg_per_100g:number;
};

const BASE=910000000;
const row=(n:number,code:string,name_zh:string,name_en:string,category:string,aliases:string[],
 kcal:number,protein:number,carbs:number,fat:number,fiber:number,sugar:number,sodium:number):LocalFood=>({
 food_id:BASE+n,code,name_zh,name_en,category,aliases,kcal_per_100g:kcal,
 protein_g_per_100g:protein,carbs_g_per_100g:carbs,fat_g_per_100g:fat,
 fiber_g_per_100g:fiber,sugar_g_per_100g:sugar,sodium_mg_per_100g:sodium
});

export const LOCAL_FOODS:LocalFood[]=[
 row(1,"rice-cooked","米饭","Cooked rice","主食",["米饭","白米饭","熟米饭","rice"],116,2.6,25.9,0.3,0.3,0.1,2),
 row(2,"bread-white","面包","Bread","主食",["面包","白面包","吐司","吐司面包","切片面包","bread","toast"],266,8.9,49.4,3.2,2.7,5.0,491),
 row(3,"bread-whole-wheat","全麦面包","Whole-wheat bread","主食",["全麦面包","全麦吐司","whole wheat bread"],247,13.0,41.0,4.2,6.0,6.0,430),
 row(4,"egg","鸡蛋","Egg","蛋奶",["鸡蛋","水煮蛋","煮鸡蛋","egg"],143,12.6,0.7,9.5,0,0.4,140),
 row(5,"chicken-breast","鸡胸肉","Chicken breast","肉类",["鸡胸肉","鸡胸","chicken breast"],165,31.0,0,3.6,0,0,74),
 row(6,"apple","苹果","Apple","水果",["苹果","apple"],52,0.3,13.8,0.2,2.4,10.4,1),
 row(7,"banana","香蕉","Banana","水果",["香蕉","banana"],89,1.1,22.8,0.3,2.6,12.2,1),
 row(8,"orange","橙子","Orange","水果",["橙子","橙","orange"],47,0.9,11.8,0.1,2.4,9.4,0),
 row(9,"milk","牛奶","Milk","蛋奶",["牛奶","全脂牛奶","milk"],61,3.2,4.8,3.3,0,5.1,43),
 row(10,"soy-milk","豆浆","Soy milk","饮品",["豆浆","soy milk"],33,3.0,1.8,1.6,0.6,0.6,35),
 row(11,"oats","燕麦片","Oats","主食",["燕麦","燕麦片","oats","oatmeal"],379,13.2,67.7,6.5,10.1,1.0,2),
 row(12,"sweet-potato","红薯","Sweet potato","主食",["红薯","地瓜","番薯","sweet potato"],86,1.6,20.1,0.1,3.0,4.2,55),
 row(13,"potato","土豆","Potato","蔬菜",["土豆","马铃薯","potato"],77,2.0,17.5,0.1,2.2,0.8,6),
 row(14,"corn","玉米","Corn","主食",["玉米","甜玉米","corn"],96,3.4,21.0,1.5,2.4,4.5,1),
 row(15,"broccoli","西兰花","Broccoli","蔬菜",["西兰花","青花菜","broccoli"],34,2.8,6.6,0.4,2.6,1.7,33),
 row(16,"spinach","菠菜","Spinach","蔬菜",["菠菜","spinach"],23,2.9,3.6,0.4,2.2,0.4,79),
 row(17,"tomato","西红柿","Tomato","蔬菜",["西红柿","番茄","tomato"],18,0.9,3.9,0.2,1.2,2.6,5),
 row(18,"cucumber","黄瓜","Cucumber","蔬菜",["黄瓜","青瓜","cucumber"],15,0.7,3.6,0.1,0.5,1.7,2),
 row(19,"tofu","豆腐","Tofu","豆制品",["豆腐","嫩豆腐","北豆腐","tofu"],76,8.1,1.9,4.8,0.3,0.6,7),
 row(20,"beef","牛肉","Lean beef","肉类",["牛肉","瘦牛肉","beef"],217,26.1,0,11.8,0,0,60),
 row(21,"pork","猪瘦肉","Lean pork","肉类",["猪肉","瘦猪肉","猪瘦肉","pork"],143,26.0,0,3.5,0,0,62),
 row(22,"salmon","三文鱼","Salmon","鱼类",["三文鱼","鲑鱼","salmon"],208,20.4,0,13.4,0,0,59),
 row(23,"shrimp","虾","Shrimp","海鲜",["虾","虾仁","shrimp"],99,24.0,0.2,0.3,0,0,111),
 row(24,"yogurt","酸奶","Plain yogurt","蛋奶",["酸奶","原味酸奶","yogurt"],61,3.5,4.7,3.3,0,4.7,46),
 row(25,"almond","杏仁","Almonds","坚果",["杏仁","巴旦木","almond"],579,21.2,21.6,49.9,12.5,4.4,1),
 row(26,"peanut","花生","Peanuts","坚果",["花生","peanut"],567,25.8,16.1,49.2,8.5,4.7,18),
 row(27,"avocado","牛油果","Avocado","水果",["牛油果","鳄梨","avocado"],160,2.0,8.5,14.7,6.7,0.7,7),
 row(28,"noodles","面条","Cooked noodles","主食",["面条","白面","noodles"],138,4.5,25.0,2.1,1.2,0.6,5),
 row(29,"rice-porridge","白粥","Rice porridge","主食",["白粥","米粥","稀饭","rice porridge"],46,1.0,10.2,0.1,0.2,0,2),
 row(30,"egg-fried-rice","蛋炒饭","Egg fried rice","主食",["蛋炒饭","炒饭","egg fried rice"],174,5.4,27.2,4.8,1.1,1.2,350)
];

const norm=(x:string)=>x.trim().toLowerCase().replace(/\s+/g,"");
export const isLocalFoodId=(id:number)=>Number.isInteger(id)&&id>BASE&&id<BASE+100000;
export const localFoodById=(id:number)=>LOCAL_FOODS.find(x=>x.food_id===id)||null;

export function searchLocalFoods(q:string,limit=8){
 const n=norm(q); if(!n)return[];
 return LOCAL_FOODS.map(food=>{
  const hay=[food.name_zh,food.name_en,...food.aliases].map(norm);
  const score=hay.some(x=>x===n)?100:hay.some(x=>x.startsWith(n)||n.startsWith(x))?70:hay.some(x=>x.includes(n)||n.includes(x))?50:0;
  return score?{...food,score}:null;
 }).filter(Boolean).sort((a:any,b:any)=>b.score-a.score).slice(0,limit);
}

export function calcLocalFood(id:number,grams:number){
 const f=localFoodById(id); if(!f)return null; const k=grams/100;
 return {food_id:f.food_id,code:f.code,name_zh:f.name_zh,name_en:f.name_en,grams,
  kcal:f.kcal_per_100g*k,protein_g:f.protein_g_per_100g*k,carbs_g:f.carbs_g_per_100g*k,
  fat_g:f.fat_g_per_100g*k,fiber_g:f.fiber_g_per_100g*k,sugar_g:f.sugar_g_per_100g*k,
  sodium_mg:f.sodium_mg_per_100g*k};
}
