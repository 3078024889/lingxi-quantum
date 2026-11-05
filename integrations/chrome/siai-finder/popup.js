"use strict";
// No history, tabs, cookies, accounts, storage or active-page access.
const langs={
 en:["Reviewed SI/AI platform information","Search platforms and capabilities","All categories","Any free tier","Free tier listed","Source reviewed","No matching platforms","Data unavailable — open the rankings","Explore full rankings","Free tools","Price","Free","Region","Visit official site","Updated"],
 zh:["核验后更新的 SI/AI 厂商资料","搜索厂商和能力","全部分类","不限免费额度","有免费资料","资料已核验","没有匹配结果","资料暂不可用，可打开排行榜","查看完整排行榜","免费工具","价格","免费额度","地区","访问官网","更新"],
 ja:["確認済み SI/AI 情報","企業や機能を検索","すべての分類","無料枠は問わない","無料情報あり","確認済み","該当なし","接続できません。ランキングへ","ランキング全体","無料ツール","料金","無料枠","地域","公式サイト","更新"],
 ko:["검증된 SI/AI 플랫폼","플랫폼 및 기능 검색","모든 분류","무료 상관없음","무료 정보 있음","검증됨","검색 결과 없음","데이터를 불러올 수 없음","전체 순위","무료 도구","가격","무료 한도","지역","공식 웹사이트","업데이트"],
 fr:["Plateformes SI/IA vérifiées","Chercher un service","Toutes les catégories","Tous les services","Offre gratuite documentée","Vérifié","Aucun résultat","Données indisponibles","Classement complet","Outils gratuits","Prix","Gratuit","Région","Site officiel","Mise à jour"],
 de:["Geprüfte SI/KI-Plattformen","Anbieter suchen","Alle Kategorien","Alle Angebote","Gratis-Angaben","Geprüft","Keine Treffer","Daten nicht verfügbar","Gesamtranking","Gratis-Tools","Preis","Gratis","Region","Offizielle Website","Aktualisiert"],
 es:["Plataformas SI/IA verificadas","Buscar plataformas","Todas las categorías","Sin filtro gratuito","Gratis documentado","Verificado","Sin resultados","Datos no disponibles","Ranking completo","Herramientas gratis","Precio","Gratis","Región","Sitio oficial","Actualizado"],
 pt:["Plataformas SI/IA verificadas","Buscar plataformas","Todas as categorias","Sem filtro gratuito","Grátis documentado","Verificado","Sem resultados","Dados indisponíveis","Ranking completo","Ferramentas grátis","Preço","Grátis","Região","Site oficial","Atualizado"],
 ar:["منصات SI/AI الموثوقة","البحث عن المنصات","كل الفئات","بدون فلتر مجاني","معلومات مجانية موثقة","تم التحقق","لا نتائج","البيانات غير متاحة","الترتيب الكامل","أدوات مجانية","السعر","المجاني","المنطقة","الموقع الرسمي","تحديث"]
};
const locale=(navigator.language||"en").slice(0,2).toLowerCase();
const t=langs[locale]||langs.en;
document.documentElement.lang=locale in langs?locale:"en";
if(locale==="ar")document.documentElement.dir="rtl";
const byId=id=>document.getElementById(id);
const list=byId("list"),query=byId("query"),category=byId("category"),free=byId("free"),status=byId("status");
byId("lead").textContent=t[0];byId("searchLabel").textContent=t[1];query.placeholder=t[1];
byId("full").textContent=t[8];byId("tools").textContent=t[9];
category.setAttribute("aria-label",t[2]);free.setAttribute("aria-label",t[3]);
const rows=[];
function option(select,value,text){const el=document.createElement("option");el.value=value;el.textContent=text;select.appendChild(el);}
option(category,"",t[2]);option(free,"",t[3]);option(free,"yes",t[4]);
function block(className,text){const x=document.createElement("div");x.className=className;x.textContent=text;return x;}
function link(text,url){const a=document.createElement("a");a.textContent=text;a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function render(){
 list.replaceChildren();
 const needle=query.value.trim().toLowerCase();
 const found=rows.filter(r=>(!category.value||r.category===category.value)&&(!free.value||Boolean(r.free))&&(r.name+" "+r.category).toLowerCase().includes(needle)).slice(0,40);
 for(const r of found){
  const article=document.createElement("article");article.className="item";
  const title=document.createElement("strong");title.textContent=r.name;article.appendChild(title);
  const meta=[r.category,r.price?t[10]+": "+r.price:"",r.free?t[11]+": "+r.free:"",r.region?t[12]+": "+r.region:"",r.reviewedAt?t[14]+": "+String(r.reviewedAt).slice(0,10):""].filter(Boolean);
  article.appendChild(block("meta",meta.join(" · ")));
  if(r.website){try{const u=new URL(r.website);if(u.protocol==="https:")article.appendChild(link(t[13],u.href));}catch{}}
  list.appendChild(article);
 }
 status.textContent=rows.length?found.length?found.length+" / "+rows.length:t[6]:t[7];
}
query.addEventListener("input",render);category.addEventListener("change",render);free.addEventListener("change",render);
fetch("https://lingxifield.com/api/public/siai-widget",{credentials:"omit"})
 .then(r=>r.ok?r.json():Promise.reject(Error("feed")))
 .then(data=>{
  if(!data||!Array.isArray(data.rows))throw Error("invalid");
  const cats=new Set();
  for(const r of data.rows){
   if(!r||typeof r.id!=="string"||typeof r.name!=="string"||typeof r.category!=="string")continue;
   const item={id:r.id,name:r.name,category:r.category,price:typeof r.price==="string"?r.price:null,free:typeof r.free==="string"?r.free:null,region:typeof r.region==="string"?r.region:null,website:typeof r.website==="string"?r.website:null,reviewedAt:r.reviewedAt};
   rows.push(item);cats.add(item.category);
  }
  for(const cat of [...cats].sort())option(category,cat,cat);
  render();
 })
 .catch(()=>{status.textContent=t[7]});
