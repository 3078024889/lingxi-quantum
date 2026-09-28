import type {LingxiLang} from "@/lib/lingxi-i18n";
import type {FunctionTask} from "@/lib/sasi/function-options";

type Copy={label:string;description:string};
const zh:Record<string,Copy>={
 continuity:{label:"人物与场景一致",description:"延续人物、服装和场景细节"},shots:{label:"镜头设计",description:"让动作、运镜与转场衔接自然"},
 dialogue:{label:"对白润色",description:"贴合角色语气与片段时长"},image:{label:"画面风格",description:"围绕你的参考与审美整理画面"},
 evidence:{label:"原文溯源",description:"重要结论回到资料原文"},teach:{label:"讲解与练习",description:"用例子讲清概念，再用问题巩固"},
 compare:{label:"观点对照",description:"比较依据、分歧与尚未确定之处"},website:{label:"页面设计",description:"围绕访客需求组织内容与行动入口"},
 mobile:{label:"手机适配",description:"让小屏浏览、阅读与操作更顺手"}
};
const en:Record<string,Copy>={
 continuity:{label:"Character & scene consistency",description:"Keep characters, wardrobe and scene details consistent"},shots:{label:"Shot design",description:"Improve action, camera movement and transitions"},
 dialogue:{label:"Dialogue polish",description:"Fit character voice and clip duration"},image:{label:"Visual style",description:"Shape visuals around your references and taste"},
 evidence:{label:"Source tracing",description:"Tie important conclusions back to source material"},teach:{label:"Explain & practice",description:"Teach with examples, then reinforce with questions"},
 compare:{label:"Compare viewpoints",description:"Compare evidence, disagreements and uncertainty"},website:{label:"Page design",description:"Organize content and actions around visitor needs"},
 mobile:{label:"Mobile layout",description:"Make small-screen reading and interaction smoother"}
};
const ja:Record<string,Copy>={...en,continuity:{label:"人物・シーンの一貫性",description:"人物、衣装、シーンの細部を維持"},shots:{label:"ショット設計",description:"動き、カメラワーク、転換を自然につなぐ"},dialogue:{label:"台詞の調整",description:"役柄の口調と映像時間に合わせる"},website:{label:"ページ設計",description:"訪問者の目的に合わせて内容と導線を整理"},mobile:{label:"モバイル対応",description:"小さい画面でも読みやすく操作しやすくする"}};
const ko:Record<string,Copy>={...en,continuity:{label:"인물·장면 일관성",description:"인물, 의상, 장면 세부를 일관되게 유지"},shots:{label:"장면 설계",description:"동작, 카메라 움직임, 전환을 자연스럽게 연결"},dialogue:{label:"대사 다듬기",description:"캐릭터 말투와 영상 길이에 맞춤"},website:{label:"페이지 디자인",description:"방문자 요구에 맞춰 콘텐츠와 행동 경로 구성"},mobile:{label:"모바일 최적화",description:"작은 화면에서 읽기와 조작을 편하게"}};
const fr:Record<string,Copy>={...en,continuity:{label:"Cohérence personnages/scènes",description:"Préserver personnages, tenues et détails de scène"},shots:{label:"Conception des plans",description:"Fluidifier action, caméra et transitions"},dialogue:{label:"Affiner les dialogues",description:"Adapter le ton du personnage et la durée"},website:{label:"Conception de page",description:"Organiser contenu et actions selon les besoins des visiteurs"},mobile:{label:"Adaptation mobile",description:"Améliorer lecture et usage sur petit écran"}};
const de:Record<string,Copy>={...en,continuity:{label:"Figuren- & Szenenkonsistenz",description:"Figuren, Kleidung und Szenendetails konsistent halten"},shots:{label:"Shot-Design",description:"Bewegung, Kamera und Übergänge natürlich verbinden"},dialogue:{label:"Dialog verfeinern",description:"An Rolle und Clipdauer anpassen"},website:{label:"Seitendesign",description:"Inhalt und Aktionen an Besucherbedürfnissen ausrichten"},mobile:{label:"Mobile Optimierung",description:"Lesen und Bedienung auf kleinen Displays verbessern"}};
const es:Record<string,Copy>={...en,continuity:{label:"Consistencia de personajes y escenas",description:"Mantener personajes, vestuario y detalles de escena"},shots:{label:"Diseño de planos",description:"Conectar acción, cámara y transiciones con naturalidad"},dialogue:{label:"Pulir diálogos",description:"Ajustar voz del personaje y duración"},website:{label:"Diseño de página",description:"Organizar contenido y acciones según el visitante"},mobile:{label:"Adaptación móvil",description:"Mejorar lectura y uso en pantallas pequeñas"}};
const pt:Record<string,Copy>={...en,continuity:{label:"Consistência de personagens e cenas",description:"Manter personagens, figurino e detalhes de cena"},shots:{label:"Design de cenas",description:"Conectar ação, câmera e transições naturalmente"},dialogue:{label:"Aprimorar diálogos",description:"Ajustar voz do personagem e duração"},website:{label:"Design de página",description:"Organizar conteúdo e ações para as necessidades do visitante"},mobile:{label:"Adaptação móvel",description:"Melhorar leitura e uso em telas pequenas"}};
const ar:Record<string,Copy>={...en,continuity:{label:"اتساق الشخصيات والمشاهد",description:"الحفاظ على تفاصيل الشخصيات والملابس والمشهد"},shots:{label:"تصميم اللقطات",description:"ربط الحركة والكاميرا والانتقالات بسلاسة"},dialogue:{label:"تحسين الحوار",description:"ملاءمة نبرة الشخصية ومدة المقطع"},website:{label:"تصميم الصفحة",description:"تنظيم المحتوى والإجراءات حسب احتياجات الزائر"},mobile:{label:"توافق الهاتف",description:"تحسين القراءة والتفاعل على الشاشات الصغيرة"}};
const D:Record<LingxiLang,Record<string,Copy>>={zh,en,ja,ko,fr,de,es,pt,ar};

const shell={
 zh:{add:"添加资料与功能",upload:"添加照片和文件",uploadLead:"剧本、参考图、文档与其他资料",choose:"选择功能 · 可以多选",connect:"连接创作服务",selected:"已选功能",remove:"移除"},
 en:{add:"Add files & tools",upload:"Add photos and files",uploadLead:"Scripts, references, documents and other materials",choose:"Choose tools · multiple allowed",connect:"Connect creation service",selected:"Selected tools",remove:"Remove"},
 ja:{add:"資料と機能を追加",upload:"写真とファイルを追加",uploadLead:"脚本、参考画像、文書など",choose:"機能を選択 · 複数可",connect:"制作サービスを接続",selected:"選択中の機能",remove:"削除"},
 ko:{add:"자료와 기능 추가",upload:"사진과 파일 추가",uploadLead:"대본, 참고 이미지, 문서 등",choose:"기능 선택 · 복수 선택 가능",connect:"제작 서비스 연결",selected:"선택한 기능",remove:"삭제"},
 fr:{add:"Ajouter fichiers et fonctions",upload:"Ajouter photos et fichiers",uploadLead:"Scripts, références, documents et autres éléments",choose:"Choisir des fonctions · sélection multiple",connect:"Connecter un service de création",selected:"Fonctions choisies",remove:"Retirer"},
 de:{add:"Dateien & Funktionen hinzufügen",upload:"Fotos und Dateien hinzufügen",uploadLead:"Skripte, Referenzen, Dokumente und weitere Materialien",choose:"Funktionen wählen · Mehrfachauswahl",connect:"Erstellungsdienst verbinden",selected:"Gewählte Funktionen",remove:"Entfernen"},
 es:{add:"Añadir archivos y funciones",upload:"Añadir fotos y archivos",uploadLead:"Guiones, referencias, documentos y otros materiales",choose:"Elegir funciones · selección múltiple",connect:"Conectar servicio de creación",selected:"Funciones elegidas",remove:"Quitar"},
 pt:{add:"Adicionar arquivos e funções",upload:"Adicionar fotos e arquivos",uploadLead:"Roteiros, referências, documentos e outros materiais",choose:"Escolher funções · seleção múltipla",connect:"Conectar serviço de criação",selected:"Funções escolhidas",remove:"Remover"},
 ar:{add:"إضافة ملفات ووظائف",upload:"إضافة صور وملفات",uploadLead:"نصوص وصور مرجعية ومستندات ومواد أخرى",choose:"اختيار الوظائف · يمكن اختيار عدة وظائف",connect:"ربط خدمة إنشاء",selected:"الوظائف المختارة",remove:"إزالة"}
} as const;

export function localizedFunctionOptions(task:FunctionTask,lang:LingxiLang,base:readonly {id:string;label:string;description:string;tasks:readonly string[]}[]){
 const dict=D[lang]??en;
 return base.filter(x=>x.tasks.includes(task)).map(x=>{
  const copy:Copy=dict[x.id]??en[x.id]??{label:x.label,description:x.description};
  return{id:x.id,label:copy.label,description:copy.description};
 });
}
export function functionMenuText(lang:LingxiLang,key:keyof typeof shell.zh){return (shell[lang]??shell.en)[key]??shell.en[key]}
