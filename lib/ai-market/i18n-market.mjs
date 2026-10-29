export const MARKET_LOCALES=Object.freeze(['en','ja','ko','fr','de','es','pt','ar','zh']);
export const MARKET_DEFAULT_LOCALE='zh';
export const MARKET_LABELS=Object.freeze({
en:{search:'Search AI tools',placeholder:'Describe what you want to do',free:'Free allowance',price:'Price',limits:'Limits',use:'Open official site',unknown:'Not verified',sponsored:'Sponsored',source:'Source',region:'Regional availability',results:'Matching tools',empty:'No verified tools found'},
ja:{search:'AIツールを検索',placeholder:'やりたいことを入力',free:'無料枠',price:'料金',limits:'制限',use:'公式サイトを開く',unknown:'未確認',sponsored:'広告',source:'出典',region:'地域別の利用可否',results:'一致するツール',empty:'確認済みツールはありません'},
ko:{search:'AI 도구 검색',placeholder:'하고 싶은 일을 설명하세요',free:'무료 제공량',price:'가격',limits:'제한',use:'공식 사이트 열기',unknown:'확인되지 않음',sponsored:'광고',source:'출처',region:'지역별 이용 가능 여부',results:'추천 도구',empty:'확인된 도구가 없습니다'},
fr:{search:'Rechercher des outils IA',placeholder:'Décrivez votre besoin',free:'Quota gratuit',price:'Prix',limits:'Limites',use:'Ouvrir le site officiel',unknown:'Non vérifié',sponsored:'Sponsorisé',source:'Source',region:'Disponibilité régionale',results:'Outils correspondants',empty:'Aucun outil vérifié'},
de:{search:'KI-Tools suchen',placeholder:'Beschreiben Sie Ihr Vorhaben',free:'Gratis-Kontingent',price:'Preis',limits:'Grenzen',use:'Offizielle Website öffnen',unknown:'Nicht verifiziert',sponsored:'Gesponsert',source:'Quelle',region:'Regionale Verfügbarkeit',results:'Passende Tools',empty:'Keine verifizierten Tools'},
es:{search:'Buscar herramientas de IA',placeholder:'Describe lo que necesitas',free:'Cuota gratuita',price:'Precio',limits:'Límites',use:'Abrir sitio oficial',unknown:'Sin verificar',sponsored:'Patrocinado',source:'Fuente',region:'Disponibilidad regional',results:'Herramientas encontradas',empty:'No hay herramientas verificadas'},
pt:{search:'Buscar ferramentas de IA',placeholder:'Descreva o que precisa',free:'Cota gratuita',price:'Preço',limits:'Limites',use:'Abrir site oficial',unknown:'Não verificado',sponsored:'Patrocinado',source:'Fonte',region:'Disponibilidade regional',results:'Ferramentas encontradas',empty:'Nenhuma ferramenta verificada'},
ar:{search:'ابحث عن أدوات الذكاء الاصطناعي',placeholder:'صِف ما تريد إنجازه',free:'الرصيد المجاني',price:'السعر',limits:'القيود',use:'افتح الموقع الرسمي',unknown:'غير مُتحقق منه',sponsored:'إعلان ممول',source:'المصدر',region:'التوفر حسب المنطقة',results:'الأدوات المطابقة',empty:'لا توجد أدوات تم التحقق منها'},
zh:{search:'搜索 AI 工具',placeholder:'输入你想解决的问题',free:'免费额度',price:'价格',limits:'使用限制',use:'前往官方网站',unknown:'待核实',sponsored:'赞助推广',source:'来源',region:'地区可用性',results:'匹配工具',empty:'暂无已核验的工具'}
});
export function marketLocale(input){return MARKET_LOCALES.includes(input)?input:MARKET_DEFAULT_LOCALE;}
export function marketDirection(locale){return marketLocale(locale)==='ar'?'rtl':'ltr';}
export function marketMessage(locale,key){const lang=marketLocale(locale);return MARKET_LABELS[lang][key]??MARKET_LABELS.en[key]??null;}
export function marketPath(locale,pathname='/ai-market'){
 const lang=marketLocale(locale);
 if(typeof pathname!=='string'||!/^\/[a-z0-9/-]*$/.test(pathname)||pathname.startsWith('//'))throw Error('INVALID_PATH');
 return (lang==='zh'?'':'/'+lang)+pathname;
}
export function marketAlternates(pathname='/ai-market'){
 return Object.fromEntries(MARKET_LOCALES.map(x=>[x==='zh'?'zh-CN':x,'https://lingxifield.com'+marketPath(x,pathname)]));
}
export function safeMarketSnippet(input,locale,max=140){
 const text=typeof input==='string'?input.replace(/<[^>]*>/g,'').trim():'';
 if(!text)return marketMessage(locale,'unknown');
 return [...text].slice(0,max).join('');
}
