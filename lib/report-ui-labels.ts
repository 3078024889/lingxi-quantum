import type { LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang, string>;

const c = (
  zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string
):Copy => ({zh,en,ja,ko,fr,de,es,pt,ar});

const LABELS = {
  dataPortrait:c("数据肖像","DATA PORTRAIT","データポートレート","데이터 포트레이트","PORTRAIT DES DONNÉES","DATENPORTRÄT","RETRATO DE DATOS","RETRATO DE DADOS","صورة البيانات"),
  elementBalance:c("命局五行分布","Element Balance","五行バランス","오행 균형","Équilibre des éléments","Elemente-Balance","Equilibrio de elementos","Equilíbrio dos elementos","توازن العناصر"),
  wood:c("木","Wood","木","목","Bois","Holz","Madera","Madeira","الخشب"),
  fire:c("火","Fire","火","화","Feu","Feuer","Fuego","Fogo","النار"),
  earth:c("土","Earth","土","토","Terre","Erde","Tierra","Terra","الأرض"),
  metal:c("金","Metal","金","금","Métal","Metall","Metal","Metal","المعدن"),
  water:c("水","Water","水","수","Eau","Wasser","Agua","Água","الماء"),
  energy:c("能量水平","Energy","エネルギー","에너지","Énergie","Energie","Energía","Energia","الطاقة"),
  clarity:c("头脑清晰度","Clarity","明晰さ","명료도","Clarté","Klarheit","Claridad","Clareza","الوضوح"),
  alignment:c("内外对齐感","Alignment","整合感","정렬감","Alignement","Ausrichtung","Alineación","Alinhamento","الانسجام"),
  ziweiPalaces:c("紫微十二宫","The Twelve Ziwei Palaces","紫微十二宮","자미두수 십이궁","Les douze palais Ziwei","Die zwölf Ziwei-Paläste","Los doce palacios Ziwei","Os doze palácios Ziwei","قصور زيوي الاثنا عشر"),
  ziwei:c("紫微","Ziwei","紫微","자미","Ziwei","Ziwei","Ziwei","Ziwei","زيوي"),
  palace:c("宫","Palace","宮","궁","Palais","Palast","Palacio","Palácio","قصر"),
  life:c("命","Life","命","명","Vie","Leben","Vida","Vida","الحياة"),
  body:c("身","Body","身","신","Corps","Körper","Cuerpo","Corpo","الجسد"),
  ziweiPalace:c("紫微宫位","Ziwei Palace","紫微宮位","자미 궁위","Palais Ziwei","Ziwei-Palast","Palacio Ziwei","Palácio Ziwei","قصر زيوي"),
  astroMarkers:c("星曜标记","Astrological markers","星曜マーカー","성요 표식","Repères astrologiques","Astrologische Marker","Marcadores astrológicos","Marcadores astrológicos","علامات فلكية"),
  luckTimeline:c("大运时间轴","Major Luck Cycle Timeline","大運タイムライン","대운 타임라인","Chronologie des grands cycles","Zeitachse der großen Zyklen","Cronología de grandes ciclos","Linha do tempo dos grandes ciclos","الخط الزمني للدورات الكبرى"),
  years:c("岁","","歳","세"," ans"," Jahre"," años"," anos"," سنة"),
  gate:c("门","Gate","ゲート","게이트","Porte","Tor","Puerta","Portal","بوابة"),
  phone:c("手机号","Phone number","携帯番号","휴대전화 번호","Numéro de téléphone","Telefonnummer","Número de teléfono","Número de telefone","رقم الهاتف"),
  plate:c("车牌号","License plate","ナンバープレート","차량 번호","Plaque d’immatriculation","Kennzeichen","Matrícula","Placa do veículo","لوحة المركبة"),

  vectorComparison:c("生命向量对比","Life Vector Comparison","生命ベクトル比較","생명 벡터 비교","Comparaison des vecteurs de vie","Vergleich der Lebensvektoren","Comparación de vectores de vida","Comparação dos vetores de vida","مقارنة متجهات الحياة"),
  vectorCaption:c(
    "两个形状重叠的地方，是两人共享的驱动力；差得远的地方，往往就是下方文字里写到的互补或摩擦点。",
    "Where the two shapes overlap is shared drive; where they differ most is usually the complementary or friction point discussed below.",
    "2つの形が重なる部分は共有する推進力で、大きく離れる部分は下の解説にある補完点や摩擦点になりやすい場所です。",
    "두 도형이 겹치는 부분은 두 사람이 공유하는 동력이며, 차이가 큰 부분은 아래 설명의 상호보완 또는 마찰 지점이 되기 쉽습니다.",
    "Les zones de chevauchement montrent les moteurs partagés ; les écarts les plus marqués correspondent souvent aux complémentarités ou aux frictions décrites ci-dessous.",
    "Überlappungen zeigen gemeinsame Antriebe; große Abstände entsprechen häufig den unten beschriebenen Ergänzungs- oder Reibungspunkten.",
    "Las zonas donde se superponen muestran impulsos compartidos; las mayores diferencias suelen corresponder a los puntos de complementariedad o fricción descritos abajo.",
    "As áreas de sobreposição mostram impulsos compartilhados; as maiores diferenças costumam corresponder aos pontos de complementaridade ou atrito descritos abaixo.",
    "مناطق التداخل تمثل الدوافع المشتركة، أما أكبر الفروق فغالبًا ما تقابل نقاط التكامل أو الاحتكاك الموضحة أدناه."
  ),
  resonance:c("共鸣点 · 共享的驱动力","Resonance · Shared Drives","共鳴点 · 共有する推進力","공명 지점 · 공유 동력","Résonance · Moteurs partagés","Resonanz · Gemeinsame Antriebe","Resonancia · Impulsos compartidos","Ressonância · Impulsos compartilhados","الرنين · الدوافع المشتركة"),
  complementary:c("互补点 · 天然分工","Complementary · Natural Division","補完点 · 自然な役割分担","상호보완 · 자연스러운 역할 분담","Complémentarité · Répartition naturelle","Ergänzung · Natürliche Rollenverteilung","Complementariedad · División natural","Complementaridade · Divisão natural","التكامل · تقسيم طبيعي للأدوار"),
  friction:c("摩擦点 · 需要留意","Friction · Worth Watching","摩擦点 · 注意が必要","마찰 지점 · 주의 필요","Friction · À surveiller","Reibung · Im Blick behalten","Fricción · Conviene observar","Atrito · Vale observar","الاحتكاك · يستحق الانتباه"),
  radarFigure:c(
    "两份生命向量叠放在同一张图上——重合处是共鸣，错开处是互补。",
    "Two life vectors laid over one another — where they overlap is resonance; where they diverge is complement.",
    "2つの生命ベクトルを重ねています。重なる部分が共鳴、ずれる部分が補完です。",
    "두 생명 벡터를 겹쳐 놓았습니다. 겹치는 곳은 공명, 벌어지는 곳은 상호보완입니다.",
    "Deux vecteurs de vie superposés : le chevauchement indique la résonance, l’écart la complémentarité.",
    "Zwei Lebensvektoren übereinander: Überlappung bedeutet Resonanz, Abweichung Ergänzung.",
    "Dos vectores de vida superpuestos: donde coinciden hay resonancia; donde divergen, complementariedad.",
    "Dois vetores de vida sobrepostos: onde coincidem há ressonância; onde divergem, complementaridade.",
    "متجها حياة فوق بعضهما: التداخل يعني الرنين، والاختلاف يعني التكامل."
  ),
  scoreFigure:c(
    "共鸣点 · 互补点 · 摩擦点，按强度排列。",
    "Resonance, complement, and friction — ordered by intensity.",
    "共鳴・補完・摩擦を強度順に表示します。",
    "공명·상호보완·마찰을 강도 순으로 표시합니다.",
    "Résonance, complémentarité et friction, classées par intensité.",
    "Resonanz, Ergänzung und Reibung — nach Stärke sortiert.",
    "Resonancia, complementariedad y fricción, ordenadas por intensidad.",
    "Ressonância, complementaridade e atrito, ordenados por intensidade.",
    "الرنين والتكامل والاحتكاك مرتبة حسب الشدة."
  ),
} as const;

export type ReportUiLabelKey = keyof typeof LABELS;

export function reportUiLabel(lang:LingxiLang,key:ReportUiLabelKey){
  return LABELS[key][lang] ?? LABELS[key].en;
}

const LIFE_VECTOR:Record<string,Copy>={
  "need for freedom":c("自由需求","need for freedom","自由への欲求","자유 욕구","besoin de liberté","Freiheitsbedürfnis","necesidad de libertad","necessidade de liberdade","الحاجة إلى الحرية"),
  "need for stability":c("稳定需求","need for stability","安定への欲求","안정 욕구","besoin de stabilité","Stabilitätsbedürfnis","necesidad de estabilidad","necessidade de estabilidade","الحاجة إلى الاستقرار"),
  "creative drive":c("创造倾向","creative drive","創造衝動","창조 성향","élan créatif","kreativer Antrieb","impulso creativo","impulso criativo","الدافع الإبداعي"),
  discipline:c("秩序纪律","discipline","規律","규율","discipline","Disziplin","disciplina","disciplina","الانضباط"),
  "risk tolerance":c("风险偏好","risk tolerance","リスク許容度","위험 감수 성향","tolérance au risque","Risikobereitschaft","tolerancia al riesgo","tolerância ao risco","تحمل المخاطر"),
  "emotional depth":c("情感深度","emotional depth","感情の深さ","감정 깊이","profondeur émotionnelle","emotionale Tiefe","profundidad emocional","profundidade emocional","العمق العاطفي"),
  introspection:c("内省倾向","introspection","内省","성찰 성향","introspection","Selbstreflexion","introspección","introspecção","التأمل الداخلي"),
  "social drive":c("社交驱动","social drive","社会的動機","사회적 동력","élan social","sozialer Antrieb","impulso social","impulso social","الدافع الاجتماعي"),
  ambition:c("野心驱动","ambition","達成意欲","성취 욕구","ambition","Ambition","ambición","ambição","الطموح"),
  adaptability:c("适应弹性","adaptability","適応力","적응 탄력성","adaptabilité","Anpassungsfähigkeit","adaptabilidad","adaptabilidade","القدرة على التكيف"),
};

const PAIRS:Record<string,Copy>={
  "Freedom vs Stability":c("自由 vs 稳定","Freedom vs Stability","自由 vs 安定","자유 vs 안정","Liberté vs stabilité","Freiheit vs Stabilität","Libertad vs estabilidad","Liberdade vs estabilidade","الحرية مقابل الاستقرار"),
  "Risk vs Order":c("冒险 vs 秩序","Risk vs Order","リスク vs 秩序","위험 vs 질서","Risque vs ordre","Risiko vs Ordnung","Riesgo vs orden","Risco vs ordem","المخاطرة مقابل النظام"),
  "Outer Ambition vs Inner Reflection":c("外在成就 vs 内在审视","Outer Ambition vs Inner Reflection","外的達成 vs 内的省察","외적 성취 vs 내적 성찰","Ambition extérieure vs réflexion intérieure","Äußerer Ehrgeiz vs innere Reflexion","Ambición externa vs reflexión interna","Ambição externa vs reflexão interna","الطموح الخارجي مقابل التأمل الداخلي"),
  "Outward Connection vs Inward Emotion":c("向外连接 vs 向内情感","Outward Connection vs Inward Emotion","外へのつながり vs 内なる感情","외부 연결 vs 내면 감정","Connexion extérieure vs émotion intérieure","Äußere Verbindung vs inneres Gefühl","Conexión externa vs emoción interna","Conexão externa vs emoção interna","الاتصال الخارجي مقابل الشعور الداخلي"),
  "Creative Impulse vs Established Order":c("原创冲动 vs 既定秩序","Creative Impulse vs Established Order","創造衝動 vs 既存秩序","창조 충동 vs 기존 질서","Élan créatif vs ordre établi","Kreativer Impuls vs bestehende Ordnung","Impulso creativo vs orden establecido","Impulso criativo vs ordem estabelecida","الدافع الإبداعي مقابل النظام القائم"),
  "Adapting Freely vs Needing Certainty":c("随时调整 vs 需要确定","Adapting Freely vs Needing Certainty","柔軟な適応 vs 確実性の必要","유연한 적응 vs 확실성 필요","Adaptation libre vs besoin de certitude","Freies Anpassen vs Bedürfnis nach Gewissheit","Adaptación libre vs necesidad de certeza","Adaptação livre vs necessidade de certeza","التكيف بحرية مقابل الحاجة إلى اليقين"),
};

export function lifeVectorLabel(lang:LingxiLang,en:string,zh:string){
  return LIFE_VECTOR[en]?.[lang] ?? (lang==="zh"?zh:en);
}

export function relationshipPairLabel(lang:LingxiLang,en:string,zh:string){
  return PAIRS[en]?.[lang] ?? (lang==="zh"?zh:en);
}

const HD:Record<string,Copy>={
  Sun:c("太阳","Sun","太陽","태양","Soleil","Sonne","Sol","Sol","الشمس"),
  Earth:c("地球","Earth","地球","지구","Terre","Erde","Tierra","Terra","الأرض"),
  Moon:c("月亮","Moon","月","달","Lune","Mond","Luna","Lua","القمر"),
  Mercury:c("水星","Mercury","水星","수성","Mercure","Merkur","Mercurio","Mercúrio","عطارد"),
  Venus:c("金星","Venus","金星","금성","Vénus","Venus","Venus","Vênus","الزهرة"),
  Mars:c("火星","Mars","火星","화성","Mars","Mars","Marte","Marte","المريخ"),
  Jupiter:c("木星","Jupiter","木星","목성","Jupiter","Jupiter","Júpiter","Júpiter","المشتري"),
  Saturn:c("土星","Saturn","土星","토성","Saturne","Saturn","Saturno","Saturno","زحل"),
  Uranus:c("天王星","Uranus","天王星","천왕성","Uranus","Uranus","Urano","Urano","أورانوس"),
  Neptune:c("海王星","Neptune","海王星","해왕성","Neptune","Neptun","Neptuno","Netuno","نبتون"),
  Pluto:c("冥王星","Pluto","冥王星","명왕성","Pluton","Pluto","Plutón","Plutão","بلوتو"),
};

export function humanDesignLabel(lang:LingxiLang,en:string,zh:string){
  return HD[en]?.[lang] ?? (lang==="zh"?zh:en);
}

export function numberEnergyLabel(lang:LingxiLang,value:string){
  if(value==="手机号")return reportUiLabel(lang,"phone");
  if(value==="车牌号")return reportUiLabel(lang,"plate");
  return value;
}
