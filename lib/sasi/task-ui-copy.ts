import type {LingxiLang} from "@/lib/lingxi-i18n";
import type {SasiMode} from "./core/session-contract";
type TaskCopy=Record<SasiMode|string,string>;
export const SASI_TASK_COPY:Record<LingxiLang,TaskCopy>={
 zh:{website:"做网站",drama:"做短剧",book:"读书与资料",learning:"学习",research:"深度研究",change:"切换任务"},
 en:{website:"Build a website",drama:"Create a short video",book:"Books & sources",learning:"Study",research:"Research",change:"Switch task"},
 ja:{website:"Webサイトを作る",drama:"短編動画を作る",book:"本と資料",learning:"学習",research:"調査",change:"タスクを切り替える"},
 ko:{website:"웹사이트 만들기",drama:"숏드라마 만들기",book:"책과 자료",learning:"학습",research:"연구",change:"작업 전환"},
 fr:{website:"Créer un site",drama:"Créer une courte vidéo",book:"Livres et sources",learning:"Étudier",research:"Recherche",change:"Changer de tâche"},
 de:{website:"Website erstellen",drama:"Kurzvideo erstellen",book:"Bücher und Quellen",learning:"Lernen",research:"Recherche",change:"Aufgabe wechseln"},
 es:{website:"Crear un sitio",drama:"Crear un vídeo corto",book:"Libros y fuentes",learning:"Estudiar",research:"Investigar",change:"Cambiar de tarea"},
 pt:{website:"Criar um site",drama:"Criar um vídeo curto",book:"Livros e fontes",learning:"Estudar",research:"Pesquisar",change:"Mudar de tarefa"},
 ar:{website:"إنشاء موقع",drama:"إنشاء فيديو قصير",book:"الكتب والمصادر",learning:"التعلم",research:"البحث",change:"تبديل المهمة"},
};
