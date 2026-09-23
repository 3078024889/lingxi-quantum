import type { LingxiLang } from "@/lib/lingxi-i18n";

const EXACT:Record<string,Record<LingxiLang,string>>={
  "此工具已在产品路线图中，但尚未实现真实处理逻辑。我们不会用假按钮或演示数据冒充上线。请先使用已标记为可用的工具。":{zh:"此工具已在产品路线图中，但尚未实现真实处理逻辑。我们不会用假按钮或演示数据冒充上线。请先使用已标记为可用的工具。",en:"This tool is on the roadmap but not implemented yet. We will not ship fake buttons or mock results. Please use tools marked as live.",ja:"このツールはロードマップにありますが、実処理はまだ未実装です。偽のボタンやデモ結果を公開済みとして表示しません。利用可能と表示されたツールをお使いください。",ko:"이 도구는 로드맵에 있지만 실제 처리 로직은 아직 구현되지 않았습니다. 가짜 버튼이나 데모 결과를 출시된 기능처럼 표시하지 않습니다. 사용 가능으로 표시된 도구를 이용하세요.",fr:"Cet outil figure sur la feuille de route mais sa logique réelle n’est pas encore implémentée. Aucun faux bouton ni résultat de démonstration ne sera présenté comme disponible. Utilisez les outils marqués comme actifs.",de:"Dieses Werkzeug steht auf der Roadmap, die echte Verarbeitungslogik ist aber noch nicht implementiert. Wir zeigen keine Schein-Buttons oder Demoergebnisse als live an. Nutzen Sie bitte als verfügbar markierte Werkzeuge.",es:"Esta herramienta está en la hoja de ruta, pero su lógica real aún no está implementada. No mostraremos botones falsos ni resultados de demostración como si estuvieran activos. Usa las herramientas marcadas como disponibles.",pt:"Esta ferramenta está no roteiro, mas a lógica real ainda não foi implementada. Não exibiremos botões falsos nem resultados de demonstração como se estivessem ativos. Use as ferramentas marcadas como disponíveis.",ar:"هذه الأداة موجودة في خارطة الطريق لكن منطق المعالجة الحقيقي لم يُنفذ بعد. لن نعرض أزرارًا وهمية أو نتائج تجريبية كأنها متاحة. استخدم الأدوات المعلّمة بأنها متاحة."},
  "下载 PNG":{zh:"下载 PNG",en:"Download PNG",ja:"PNGをダウンロード",ko:"PNG 다운로드",fr:"Télécharger PNG",de:"PNG herunterladen",es:"Descargar PNG",pt:"Baixar PNG",ar:"تنزيل PNG"},
  "生成二维码":{zh:"生成二维码",en:"Generate QR",ja:"QRコードを生成",ko:"QR 생성",fr:"Générer le QR",de:"QR-Code erzeugen",es:"Generar QR",pt:"Gerar QR",ar:"إنشاء QR"},
  "生成中…":{zh:"生成中…",en:"Generating…",ja:"生成中…",ko:"생성 중…",fr:"Génération…",de:"Wird erstellt…",es:"Generando…",pt:"Gerando…",ar:"جارٍ الإنشاء…"},
  "填入当前时间":{zh:"填入当前时间",en:"Use now",ja:"現在時刻を入力",ko:"현재 시간 사용",fr:"Utiliser maintenant",de:"Aktuelle Zeit verwenden",es:"Usar ahora",pt:"Usar agora",ar:"استخدام الوقت الحالي"},
  "毫秒":{zh:"毫秒",en:"Milliseconds",ja:"ミリ秒",ko:"밀리초",fr:"Millisecondes",de:"Millisekunden",es:"Milisegundos",pt:"Milissegundos",ar:"مللي ثانية"},
  "秒":{zh:"秒",en:"Seconds",ja:"秒",ko:"초",fr:"Secondes",de:"Sekunden",es:"Segundos",pt:"Segundos",ar:"ثوانٍ"},
  "压缩":{zh:"压缩",en:"Minify",ja:"圧縮",ko:"축소",fr:"Minifier",de:"Minifizieren",es:"Minificar",pt:"Minificar",ar:"تصغير"},
  "格式化":{zh:"格式化",en:"Pretty print",ja:"整形",ko:"서식화",fr:"Mettre en forme",de:"Formatieren",es:"Formatear",pt:"Formatar",ar:"تنسيق"},
  "立即处理":{zh:"立即处理",en:"Process now",ja:"今すぐ処理",ko:"지금 처리",fr:"Traiter maintenant",de:"Jetzt verarbeiten",es:"Procesar ahora",pt:"Processar agora",ar:"المعالجة الآن"},
  "处理中…":{zh:"处理中…",en:"Working…",ja:"処理中…",ko:"처리 중…",fr:"Traitement…",de:"Verarbeitung…",es:"Procesando…",pt:"Processando…",ar:"جارٍ المعالجة…"},
  "保持比例":{zh:"保持比例",en:"Keep aspect ratio",ja:"縦横比を維持",ko:"비율 유지",fr:"Conserver les proportions",de:"Seitenverhältnis beibehalten",es:"Mantener proporción",pt:"Manter proporção",ar:"الحفاظ على نسبة الأبعاد"},
  "质量起点 (0.4–0.95)":{zh:"质量起点 (0.4–0.95)",en:"Quality seed (0.4–0.95)",ja:"品質の開始値 (0.4–0.95)",ko:"품질 시작값 (0.4–0.95)",fr:"Qualité initiale (0,4–0,95)",de:"Qualitätsstartwert (0,4–0,95)",es:"Calidad inicial (0,4–0,95)",pt:"Qualidade inicial (0,4–0,95)",ar:"قيمة الجودة الأولية (0.4–0.95)"},
  "目标大小 (KB)":{zh:"目标大小 (KB)",en:"Target size (KB)",ja:"目標サイズ (KB)",ko:"목표 크기 (KB)",fr:"Taille cible (Ko)",de:"Zielgröße (KB)",es:"Tamaño objetivo (KB)",pt:"Tamanho alvo (KB)",ar:"الحجم المستهدف (KB)"},
  "请换一张较小的图片，或换用 Chrome / Edge / Firefox 最新版本再试。":{zh:"请换一张较小的图片，或换用 Chrome / Edge / Firefox 最新版本再试。",en:"Try a smaller file, or the latest Chrome / Edge / Firefox.",ja:"より小さいファイルを使うか、最新版の Chrome / Edge / Firefox で再試行してください。",ko:"더 작은 파일을 사용하거나 최신 Chrome / Edge / Firefox에서 다시 시도하세요.",fr:"Essayez un fichier plus petit ou la dernière version de Chrome / Edge / Firefox.",de:"Versuchen Sie eine kleinere Datei oder die neueste Version von Chrome / Edge / Firefox.",es:"Prueba un archivo más pequeño o la última versión de Chrome / Edge / Firefox.",pt:"Tente um arquivo menor ou a versão mais recente do Chrome / Edge / Firefox.",ar:"جرّب ملفًا أصغر أو أحدث إصدار من Chrome / Edge / Firefox."},
  "处理结果":{zh:"处理结果",en:"Result",ja:"処理結果",ko:"처리 결과",fr:"Résultat",de:"Ergebnis",es:"Resultado",pt:"Resultado",ar:"النتيجة"},
  "下载":{zh:"下载",en:"Download",ja:"ダウンロード",ko:"다운로드",fr:"Télécharger",de:"Herunterladen",es:"Descargar",pt:"Baixar",ar:"تنزيل"},
  "未能完成":{zh:"未能完成",en:"Could not finish",ja:"完了できませんでした",ko:"완료하지 못했습니다",fr:"Impossible de terminer",de:"Konnte nicht abgeschlossen werden",es:"No se pudo completar",pt:"Não foi possível concluir",ar:"تعذر الإكمال"},
  "拖拽文件到这里，或点击选择":{zh:"拖拽文件到这里，或点击选择",en:"Drop files here, or click to choose",ja:"ここにファイルをドロップするか、クリックして選択",ko:"파일을 여기에 놓거나 클릭해 선택",fr:"Déposez les fichiers ici ou cliquez pour choisir",de:"Dateien hier ablegen oder zum Auswählen klicken",es:"Suelta los archivos aquí o haz clic para elegir",pt:"Solte os arquivos aqui ou clique para escolher",ar:"أسقط الملفات هنا أو انقر للاختيار"},
  "移除":{zh:"移除",en:"Remove",ja:"削除",ko:"제거",fr:"Retirer",de:"Entfernen",es:"Quitar",pt:"Remover",ar:"إزالة"},
  "还没有选择文件。":{zh:"还没有选择文件。",en:"No file selected.",ja:"ファイルが選択されていません。",ko:"파일이 선택되지 않았습니다.",fr:"Aucun fichier sélectionné.",de:"Keine Datei ausgewählt.",es:"No hay ningún archivo seleccionado.",pt:"Nenhum arquivo selecionado.",ar:"لم يتم اختيار ملف."},
  "请先拖拽或点击上传区域选择文件。":{zh:"请先拖拽或点击上传区域选择文件。",en:"Drop or choose a file first.",ja:"まずファイルをドロップするか選択してください。",ko:"먼저 파일을 놓거나 선택하세요.",fr:"Déposez ou choisissez d’abord un fichier.",de:"Legen Sie zuerst eine Datei ab oder wählen Sie eine aus.",es:"Suelta o elige primero un archivo.",pt:"Solte ou escolha primeiro um arquivo.",ar:"أسقط ملفًا أو اختره أولًا."},
  "已通过画布重编码去除 EXIF / GPS 等元数据。":{zh:"已通过画布重编码去除 EXIF / GPS 等元数据。",en:"Metadata (EXIF/GPS etc.) removed by re-encoding on canvas.",ja:"Canvasで再エンコードし、EXIF / GPSなどのメタデータを削除しました。",ko:"Canvas 재인코딩으로 EXIF / GPS 등 메타데이터를 제거했습니다.",fr:"Les métadonnées EXIF/GPS ont été supprimées par réencodage sur canvas.",de:"EXIF-/GPS-Metadaten wurden durch Canvas-Neucodierung entfernt.",es:"Se eliminaron metadatos EXIF/GPS mediante recodificación en canvas.",pt:"Metadados EXIF/GPS foram removidos por recodificação em canvas.",ar:"تمت إزالة بيانات EXIF/GPS عبر إعادة الترميز على Canvas."},
  "哈希已在本地计算完成。":{zh:"哈希已在本地计算完成。",en:"Hashes computed locally.",ja:"ハッシュをローカルで計算しました。",ko:"해시를 로컬에서 계산했습니다.",fr:"Empreintes calculées localement.",de:"Hashes wurden lokal berechnet.",es:"Hashes calculados localmente.",pt:"Hashes calculados localmente.",ar:"تم حساب التجزئات محليًا."},
  "请选择两个文件再对比。":{zh:"请选择两个文件再对比。",en:"Please select two files to compare.",ja:"比較する2つのファイルを選択してください。",ko:"비교할 파일 두 개를 선택하세요.",fr:"Sélectionnez deux fichiers à comparer.",de:"Wählen Sie zwei Dateien zum Vergleich aus.",es:"Selecciona dos archivos para comparar.",pt:"Selecione dois arquivos para comparar.",ar:"اختر ملفين للمقارنة."},
  "两个文件完全一致（内容相同）。":{zh:"两个文件完全一致（内容相同）。",en:"The two files are identical.",ja:"2つのファイルは完全に同一です。",ko:"두 파일이 완전히 동일합니다.",fr:"Les deux fichiers sont identiques.",de:"Die beiden Dateien sind identisch.",es:"Los dos archivos son idénticos.",pt:"Os dois arquivos são idênticos.",ar:"الملفان متطابقان تمامًا."},
  "两个文件不一致。":{zh:"两个文件不一致。",en:"The two files differ.",ja:"2つのファイルは異なります。",ko:"두 파일이 다릅니다.",fr:"Les deux fichiers sont différents.",de:"Die beiden Dateien unterscheiden sich.",es:"Los dos archivos son distintos.",pt:"Os dois arquivos são diferentes.",ar:"الملفان مختلفان."},
  "未知工具逻辑。":{zh:"未知工具逻辑。",en:"Unknown tool handler.",ja:"不明なツール処理です。",ko:"알 수 없는 도구 처리입니다.",fr:"Gestionnaire d’outil inconnu.",de:"Unbekannte Werkzeuglogik.",es:"Lógica de herramienta desconocida.",pt:"Lógica de ferramenta desconhecida.",ar:"معالج أداة غير معروف."},
  "已格式化。":{zh:"已格式化。",en:"Pretty-printed.",ja:"整形しました。",ko:"서식화했습니다.",fr:"Mise en forme terminée.",de:"Formatiert.",es:"Formateado.",pt:"Formatado.",ar:"تم التنسيق."},
  "已压缩为一行。":{zh:"已压缩为一行。",en:"Minified.",ja:"1行に圧縮しました。",ko:"한 줄로 압축했습니다.",fr:"Minifié.",de:"Minifiziert.",es:"Minificado.",pt:"Minificado.",ar:"تم التصغير إلى سطر واحد."},
  "检查是否漏了逗号、引号是否成对、是否使用了尾随逗号。":{zh:"检查是否漏了逗号、引号是否成对、是否使用了尾随逗号。",en:"Check missing commas, unmatched quotes, or trailing commas.",ja:"カンマの抜け、引用符の対応、末尾カンマを確認してください。",ko:"쉼표 누락, 따옴표 짝, 후행 쉼표를 확인하세요.",fr:"Vérifiez les virgules manquantes, les guillemets non appariés ou les virgules finales.",de:"Prüfen Sie fehlende Kommas, nicht passende Anführungszeichen oder abschließende Kommas.",es:"Revisa comas faltantes, comillas sin pareja o comas finales.",pt:"Verifique vírgulas ausentes, aspas sem par ou vírgulas finais.",ar:"تحقق من الفواصل المفقودة أو علامات الاقتباس غير المتطابقة أو الفواصل النهائية."},
  "转换成功（按本机时区显示）。":{zh:"转换成功（按本机时区显示）。",en:"Converted (shown in your local timezone).",ja:"変換しました（ローカルタイムゾーンで表示）。",ko:"변환 완료(로컬 시간대로 표시).",fr:"Conversion réussie (affichée dans votre fuseau local).",de:"Konvertiert (in Ihrer lokalen Zeitzone angezeigt).",es:"Convertido (mostrado en tu zona horaria local).",pt:"Convertido (exibido no seu fuso horário local).",ar:"تم التحويل (يُعرض حسب منطقتك الزمنية المحلية)."},
  "无法解析该时间戳。":{zh:"无法解析该时间戳。",en:"Could not parse this timestamp.",ja:"このタイムスタンプを解析できません。",ko:"이 타임스탬프를 해석할 수 없습니다.",fr:"Impossible d’analyser cet horodatage.",de:"Dieser Zeitstempel konnte nicht gelesen werden.",es:"No se pudo interpretar esta marca de tiempo.",pt:"Não foi possível interpretar este timestamp.",ar:"تعذر تحليل هذا الطابع الزمني."},
  "请输入数字；注意秒与毫秒不要搞反。":{zh:"请输入数字；注意秒与毫秒不要搞反。",en:"Enter a number; do not mix seconds and milliseconds.",ja:"数値を入力し、秒とミリ秒を取り違えないでください。",ko:"숫자를 입력하고 초와 밀리초를 혼동하지 마세요.",fr:"Saisissez un nombre ; ne confondez pas secondes et millisecondes.",de:"Geben Sie eine Zahl ein; Sekunden und Millisekunden nicht verwechseln.",es:"Introduce un número; no confundas segundos y milisegundos.",pt:"Digite um número; não confunda segundos e milissegundos.",ar:"أدخل رقمًا ولا تخلط بين الثواني والميلي ثانية."}
};

function exact(lang:LingxiLang,zh:string,en:string){return EXACT[zh]?.[lang] ?? (lang==="zh"?zh:en);}

export function toolRuntimeText(lang:LingxiLang,zh:string,en:string){
  if(EXACT[zh]) return exact(lang,zh,en);
  let m:RegExpMatchArray|null;

  if((m=zh.match(/^文件过大：(.+)（上限 (\d+)MB）$/))){
    const [,name,max]=m;
    const map:Record<LingxiLang,string>={
      zh, en:`File too large: ${name} (limit ${max}MB)`, ja:`ファイルが大きすぎます：${name}（上限 ${max}MB）`,
      ko:`파일이 너무 큽니다: ${name} (한도 ${max}MB)`, fr:`Fichier trop volumineux : ${name} (limite ${max} Mo)`,
      de:`Datei zu groß: ${name} (Limit ${max} MB)`, es:`Archivo demasiado grande: ${name} (límite ${max} MB)`,
      pt:`Arquivo muito grande: ${name} (limite ${max} MB)`, ar:`الملف كبير جدًا: ${name} (الحد ${max}MB)`
    }; return map[lang];
  }

  if((m=zh.match(/^单文件上限 (\d+)MB(?: · 最多 (\d+) 个)?$/))){
    const [,max,count]=m;
    const c=count?Number(count):0;
    const map:Record<LingxiLang,string>={
      zh, en:`Max ${max}MB per file${c?` · up to ${c} files`:""}`,
      ja:`1ファイル最大 ${max}MB${c?` · 最大 ${c} 個`:""}`,
      ko:`파일당 최대 ${max}MB${c?` · 최대 ${c}개`:""}`,
      fr:`${max} Mo max. par fichier${c?` · jusqu’à ${c} fichiers`:""}`,
      de:`Max. ${max} MB pro Datei${c?` · bis zu ${c} Dateien`:""}`,
      es:`Máx. ${max}MB por archivo${c?` · hasta ${c} archivos`:""}`,
      pt:`Máx. ${max}MB por arquivo${c?` · até ${c} arquivos`:""}`,
      ar:`الحد ${max}MB لكل ملف${c?` · حتى ${c} ملفات`:""}`
    }; return map[lang];
  }

  if((m=zh.match(/^处理时出错：(.+)$/))){
    const detail=m[1]; const label=exact(lang,"未能完成","Could not finish");
    const prefixes:Record<LingxiLang,string>={zh:"处理时出错：",en:"Processing error: ",ja:"処理エラー：",ko:"처리 오류: ",fr:"Erreur de traitement : ",de:"Verarbeitungsfehler: ",es:"Error de procesamiento: ",pt:"Erro de processamento: ",ar:"خطأ في المعالجة: "};
    return prefixes[lang]+detail;
  }

  if((m=zh.match(/^已转换为 JPG（(\d+)×(\d+)）。透明区域会变成白底。$/))){
    const[,w,h]=m; const map:Record<LingxiLang,string>={zh,en:`Converted to JPG (${w}×${h}). Transparency becomes white.`,ja:`JPGに変換しました（${w}×${h}）。透明部分は白になります。`,ko:`JPG로 변환했습니다 (${w}×${h}). 투명 영역은 흰색이 됩니다.`,fr:`Converti en JPG (${w}×${h}). La transparence devient blanche.`,de:`In JPG konvertiert (${w}×${h}). Transparenz wird weiß.`,es:`Convertido a JPG (${w}×${h}). La transparencia se vuelve blanca.`,pt:`Convertido para JPG (${w}×${h}). A transparência vira branco.`,ar:`تم التحويل إلى JPG (${w}×${h}). ستصبح المناطق الشفافة بيضاء.`};return map[lang];
  }
  if((m=zh.match(/^已转换为 PNG（(\d+)×(\d+)）。$/))){
    const[,w,h]=m; const map:Record<LingxiLang,string>={zh,en:`Converted to PNG (${w}×${h}).`,ja:`PNGに変換しました（${w}×${h}）。`,ko:`PNG로 변환했습니다 (${w}×${h}).`,fr:`Converti en PNG (${w}×${h}).`,de:`In PNG konvertiert (${w}×${h}).`,es:`Convertido a PNG (${w}×${h}).`,pt:`Convertido para PNG (${w}×${h}).`,ar:`تم التحويل إلى PNG (${w}×${h}).`};return map[lang];
  }
  if((m=zh.match(/^已转换（(\d+)×(\d+)）。$/))){
    const[,w,h]=m; const map:Record<LingxiLang,string>={zh,en:`Converted (${w}×${h}).`,ja:`変換しました（${w}×${h}）。`,ko:`변환했습니다 (${w}×${h}).`,fr:`Converti (${w}×${h}).`,de:`Konvertiert (${w}×${h}).`,es:`Convertido (${w}×${h}).`,pt:`Convertido (${w}×${h}).`,ar:`تم التحويل (${w}×${h}).`};return map[lang];
  }
  if((m=zh.match(/^已调整为 (\d+)×(\d+)。$/))){
    const[,w,h]=m; const map:Record<LingxiLang,string>={zh,en:`Resized to ${w}×${h}.`,ja:`${w}×${h} にリサイズしました。`,ko:`${w}×${h}로 크기를 조정했습니다.`,fr:`Redimensionné à ${w}×${h}.`,de:`Auf ${w}×${h} skaliert.`,es:`Redimensionado a ${w}×${h}.`,pt:`Redimensionado para ${w}×${h}.`,ar:`تم تغيير الحجم إلى ${w}×${h}.`};return map[lang];
  }
  if((m=zh.match(/^JSON 无法解析：(.+)$/))){
    const detail=m[1];const prefix:Record<LingxiLang,string>={zh:"JSON 无法解析：",en:"Invalid JSON: ",ja:"JSONを解析できません：",ko:"JSON을 해석할 수 없습니다: ",fr:"JSON invalide : ",de:"Ungültiges JSON: ",es:"JSON no válido: ",pt:"JSON inválido: ",ar:"JSON غير صالح: "};return prefix[lang]+detail;
  }


  if((m=zh.match(/^已尽力压缩到 ([\d.]+) KB（目标 ([\d.]+) KB）。源图信息量过大，无法在不严重糊化的前提下进一步缩小。$/))){
    const[,size,target]=m;const map:Record<LingxiLang,string>={zh,en:`Reached ${size} KB (target ${target} KB). Source has too much detail to go lower without severe quality loss.`,ja:`${size} KBまで圧縮しました（目標 ${target} KB）。元画像の情報量が多く、画質を大きく損なわずにこれ以上小さくできません。`,ko:`${size} KB까지 압축했습니다 (목표 ${target} KB). 원본 정보량이 많아 심한 품질 저하 없이 더 줄이기 어렵습니다.`,fr:`Compression à ${size} Ko (cible ${target} Ko). L’image contient trop de détails pour aller plus bas sans forte perte de qualité.`,de:`Auf ${size} KB komprimiert (Ziel ${target} KB). Für eine weitere Reduktion wäre ein deutlicher Qualitätsverlust nötig.`,es:`Comprimido a ${size} KB (objetivo ${target} KB). La imagen tiene demasiado detalle para reducir más sin una pérdida severa de calidad.`,pt:`Comprimido para ${size} KB (alvo ${target} KB). A imagem tem detalhes demais para reduzir mais sem grande perda de qualidade.`,ar:`تم الضغط إلى ${size} KB (الهدف ${target} KB). تحتوي الصورة على تفاصيل كثيرة ولا يمكن تقليلها أكثر دون خسارة كبيرة في الجودة.`};return map[lang];
  }
  if((m=zh.match(/^已压缩到 ([\d.]+) KB（目标 ≤([\d.]+) KB），质量约 ([\d.]+)。$/))){
    const[,size,target,q]=m;const map:Record<LingxiLang,string>={zh,en:`Compressed to ${size} KB (target ≤${target} KB), quality ≈ ${q}.`,ja:`${size} KBに圧縮しました（目標 ≤${target} KB）、品質 ≈ ${q}。`,ko:`${size} KB로 압축했습니다 (목표 ≤${target} KB), 품질 ≈ ${q}.`,fr:`Compressé à ${size} Ko (cible ≤${target} Ko), qualité ≈ ${q}.`,de:`Auf ${size} KB komprimiert (Ziel ≤${target} KB), Qualität ≈ ${q}.`,es:`Comprimido a ${size} KB (objetivo ≤${target} KB), calidad ≈ ${q}.`,pt:`Comprimido para ${size} KB (alvo ≤${target} KB), qualidade ≈ ${q}.`,ar:`تم الضغط إلى ${size} KB (الهدف ≤${target} KB)، الجودة ≈ ${q}.`};return map[lang];
  }
  if((m=zh.match(/^检测到真实类型更像 (.+)（(.+)），但扩展名是 \.(.+)——这常导致上传失败。$/))){
    const[,label,mime,ext]=m;const map:Record<LingxiLang,string>={zh,en:`Real type looks like ${label} (${mime}), but extension is .${ext} — a common upload failure cause.`,ja:`実際の形式は ${label}（${mime}）に見えますが、拡張子は .${ext} です。これはアップロード失敗の一般的な原因です。`,ko:`실제 형식은 ${label} (${mime})에 가깝지만 확장자는 .${ext}입니다. 업로드 실패의 흔한 원인입니다.`,fr:`Le type réel semble être ${label} (${mime}), mais l’extension est .${ext} — cause fréquente d’échec d’envoi.`,de:`Der echte Typ scheint ${label} (${mime}) zu sein, die Erweiterung ist jedoch .${ext} — eine häufige Upload-Fehlerquelle.`,es:`El tipo real parece ${label} (${mime}), pero la extensión es .${ext}; esto suele causar fallos de subida.`,pt:`O tipo real parece ${label} (${mime}), mas a extensão é .${ext}; isso costuma causar falhas de upload.`,ar:`يبدو النوع الحقيقي ${label} (${mime}) لكن الامتداد هو .${ext}، وهذا سبب شائع لفشل الرفع.`};return map[lang];
  }
  if((m=zh.match(/^检测到：(.+)（(.+)），与扩展名一致。$/))){
    const[,label,mime]=m;const map:Record<LingxiLang,string>={zh,en:`Detected: ${label} (${mime}), consistent with the extension.`,ja:`検出：${label}（${mime}）、拡張子と一致しています。`,ko:`감지됨: ${label} (${mime}), 확장자와 일치합니다.`,fr:`Détecté : ${label} (${mime}), cohérent avec l’extension.`,de:`Erkannt: ${label} (${mime}), stimmt mit der Erweiterung überein.`,es:`Detectado: ${label} (${mime}), coincide con la extensión.`,pt:`Detectado: ${label} (${mime}), consistente com a extensão.`,ar:`تم الاكتشاف: ${label} (${mime})، ومتوافق مع الامتداد.`};return map[lang];
  }

  return lang==="zh"?zh:en;
}
