import type {LingxiLang} from "@/lib/lingxi-i18n";

export type CommonFoodVocabulary={label:string;zh:string;ja?:string;ko?:string;fr?:string;de?:string;es?:string;pt?:string;ar?:string};

export const COMMON_FOOD_VOCABULARY:CommonFoodVocabulary[]=[
 ["apple","苹果"],["banana","香蕉"],["orange","橙子"],["mandarin orange","橘子"],["lemon","柠檬"],["lime","青柠"],
 ["grapefruit","西柚"],["grapes","葡萄"],["strawberry","草莓"],["blueberries","蓝莓"],["raspberries","树莓"],["blackberries","黑莓"],
 ["watermelon","西瓜"],["melon","甜瓜"],["cantaloupe","哈密瓜"],["pineapple","菠萝"],["mango","芒果"],["papaya","木瓜"],
 ["dragon fruit","火龙果"],["kiwi fruit","猕猴桃"],["pear","梨"],["peach","桃子"],["plum","李子"],["cherries","樱桃"],
 ["pomegranate","石榴"],["avocado","牛油果"],["coconut","椰子"],["passion fruit","百香果"],["lychee","荔枝"],["longan","龙眼"],
 ["durian","榴莲"],["persimmon","柿子"],["fig","无花果"],["dates","椰枣"],["fruit salad","水果沙拉"],["mixed fruit plate","水果拼盘"],
 ["tomato","番茄"],["cucumber","黄瓜"],["carrot","胡萝卜"],["broccoli","西兰花"],["cauliflower","花椰菜"],["spinach","菠菜"],
 ["lettuce","生菜"],["cabbage","卷心菜"],["bok choy","青菜"],["celery","芹菜"],["bell pepper","彩椒"],["chili pepper","辣椒"],
 ["onion","洋葱"],["garlic","大蒜"],["mushrooms","蘑菇"],["eggplant","茄子"],["zucchini","西葫芦"],["pumpkin","南瓜"],
 ["sweet potato","红薯"],["potato","土豆"],["corn","玉米"],["green peas","豌豆"],["green beans","四季豆"],["edamame","毛豆"],
 ["rice","米饭"],["brown rice","糙米饭"],["rice porridge","米粥"],["fried rice","炒饭"],["noodles","面条"],["rice noodles","米粉"],
 ["ramen","拉面"],["pasta","意大利面"],["spaghetti","意大利面"],["bread","面包"],["toast","吐司"],["whole wheat bread","全麦面包"],
 ["oatmeal","燕麦粥"],["oats","燕麦"],["quinoa","藜麦"],["couscous","蒸粗麦粉"],["dumplings","饺子"],["steamed bun","包子"],
 ["egg","鸡蛋"],["boiled egg","水煮蛋"],["omelette","煎蛋卷"],["tofu","豆腐"],["tempeh","天贝"],["soy milk","豆浆"],
 ["milk","牛奶"],["yogurt","酸奶"],["cheese","奶酪"],["cottage cheese","茅屋奶酪"],["butter","黄油"],["ice cream","冰淇淋"],
 ["chicken breast","鸡胸肉"],["roast chicken","烤鸡"],["fried chicken","炸鸡"],["beef","牛肉"],["steak","牛排"],["pork","猪肉"],
 ["pork chop","猪排"],["lamb","羊肉"],["duck","鸭肉"],["turkey","火鸡肉"],["sausage","香肠"],["bacon","培根"],
 ["salmon","三文鱼"],["tuna","金枪鱼"],["white fish","白肉鱼"],["shrimp","虾"],["crab","螃蟹"],["lobster","龙虾"],
 ["scallops","扇贝"],["oysters","牡蛎"],["mussels","贻贝"],["squid","鱿鱼"],["octopus","章鱼"],["sashimi","刺身"],
 ["almonds","杏仁"],["peanuts","花生"],["walnuts","核桃"],["cashews","腰果"],["pistachios","开心果"],["mixed nuts","混合坚果"],
 ["peanut butter","花生酱"],["hummus","鹰嘴豆泥"],["beans","豆类"],["chickpeas","鹰嘴豆"],["lentils","扁豆"],["kidney beans","红腰豆"],
 ["youtiao","油条"],["jianbing","煎饼果子"],["baozi","包子"],["mantou","馒头"],["congee","粥"],["cheung fun","肠粉"],["shaomai","烧卖"],["zongzi","粽子"],["malatang","麻辣烫"],["hainanese chicken rice","海南鸡饭"],["laksa","叻沙"],["nasi lemak","椰浆饭"],["char kway teow","炒粿条"],["pho","越南河粉"],["banh mi","越南法棍"],["sushi","寿司"],["ramen","拉面"],["bibimbap","韩式拌饭"],["tteokbokki","辣炒年糕"],["biryani","印度香饭"],["tacos","塔可"],["fruit salad","水果沙拉"],["mixed fruit platter","水果拼盘"],["pizza","披萨"],["hamburger","汉堡"],["hot dog","热狗"],["sandwich","三明治"],["tacos","塔可"],["burrito","墨西哥卷饼"],
 ["sushi","寿司"],["bibimbap","韩式拌饭"],["curry","咖喱"],["chicken curry","咖喱鸡"],["soup","汤"],["salad","沙拉"],
 ["caesar salad","凯撒沙拉"],["french fries","薯条"],["pancakes","松饼"],["waffles","华夫饼"],["cake","蛋糕"],["cheesecake","芝士蛋糕"],
 ["cookie","饼干"],["donut","甜甜圈"],["chocolate","巧克力"],["coffee","咖啡"],["tea","茶"],["orange juice","橙汁"],
 ["smoothie","果昔"],["cola","可乐"],["beer","啤酒"],["wine","葡萄酒"],["water","水"]
].map(([label,zh])=>({label,zh})) as CommonFoodVocabulary[];

const common=new Map(COMMON_FOOD_VOCABULARY.map(x=>[x.label,x]));
export const COMMON_FOOD_CANDIDATES=COMMON_FOOD_VOCABULARY.map(x=>x.label);

export function commonFoodLabel(label:string,lang:LingxiLang){
 const item=common.get(label.toLowerCase().trim());
 if(!item)return label;
 if(lang==="zh")return item.zh;
 if(lang==="en")return item.label;
 return item[lang]||item.label;
}
