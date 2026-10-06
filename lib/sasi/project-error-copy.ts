import type {LingxiLang} from '@/lib/lingxi-i18n';
const copy:Record<LingxiLang,{brief:string;rate:string;reload:string}>={
 zh:{brief:'请写下你要做的网站或视频，至少两个字；也可以先添加资料。',rate:'你刚创建了较多项目，请先继续已有项目，稍后再新建。',reload:'请刷新页面后重试，你输入的内容仍保留在这里。'},
 en:{brief:'Describe your website or video in at least two characters, or add a file.',rate:'You have created several projects recently. Continue an existing project or try later.',reload:'Refresh the page and try again. Your current input is still here.'},
 ja:{brief:'作りたいサイトや動画を2文字以上で入力するか、資料を追加してください。',rate:'最近多くのプロジェクトを作成しました。既存のものを続けるか、後で再試行してください。',reload:'ページを更新して再試行してください。現在の入力はここに残っています。'},
 ko:{brief:'만들 사이트나 영상을 두 글자 이상 입력하거나 자료를 추가하세요.',rate:'최근 여러 프로젝트를 만들었습니다. 기존 프로젝트를 계속하거나 나중에 다시 시도하세요.',reload:'페이지를 새로 고침하고 다시 시도하세요. 현재 입력은 여기에 남아 있습니다.'},
 fr:{brief:'Décrivez le site ou la vidéo en au moins deux caractères, ou ajoutez un fichier.',rate:'Vous avez créé plusieurs projets récemment. Continuez un projet existant ou réessayez plus tard.',reload:'Actualisez la page et réessayez. Votre saisie actuelle est encore ici.'},
 de:{brief:'Beschreibe die Website oder das Video mit mindestens zwei Zeichen oder füge eine Datei hinzu.',rate:'Du hast zuletzt mehrere Projekte erstellt. Setze ein vorhandenes fort oder versuche es später.',reload:'Lade die Seite neu und versuche es erneut. Deine aktuelle Eingabe ist noch hier.'},
 es:{brief:'Describe el sitio o vídeo con al menos dos caracteres, o añade un archivo.',rate:'Has creado varios proyectos recientemente. Continúa uno existente o inténtalo más tarde.',reload:'Actualiza la página y vuelve a intentarlo. Tu texto actual sigue aquí.'},
 pt:{brief:'Descreva o site ou vídeo com pelo menos dois caracteres, ou adicione um arquivo.',rate:'Você criou vários projetos recentemente. Continue um existente ou tente mais tarde.',reload:'Atualize a página e tente novamente. Seu texto atual continua aqui.'},
 ar:{brief:'صف الموقع أو الفيديو بحرفين على الأقل أو أضف ملفاً.',rate:'أنشأت عدة مشاريع مؤخراً. تابع مشروعاً موجوداً أو حاول لاحقاً.',reload:'حدّث الصفحة وحاول مجدداً. لا يزال النص الحالي موجوداً هنا.'}
};
export function projectErrorCopy(lang:LingxiLang,code:string,status:number):string|null{
 if(code==='INVALID_PROJECT_BRIEF')return copy[lang].brief;
 if(code==='project_rate_limited'||status===429)return copy[lang].rate;
 if(code==='INVALID_REQUEST_ORIGIN')return copy[lang].reload;
 return null;
}
