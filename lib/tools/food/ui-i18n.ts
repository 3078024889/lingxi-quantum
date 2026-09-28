import type {LingxiLang} from "@/lib/lingxi-i18n";

export type FoodUiKey=
 |"nameMode"|"imageMode"|"perCalc"|"imageModeLead"|"fullResult"|"protein"|"carbs"|"fat"|"fiber"|"sugar"|"sodium"
 |"missing"|"varianceNote"|"enterFoodWeight"|"foodName"|"foodPlaceholder"|"weight"|"searching"|"findFood"|"noFood"
 |"remove"|"generating"|"payGenerate"|"calcFailed"|"confirmPhoto"|"photoLead"|"choosePhoto"|"previewAlt"|"classifying"
 |"photoSuggestions"|"noneThese"|"confirmSeparately"|"imageUnavailable"|"imageNoSuggestions"|"sourceLocal"
 |"tryBroader"|"databaseBuilding"|"imageSmartHint"|"grams"|"calculation";

type D=Record<FoodUiKey,string>;
const zh:D={
 nameMode:"输入食物名称 + 重量",imageMode:"上传图片识别食物",perCalc:"次",imageModeLead:"免费查看图片建议，确认食物后再按名称与重量计算。",
 fullResult:"完整营养结果",protein:"蛋白质",carbs:"碳水化合物",fat:"脂肪",fiber:"膳食纤维",sugar:"糖",sodium:"钠",
 missing:"暂无测定值",varianceNote:"不同品种、品牌与烹饪方式会带来差异；没有测定的数据不会用 0 代替。",
 enterFoodWeight:"输入食物和实际重量",foodName:"食物名称",foodPlaceholder:"例如：火龙果、米饭、牛排",weight:"实际重量（克）",
 searching:"查找中…",findFood:"查找食物",noFood:"没有找到这个食物，可以换个名称、英文名或更通用的叫法试试。",
 remove:"移除",generating:"正在生成完整结果…",payGenerate:"支付后生成完整营养结果",calcFailed:"这次没有计算成功，请重试。",
 confirmPhoto:"看图确认食物，再计算营养",photoLead:"上传清晰照片。图片只负责给出食物候选，重量仍需要你确认；拼盘和混合菜建议逐项添加。",
 choosePhoto:"选择食物照片",previewAlt:"待确认的食物照片",classifying:"正在分析图片…",photoSuggestions:"照片里可能有这些食物",
 noneThese:"都不是，我来填写",confirmSeparately:"请在下方添加你确认的食物与实际重量。图片建议不会自动变成营养结果。",
 imageUnavailable:"图片识别暂时不可用，请手动填写食物。",imageNoSuggestions:"没有得到可靠的图片建议，请手动填写食物。",
 sourceLocal:"本地识别",tryBroader:"已启用更广的本地食物识别候选。",databaseBuilding:"营养数据库正在扩展中。",
 imageSmartHint:"单张照片无法可靠测量份量；结果应以你确认的食物与重量为准。",grams:"克",calculation:"次"
};
const en:D={
 nameMode:"Food name + weight",imageMode:"Recognize food from a photo",perCalc:"calculation",imageModeLead:"See photo suggestions for free, then confirm the food and weight before calculation.",
 fullResult:"Complete nutrition result",protein:"Protein",carbs:"Carbohydrate",fat:"Fat",fiber:"Fiber",sugar:"Sugar",sodium:"Sodium",
 missing:"No measured value",varianceNote:"Values vary by variety, brand and preparation. Missing measurements are not replaced with zero.",
 enterFoodWeight:"Enter foods and actual weight",foodName:"Food name",foodPlaceholder:"e.g. dragon fruit, rice, steak",weight:"Actual weight (g)",
 searching:"Searching…",findFood:"Find food",noFood:"No match found. Try another name, the English name, or a broader food term.",
 remove:"Remove",generating:"Generating full result…",payGenerate:"Pay & generate full nutrition result",calcFailed:"Calculation did not finish. Please retry.",
 confirmPhoto:"Confirm the food from the photo, then calculate nutrition",photoLead:"Upload a clear photo. The image only suggests possible foods; you still confirm the food and weight. Add mixed plates item by item.",
 choosePhoto:"Choose food photo",previewAlt:"Food photo to confirm",classifying:"Analyzing image…",photoSuggestions:"Possible foods in this photo",
 noneThese:"None of these",confirmSeparately:"Add each confirmed food and its actual weight below. Photo suggestions never become nutrition results automatically.",
 imageUnavailable:"Image recognition is temporarily unavailable. Enter the food manually.",imageNoSuggestions:"No reliable image suggestion was found. Enter the food manually.",
 sourceLocal:"Local recognition",tryBroader:"Broader local food candidates are enabled.",databaseBuilding:"The nutrition database is being expanded.",
 imageSmartHint:"A single photo cannot reliably measure portion size. Use the food and weight you confirm.",grams:"g",calculation:"calculation"
};
const ja:D={...en,
 nameMode:"食べ物名 + 重量",imageMode:"写真から食べ物を確認",perCalc:"回",imageModeLead:"写真候補は無料で確認し、食べ物と重量を確定してから計算します。",
 fullResult:"栄養結果",protein:"たんぱく質",carbs:"炭水化物",fat:"脂質",fiber:"食物繊維",sugar:"糖類",sodium:"ナトリウム",
 missing:"測定値なし",enterFoodWeight:"食べ物と実際の重量を入力",foodName:"食べ物名",foodPlaceholder:"例：ドラゴンフルーツ、ご飯、ステーキ",weight:"実際の重量（g）",
 searching:"検索中…",findFood:"食べ物を検索",noFood:"一致する食べ物がありません。別名や英語名でも試してください。",
 remove:"削除",generating:"栄養結果を作成中…",payGenerate:"支払い後に栄養結果を作成",calcFailed:"計算できませんでした。再試行してください。",
 confirmPhoto:"写真で食べ物を確認してから栄養を計算",photoLead:"鮮明な写真を追加してください。写真は候補を示すだけで、食べ物と重量は自分で確認します。",
 choosePhoto:"食べ物の写真を選択",previewAlt:"確認する食べ物の写真",classifying:"画像を解析中…",photoSuggestions:"写真に含まれる可能性のある食べ物",
 noneThese:"どれでもない",confirmSeparately:"確認した食べ物と実際の重量を下に追加してください。",imageUnavailable:"画像認識を利用できません。手動で入力してください。",
 imageNoSuggestions:"信頼できる候補が見つかりません。手動で入力してください。",sourceLocal:"ローカル認識",tryBroader:"より広いローカル候補を使用しています。",databaseBuilding:"栄養データベースを拡張中です。",
 imageSmartHint:"1枚の写真だけでは量を正確に測れません。確認した食べ物と重量を基準にしてください。",grams:"g",calculation:"回"
};
const ko:D={...en,
 nameMode:"음식 이름 + 무게",imageMode:"사진으로 음식 확인",perCalc:"회",imageModeLead:"사진 후보는 무료로 확인하고 음식과 무게를 확정한 뒤 계산합니다.",
 fullResult:"전체 영양 결과",protein:"단백질",carbs:"탄수화물",fat:"지방",fiber:"식이섬유",sugar:"당",sodium:"나트륨",
 missing:"측정값 없음",enterFoodWeight:"음식과 실제 무게 입력",foodName:"음식 이름",foodPlaceholder:"예: 용과, 밥, 스테이크",weight:"실제 무게(g)",
 searching:"검색 중…",findFood:"음식 찾기",noFood:"일치하는 음식이 없습니다. 다른 이름이나 영어 이름으로 시도하세요.",
 remove:"삭제",generating:"영양 결과 생성 중…",payGenerate:"결제 후 전체 영양 결과 생성",calcFailed:"계산하지 못했습니다. 다시 시도하세요.",
 confirmPhoto:"사진에서 음식을 확인한 뒤 영양 계산",photoLead:"선명한 사진을 올려 주세요. 사진은 음식 후보만 제안하며 음식과 무게는 직접 확인해야 합니다.",
 choosePhoto:"음식 사진 선택",previewAlt:"확인할 음식 사진",classifying:"이미지 분석 중…",photoSuggestions:"사진에 있을 수 있는 음식",
 noneThese:"모두 아님",confirmSeparately:"확인한 음식과 실제 무게를 아래에 각각 추가하세요.",imageUnavailable:"이미지 인식을 사용할 수 없습니다. 직접 입력하세요.",
 imageNoSuggestions:"신뢰할 만한 후보를 찾지 못했습니다. 직접 입력하세요.",sourceLocal:"로컬 인식",tryBroader:"더 넓은 로컬 음식 후보를 사용합니다.",databaseBuilding:"영양 데이터베이스를 확장 중입니다.",
 imageSmartHint:"사진 한 장으로는 양을 정확히 측정할 수 없습니다. 확인한 음식과 무게를 기준으로 계산하세요.",grams:"g",calculation:"회"
};
const fr:D={...en,
 nameMode:"Nom de l’aliment + poids",imageMode:"Reconnaître un aliment sur photo",perCalc:"calcul",imageModeLead:"Consultez gratuitement les suggestions de la photo, puis confirmez l’aliment et le poids.",
 fullResult:"Résultat nutritionnel complet",protein:"Protéines",carbs:"Glucides",fat:"Lipides",fiber:"Fibres",sugar:"Sucres",sodium:"Sodium",
 missing:"Valeur non mesurée",enterFoodWeight:"Saisir les aliments et le poids réel",foodName:"Nom de l’aliment",foodPlaceholder:"ex. fruit du dragon, riz, steak",weight:"Poids réel (g)",
 searching:"Recherche…",findFood:"Rechercher",noFood:"Aucun aliment correspondant. Essayez un autre nom ou le nom anglais.",
 remove:"Retirer",generating:"Calcul du résultat complet…",payGenerate:"Payer et générer le résultat complet",calcFailed:"Le calcul n’a pas abouti. Réessayez.",
 confirmPhoto:"Confirmer l’aliment sur la photo puis calculer",photoLead:"Ajoutez une photo nette. L’image propose seulement des aliments possibles ; confirmez vous-même l’aliment et le poids.",
 choosePhoto:"Choisir une photo",previewAlt:"Photo à confirmer",classifying:"Analyse de l’image…",photoSuggestions:"Aliments possibles sur cette photo",
 noneThese:"Aucun de ceux-ci",confirmSeparately:"Ajoutez chaque aliment confirmé avec son poids réel.",imageUnavailable:"La reconnaissance d’image est indisponible. Saisissez l’aliment manuellement.",
 imageNoSuggestions:"Aucune suggestion fiable. Saisissez l’aliment manuellement.",sourceLocal:"Reconnaissance locale",tryBroader:"Des candidats alimentaires locaux plus larges sont activés.",databaseBuilding:"La base nutritionnelle est en cours d’extension.",
 imageSmartHint:"Une photo seule ne mesure pas fiablement les portions. Utilisez l’aliment et le poids que vous confirmez.",grams:"g",calculation:"calcul"
};
const de:D={...en,
 nameMode:"Lebensmittel + Gewicht",imageMode:"Lebensmittel auf Foto erkennen",perCalc:"Berechnung",imageModeLead:"Foto-Vorschläge kostenlos ansehen und Lebensmittel sowie Gewicht vor der Berechnung bestätigen.",
 fullResult:"Vollständiges Nährwert-Ergebnis",protein:"Protein",carbs:"Kohlenhydrate",fat:"Fett",fiber:"Ballaststoffe",sugar:"Zucker",sodium:"Natrium",
 missing:"Kein Messwert",enterFoodWeight:"Lebensmittel und tatsächliches Gewicht eingeben",foodName:"Lebensmittel",foodPlaceholder:"z. B. Drachenfrucht, Reis, Steak",weight:"Gewicht (g)",
 searching:"Suche…",findFood:"Lebensmittel suchen",noFood:"Kein Treffer. Versuche einen anderen Namen oder die englische Bezeichnung.",
 remove:"Entfernen",generating:"Nährwerte werden berechnet…",payGenerate:"Bezahlen und Nährwerte erzeugen",calcFailed:"Berechnung fehlgeschlagen. Bitte erneut versuchen.",
 confirmPhoto:"Lebensmittel auf Foto bestätigen, dann Nährwerte berechnen",photoLead:"Lade ein klares Foto hoch. Das Bild liefert nur Vorschläge; Lebensmittel und Gewicht musst du bestätigen.",
 choosePhoto:"Foto auswählen",previewAlt:"Zu bestätigendes Lebensmittelfoto",classifying:"Bild wird analysiert…",photoSuggestions:"Mögliche Lebensmittel auf dem Foto",
 noneThese:"Keines davon",confirmSeparately:"Füge jedes bestätigte Lebensmittel mit tatsächlichem Gewicht hinzu.",imageUnavailable:"Bilderkennung ist derzeit nicht verfügbar. Bitte manuell eingeben.",
 imageNoSuggestions:"Keine verlässliche Empfehlung gefunden. Bitte manuell eingeben.",sourceLocal:"Lokale Erkennung",tryBroader:"Breitere lokale Lebensmittelkandidaten sind aktiviert.",databaseBuilding:"Die Nährwertdatenbank wird erweitert.",
 imageSmartHint:"Ein einzelnes Foto kann Portionsgrößen nicht zuverlässig messen. Maßgeblich sind Lebensmittel und Gewicht, die du bestätigst.",grams:"g",calculation:"Berechnung"
};
const es:D={...en,
 nameMode:"Alimento + peso",imageMode:"Reconocer alimento en una foto",perCalc:"cálculo",imageModeLead:"Consulta gratis las sugerencias de la foto y confirma alimento y peso antes de calcular.",
 fullResult:"Resultado nutricional completo",protein:"Proteína",carbs:"Carbohidratos",fat:"Grasa",fiber:"Fibra",sugar:"Azúcar",sodium:"Sodio",
 missing:"Sin valor medido",enterFoodWeight:"Introduce alimentos y peso real",foodName:"Nombre del alimento",foodPlaceholder:"p. ej. pitahaya, arroz, bistec",weight:"Peso real (g)",
 searching:"Buscando…",findFood:"Buscar alimento",noFood:"No encontramos coincidencias. Prueba otro nombre o el nombre en inglés.",
 remove:"Quitar",generating:"Generando resultado completo…",payGenerate:"Pagar y generar resultado completo",calcFailed:"El cálculo no terminó. Inténtalo de nuevo.",
 confirmPhoto:"Confirma el alimento de la foto y calcula la nutrición",photoLead:"Sube una foto clara. La imagen solo propone alimentos posibles; tú confirmas el alimento y el peso.",
 choosePhoto:"Elegir foto",previewAlt:"Foto del alimento a confirmar",classifying:"Analizando imagen…",photoSuggestions:"Posibles alimentos en esta foto",
 noneThese:"Ninguno",confirmSeparately:"Añade cada alimento confirmado y su peso real.",imageUnavailable:"El reconocimiento de imagen no está disponible. Introduce el alimento manualmente.",
 imageNoSuggestions:"No se encontró una sugerencia fiable. Introduce el alimento manualmente.",sourceLocal:"Reconocimiento local",tryBroader:"Se usan candidatos locales más amplios.",databaseBuilding:"La base nutricional se está ampliando.",
 imageSmartHint:"Una sola foto no mide bien las porciones. Usa el alimento y el peso que confirmes.",grams:"g",calculation:"cálculo"
};
const pt:D={...en,
 nameMode:"Alimento + peso",imageMode:"Reconhecer alimento na foto",perCalc:"cálculo",imageModeLead:"Veja sugestões da foto gratuitamente e confirme alimento e peso antes do cálculo.",
 fullResult:"Resultado nutricional completo",protein:"Proteína",carbs:"Carboidratos",fat:"Gordura",fiber:"Fibra",sugar:"Açúcar",sodium:"Sódio",
 missing:"Sem valor medido",enterFoodWeight:"Informe os alimentos e o peso real",foodName:"Nome do alimento",foodPlaceholder:"ex.: pitaya, arroz, bife",weight:"Peso real (g)",
 searching:"Buscando…",findFood:"Buscar alimento",noFood:"Nenhum alimento encontrado. Tente outro nome ou o nome em inglês.",
 remove:"Remover",generating:"Gerando resultado completo…",payGenerate:"Pagar e gerar resultado completo",calcFailed:"O cálculo não terminou. Tente novamente.",
 confirmPhoto:"Confirme o alimento na foto e calcule a nutrição",photoLead:"Envie uma foto nítida. A imagem apenas sugere alimentos; você confirma o alimento e o peso.",
 choosePhoto:"Escolher foto",previewAlt:"Foto do alimento para confirmar",classifying:"Analisando imagem…",photoSuggestions:"Possíveis alimentos nesta foto",
 noneThese:"Nenhum destes",confirmSeparately:"Adicione cada alimento confirmado com o peso real.",imageUnavailable:"O reconhecimento de imagem não está disponível. Informe manualmente.",
 imageNoSuggestions:"Nenhuma sugestão confiável foi encontrada. Informe manualmente.",sourceLocal:"Reconhecimento local",tryBroader:"Candidatos locais mais amplos estão ativados.",databaseBuilding:"A base nutricional está sendo ampliada.",
 imageSmartHint:"Uma foto não mede a porção com precisão. Use o alimento e o peso que você confirmar.",grams:"g",calculation:"cálculo"
};
const ar:D={...en,
 nameMode:"اسم الطعام + الوزن",imageMode:"التعرف على الطعام من صورة",perCalc:"عملية",imageModeLead:"اعرض اقتراحات الصورة مجانًا ثم أكّد الطعام والوزن قبل الحساب.",
 fullResult:"النتيجة الغذائية الكاملة",protein:"البروتين",carbs:"الكربوهيدرات",fat:"الدهون",fiber:"الألياف",sugar:"السكر",sodium:"الصوديوم",
 missing:"لا توجد قيمة مقاسة",enterFoodWeight:"أدخل الطعام والوزن الفعلي",foodName:"اسم الطعام",foodPlaceholder:"مثال: فاكهة التنين، أرز، ستيك",weight:"الوزن الفعلي (غ)",
 searching:"جارٍ البحث…",findFood:"بحث عن الطعام",noFood:"لم نجد تطابقًا. جرّب اسمًا آخر أو الاسم الإنجليزي.",
 remove:"إزالة",generating:"جارٍ إنشاء النتيجة الكاملة…",payGenerate:"ادفع وأنشئ النتيجة الغذائية",calcFailed:"لم يكتمل الحساب. حاول مرة أخرى.",
 confirmPhoto:"أكّد الطعام من الصورة ثم احسب التغذية",photoLead:"ارفع صورة واضحة. الصورة تقترح أطعمة محتملة فقط؛ عليك تأكيد الطعام والوزن.",
 choosePhoto:"اختيار صورة الطعام",previewAlt:"صورة الطعام المراد تأكيدها",classifying:"جارٍ تحليل الصورة…",photoSuggestions:"أطعمة محتملة في هذه الصورة",
 noneThese:"لا شيء منها",confirmSeparately:"أضف كل طعام مؤكد مع وزنه الفعلي.",imageUnavailable:"التعرف على الصورة غير متاح حاليًا. أدخل الطعام يدويًا.",
 imageNoSuggestions:"لم نجد اقتراحًا موثوقًا. أدخل الطعام يدويًا.",sourceLocal:"تعرف محلي",tryBroader:"تم تفعيل مجموعة أوسع من الأطعمة المحلية.",databaseBuilding:"يتم توسيع قاعدة البيانات الغذائية.",
 imageSmartHint:"لا يمكن لصورة واحدة قياس الحصة بدقة. اعتمد الطعام والوزن اللذين تؤكدهما.",grams:"غ",calculation:"عملية"
};

const ALL:Record<LingxiLang,D>={zh,en,ja,ko,fr,de,es,pt,ar};
export function foodUi(lang:LingxiLang,key:FoodUiKey){return (ALL[lang]??en)[key]??en[key]??zh[key]}
