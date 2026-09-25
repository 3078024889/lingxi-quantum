import type {LingxiLang} from "@/lib/lingxi-i18n";

type Multi=Record<LingxiLang,string>;
const row=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Multi=>({zh,en,ja,ko,fr,de,es,pt,ar});

const CORE:Record<string,Multi>={
 "未连接":row("未连接","Not connected","未接続","연결 안 됨","Non connecté","Nicht verbunden","No conectado","Não conectado","غير متصل"),
 "验证成功":row("验证成功","Verified","検証済み","확인됨","Vérifié","Verifiziert","Verificado","Verificado","تم التحقق"),
 "正在验证":row("正在验证","Checking","確認中","확인 중","Vérification","Prüfung","Verificando","Verificando","جارٍ التحقق"),
 "验证失败":row("验证失败","Failed","検証失敗","확인 실패","Échec","Fehlgeschlagen","Falló","Falhou","فشل التحقق"),
 "已安全保存 · 待验证":row("已安全保存 · 待验证","Stored · verify next","安全に保存済み · 要検証","안전하게 저장됨 · 확인 필요","Enregistré · à vérifier","Gespeichert · prüfen","Guardado · verificar","Salvo · verificar","محفوظ بأمان · يحتاج تحقق"),
 "官方入口":row("官方入口","Official setup","公式入口","공식 설정","Configuration officielle","Offizielles Setup","Configuración oficial","Configuração oficial","الإعداد الرسمي"),
 "官方文档":row("官方文档","Official docs","公式ドキュメント","공식 문서","Documentation officielle","Offizielle Doku","Documentación oficial","Documentação oficial","الوثائق الرسمية"),
 "管理连接":row("管理连接","Manage","接続を管理","연결 관리","Gérer","Verwalten","Administrar","Gerenciar","إدارة الاتصال"),
 "接入指引":row("接入指引","Setup guide","接続ガイド","연결 가이드","Guide de connexion","Einrichtungsanleitung","Guía de conexión","Guia de conexão","دليل الربط"),
 "连接设置":row("连接设置","Connection setup","接続設定","연결 설정","Configuration","Verbindung einrichten","Configuración de conexión","Configuração da conexão","إعداد الاتصال"),
 "当前连接":row("当前连接","Current connection","現在の接続","현재 연결","Connexion actuelle","Aktuelle Verbindung","Conexión actual","Conexão atual","الاتصال الحالي"),
 "粘贴 API Key":row("粘贴 API Key","Paste API key","API Key を貼り付け","API Key 붙여넣기","Coller la clé API","API-Key einfügen","Pegar API Key","Colar API Key","ألصق مفتاح API"),
 "正在保存…":row("正在保存…","Saving…","保存中…","저장 중…","Enregistrement…","Speichern…","Guardando…","Salvando…","جارٍ الحفظ…"),
 "保存并连接":row("保存并连接","Save & connect","保存して接続","저장 후 연결","Enregistrer et connecter","Speichern & verbinden","Guardar y conectar","Salvar e conectar","حفظ وربط"),
 "正在验证…":row("正在验证…","Testing…","検証中…","확인 중…","Test…","Test läuft…","Probando…","Testando…","جارٍ الاختبار…"),
 "验证连接":row("验证连接","Test connection","接続を検証","연결 확인","Tester la connexion","Verbindung testen","Probar conexión","Testar conexão","اختبار الاتصال"),
 "正在删除…":row("正在删除…","Deleting…","削除中…","삭제 중…","Suppression…","Löschen…","Eliminando…","Excluindo…","جارٍ الحذف…"),
 "撤销并删除":row("撤销并删除","Revoke & delete","取り消して削除","해제 후 삭제","Révoquer et supprimer","Widerrufen & löschen","Revocar y eliminar","Revogar e excluir","إلغاء وحذف"),
 "模型与 API":row("模型与 API","Models & API","モデルと API","모델 및 API","Modèles & API","Modelle & API","Modelos y API","Modelos e API","النماذج وواجهات API"),
 "项连接已验证":row("项连接已验证","verified connections","件の接続を検証済み","개 연결 확인됨","connexions vérifiées","verifizierte Verbindungen","conexiones verificadas","conexões verificadas","اتصالات تم التحقق منها"),
 "未验证的连接暂不可使用":row("未验证的连接暂不可使用","Unverified connections cannot be used yet","未検証の接続はまだ使用できません","확인되지 않은 연결은 아직 사용할 수 없습니다","Les connexions non vérifiées restent indisponibles","Nicht verifizierte Verbindungen sind noch nicht nutzbar","Las conexiones no verificadas aún no se pueden usar","Conexões não verificadas ainda não podem ser usadas","لا يمكن استخدام الاتصالات غير المتحقق منها بعد"),
 "能力连接分类":row("能力连接分类","Connection categories","接続カテゴリ","연결 카테고리","Catégories de connexion","Verbindungskategorien","Categorías de conexión","Categorias de conexão","فئات الاتصال"),
 "文本与推理能力":row("文本与推理能力","Text & reasoning","テキストと推論","텍스트 및 추론","Texte & raisonnement","Text & Schlussfolgern","Texto y razonamiento","Texto e raciocínio","النص والاستدلال"),
 "图像与视频能力":row("图像与视频能力","Image & video","画像と動画","이미지 및 영상","Image & vidéo","Bild & Video","Imagen y vídeo","Imagem e vídeo","الصور والفيديو"),
 "打开官方创建页":row("打开官方创建页","Open official setup","公式設定を開く","공식 설정 열기","Ouvrir la configuration officielle","Offizielles Setup öffnen","Abrir configuración oficial","Abrir configuração oficial","فتح الإعداد الرسمي"),
 "阅读官方文档":row("阅读官方文档","Read official docs","公式ドキュメントを読む","공식 문서 보기","Lire la documentation officielle","Offizielle Doku lesen","Leer documentación oficial","Ler documentação oficial","قراءة الوثائق الرسمية"),
 "最近验证":row("最近验证","Last verified","最終検証","최근 확인","Dernière vérification","Zuletzt verifiziert","Última verificación","Última verificação","آخر تحقق"),
 "凭证已删除。":row("凭证已删除。","Credential deleted.","認証情報を削除しました。","자격 증명이 삭제되었습니다.","Identifiant supprimé.","Zugangsdaten gelöscht.","Credencial eliminada.","Credencial excluída.","تم حذف بيانات الاعتماد."),
};

export function sasiConnectionText(lang:LingxiLang,zh:string,en:string){
 return CORE[zh]?.[lang] || (lang==="zh"?zh:en);
}
