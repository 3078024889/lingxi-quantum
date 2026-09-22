import type { LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const PALACES:Record<string,Copy>={
  "命宫":c("命宫","Life Palace","命宮","명궁","Palais de vie","Lebenspalast","Palacio de vida","Palácio da vida","قصر الحياة"),
  "兄弟":c("兄弟","Siblings","兄弟宮","형제궁","Fratrie","Geschwister","Hermanos","Irmãos","الإخوة"),
  "兄弟宫":c("兄弟宫","Siblings","兄弟宮","형제궁","Fratrie","Geschwister","Hermanos","Irmãos","الإخوة"),
  "夫妻":c("夫妻","Partnership","夫妻宮","부부궁","Couple","Partnerschaft","Pareja","Relacionamento","الزواج"),
  "夫妻宫":c("夫妻宫","Partnership","夫妻宮","부부궁","Couple","Partnerschaft","Pareja","Relacionamento","الزواج"),
  "子女":c("子女","Children","子女宮","자녀궁","Enfants","Kinder","Hijos","Filhos","الأبناء"),
  "子女宫":c("子女宫","Children","子女宮","자녀궁","Enfants","Kinder","Hijos","Filhos","الأبناء"),
  "财帛":c("财帛","Wealth","財帛宮","재백궁","Richesse","Vermögen","Riqueza","Riqueza","الثروة"),
  "财帛宫":c("财帛宫","Wealth","財帛宮","재백궁","Richesse","Vermögen","Riqueza","Riqueza","الثروة"),
  "疾厄":c("疾厄","Health","疾厄宮","질액궁","Santé","Gesundheit","Salud","Saúde","الصحة"),
  "疾厄宫":c("疾厄宫","Health","疾厄宮","질액궁","Santé","Gesundheit","Salud","Saúde","الصحة"),
  "迁移":c("迁移","Movement","遷移宮","천이궁","Déplacements","Bewegung","Desplazamientos","Deslocamentos","التنقل"),
  "迁移宫":c("迁移宫","Movement","遷移宮","천이궁","Déplacements","Bewegung","Desplazamientos","Deslocamentos","التنقل"),
  "仆役":c("仆役","Network","奴僕宮","노복궁","Réseau","Netzwerk","Red social","Rede social","الشبكة الاجتماعية"),
  "仆役宫":c("仆役宫","Network","奴僕宮","노복궁","Réseau","Netzwerk","Red social","Rede social","الشبكة الاجتماعية"),
  "交友":c("交友","Network","交友宮","교우궁","Réseau","Netzwerk","Red social","Rede social","الشبكة الاجتماعية"),
  "交友宫":c("交友宫","Network","交友宮","교우궁","Réseau","Netzwerk","Red social","Rede social","الشبكة الاجتماعية"),
  "官禄":c("官禄","Career","官禄宮","관록궁","Carrière","Karriere","Carrera","Carreira","المهنة"),
  "官禄宫":c("官禄宫","Career","官禄宮","관록궁","Carrière","Karriere","Carrera","Carreira","المهنة"),
  "事业":c("事业","Career","官禄宮","관록궁","Carrière","Karriere","Carrera","Carreira","المهنة"),
  "事业宫":c("事业宫","Career","官禄宮","관록궁","Carrière","Karriere","Carrera","Carreira","المهنة"),
  "田宅":c("田宅","Home & Property","田宅宮","전택궁","Foyer & biens","Heim & Besitz","Hogar y bienes","Lar e bens","المنزل والممتلكات"),
  "田宅宫":c("田宅宫","Home & Property","田宅宮","전택궁","Foyer & biens","Heim & Besitz","Hogar y bienes","Lar e bens","المنزل والممتلكات"),
  "福德":c("福德","Inner Well-being","福徳宮","복덕궁","Bien-être intérieur","Inneres Wohlbefinden","Bienestar interior","Bem-estar interior","الرفاه الداخلي"),
  "福德宫":c("福德宫","Inner Well-being","福徳宮","복덕궁","Bien-être intérieur","Inneres Wohlbefinden","Bienestar interior","Bem-estar interior","الرفاه الداخلي"),
  "父母":c("父母","Parents","父母宮","부모궁","Parents","Eltern","Padres","Pais","الوالدان"),
  "父母宫":c("父母宫","Parents","父母宮","부모궁","Parents","Eltern","Padres","Pais","الوالدان"),
};

const STARS:Record<string,Copy>={
  "紫微":c("紫微","Ziwei","紫微","자미","Ziwei","Ziwei","Ziwei","Ziwei","زيوي"),
  "天机":c("天机","Tianji","天機","천기","Tianji","Tianji","Tianji","Tianji","تيانجي"),
  "太阳":c("太阳","Taiyang","太陽","태양","Taiyang","Taiyang","Taiyang","Taiyang","تاي يانغ"),
  "武曲":c("武曲","Wuqu","武曲","무곡","Wuqu","Wuqu","Wuqu","Wuqu","ووتشو"),
  "天同":c("天同","Tiantong","天同","천동","Tiantong","Tiantong","Tiantong","Tiantong","تيانتونغ"),
  "廉贞":c("廉贞","Lianzhen","廉貞","염정","Lianzhen","Lianzhen","Lianzhen","Lianzhen","ليانتشن"),
  "天府":c("天府","Tianfu","天府","천부","Tianfu","Tianfu","Tianfu","Tianfu","تيانفو"),
  "太阴":c("太阴","Taiyin","太陰","태음","Taiyin","Taiyin","Taiyin","Taiyin","تاي ين"),
  "贪狼":c("贪狼","Tanlang","貪狼","탐랑","Tanlang","Tanlang","Tanlang","Tanlang","تانلانغ"),
  "巨门":c("巨门","Jumen","巨門","거문","Jumen","Jumen","Jumen","Jumen","جومِن"),
  "天相":c("天相","Tianxiang","天相","천상","Tianxiang","Tianxiang","Tianxiang","Tianxiang","تيانشيانغ"),
  "天梁":c("天梁","Tianliang","天梁","천량","Tianliang","Tianliang","Tianliang","Tianliang","تيانليانغ"),
  "七杀":c("七杀","Qisha","七殺","칠살","Qisha","Qisha","Qisha","Qisha","تشيشا"),
  "破军":c("破军","Pojun","破軍","파군","Pojun","Pojun","Pojun","Pojun","بوجون"),
  "文昌":c("文昌","Wenchang","文昌","문창","Wenchang","Wenchang","Wenchang","Wenchang","ونتشانغ"),
  "文曲":c("文曲","Wenqu","文曲","문곡","Wenqu","Wenqu","Wenqu","Wenqu","ونتشو"),
  "左辅":c("左辅","Zuofu","左輔","좌보","Zuofu","Zuofu","Zuofu","Zuofu","تسوفو"),
  "右弼":c("右弼","Youbi","右弼","우필","Youbi","Youbi","Youbi","Youbi","يوبي"),
  "天魁":c("天魁","Tiankui","天魁","천괴","Tiankui","Tiankui","Tiankui","Tiankui","تيانكوي"),
  "天钺":c("天钺","Tianyue","天鉞","천월","Tianyue","Tianyue","Tianyue","Tianyue","تيانيويه"),
  "禄存":c("禄存","Lucun","禄存","녹존","Lucun","Lucun","Lucun","Lucun","لوكون"),
  "擎羊":c("擎羊","Qingyang","擎羊","경양","Qingyang","Qingyang","Qingyang","Qingyang","تشينغيانغ"),
  "陀罗":c("陀罗","Tuoluo","陀羅","타라","Tuoluo","Tuoluo","Tuoluo","Tuoluo","تولوه"),
  "火星":c("火星","Huoxing","火星","화성","Huoxing","Huoxing","Huoxing","Huoxing","هووشينغ"),
  "铃星":c("铃星","Lingxing","鈴星","령성","Lingxing","Lingxing","Lingxing","Lingxing","لينغشينغ"),
  "地空":c("地空","Dikong","地空","지공","Dikong","Dikong","Dikong","Dikong","ديكونغ"),
  "地劫":c("地劫","Dijie","地劫","지겁","Dijie","Dijie","Dijie","Dijie","ديجيه"),
};

const BRANCHES:Record<string,Copy>={
  "子":c("子","Zi","子","자","Zi","Zi","Zi","Zi","تسي"),
  "丑":c("丑","Chou","丑","축","Chou","Chou","Chou","Chou","تشو"),
  "寅":c("寅","Yin","寅","인","Yin","Yin","Yin","Yin","يين"),
  "卯":c("卯","Mao","卯","묘","Mao","Mao","Mao","Mao","ماو"),
  "辰":c("辰","Chen","辰","진","Chen","Chen","Chen","Chen","تشن"),
  "巳":c("巳","Si","巳","사","Si","Si","Si","Si","سي"),
  "午":c("午","Wu","午","오","Wu","Wu","Wu","Wu","وو"),
  "未":c("未","Wei","未","미","Wei","Wei","Wei","Wei","وي"),
  "申":c("申","Shen","申","신","Shen","Shen","Shen","Shen","شن"),
  "酉":c("酉","You","酉","유","You","You","You","You","يو"),
  "戌":c("戌","Xu","戌","술","Xu","Xu","Xu","Xu","شو"),
  "亥":c("亥","Hai","亥","해","Hai","Hai","Hai","Hai","هاي"),
};

const BRIGHTNESS:Record<string,Copy>={
  "庙":c("庙","Exalted","廟","묘","Exalté","Erhöht","Exaltado","Exaltado","في أوج القوة"),
  "旺":c("旺","Strong","旺","왕","Fort","Stark","Fuerte","Forte","قوي"),
  "得":c("得","Supported","得","득","Soutenu","Unterstützt","Favorecido","Favorecido","مدعوم"),
  "利":c("利","Favorable","利","리","Favorable","Günstig","Favorable","Favorável","ملائم"),
  "平":c("平","Neutral","平","평","Neutre","Neutral","Neutral","Neutro","محايد"),
  "不":c("不","Weak","不","부","Faible","Schwach","Débil","Fraco","ضعيف"),
  "陷":c("陷","Fallen","陥","함","Affaibli","Geschwächt","Debilitado","Debilitado","منخفض"),
};

function pick(dict:Record<string,Copy>,key:string,lang:LingxiLang){
  const hit=dict[key];
  if(hit)return hit[lang]??hit.en;
  return lang==="zh"?key:key;
}

export function ziweiPalaceName(lang:LingxiLang,name:string){return pick(PALACES,name,lang)}
export function ziweiStarName(lang:LingxiLang,name:string){return pick(STARS,name,lang)}
export function ziweiBranchName(lang:LingxiLang,name:string){return pick(BRANCHES,name,lang)}
export function ziweiBrightness(lang:LingxiLang,name:string){return pick(BRIGHTNESS,name,lang)}
