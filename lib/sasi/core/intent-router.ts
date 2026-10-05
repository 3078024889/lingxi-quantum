import type {SasiMode} from "./session-contract";

type Rule={mode:SasiMode;phrases:string[]};

const RULES:Rule[]=[
 {mode:"website",phrases:[
  "网站","网页","官网","落地页","建站","website","web site","landing page","homepage","webpage",
  "ウェブサイト","ホームページ","랜딩 페이지","웹사이트","site web","page d’accueil","webseite","landingpage",
  "sitio web","página web","site","página inicial","موقع ويب","صفحة هبوط","موقع إلكتروني"
 ]},
 {mode:"drama",phrases:[
  "短剧","视频","分镜","镜头","广告片","漫剧","短视频","video","drama","storyboard","scene","film",
  "ショート動画","動画","ストーリーボード","숏드라마","동영상","스토리보드","courte vidéo","vidéo","story-board",
  "kurzvideo","video erstellen","vídeo corto","guion gráfico","vídeo curto","storyboard","فيديو قصير","مشاهد","سيناريو مصور"
 ]},
 {mode:"research",phrases:[
  "研究","调研","论文","证据","文献","深度研究","research","paper","evidence","literature","citation",
  "研究する","論文","証拠","文献","연구","논문","근거","문헌","recherche","article scientifique","preuve","littérature",
  "forschung","studie","belege","literatur","investigación","artículo científico","evidencia","literatura",
  "pesquisa","artigo científico","evidência","literatura","بحث","بحث عميق","ورقة بحثية","أدلة","مراجع"
 ]},
 {mode:"learning",phrases:[
  "学习","复习","教我","讲解","练习题","测验","课程","study","learn","teach me","quiz","lesson",
  "勉強","学習","教えて","復習","공부","학습","가르쳐","복습","étudier","apprendre","enseigne-moi","cours",
  "lernen","erkläre mir","unterricht","estudiar","aprender","enséñame","lección","estudar","aprender","ensine-me","aula",
  "تعلم","علمني","اشرح لي","درس","مراجعة"
 ]},
 {mode:"book",phrases:[
  "书","章节","作者","小说","读书","书本","book","chapter","author","novel","read this",
  "本","章","著者","小説","책","장","저자","소설","livre","chapitre","auteur","roman",
  "buch","kapitel","autor","roman","libro","capítulo","autor","novela","livro","capítulo","autor","romance",
  "كتاب","فصل","مؤلف","رواية","اقرأ"
 ]}
];

function phraseScore(value:string,phrase:string){
 const p=phrase.toLowerCase();
 if(!value.includes(p))return 0;
 return Math.max(1,Math.min(5,p.length));
}

export function inferSasiMode(text:string):SasiMode|null{
 const value=text.trim().toLowerCase();
 if(!value)return null;
 const scores=new Map<SasiMode,number>();
 for(const rule of RULES){
  let score=0;
  for(const phrase of rule.phrases)score+=phraseScore(value,phrase);
  scores.set(rule.mode,score);
 }
 const ranked=[...scores.entries()].filter(([,score])=>score>0).sort((a,b)=>b[1]-a[1]);
 if(!ranked.length)return null;
 if(ranked.length>1&&ranked[0]![1]===ranked[1]![1])return null;
 return ranked[0]![0];
}
