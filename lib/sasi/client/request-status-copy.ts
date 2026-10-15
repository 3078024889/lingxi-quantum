import type {LingxiLang} from '@/lib/lingxi-i18n';
const COPY={
 zh:{cancel:'取消等待',cancelled:'已停止等待，原问题已保留，可以重试。',failed:'这次没有收到完整回答。请检查网络后重试，原问题已保留。'},
 en:{cancel:'Stop waiting',cancelled:'Stopped waiting. Your question is preserved and can be retried.',failed:'No complete answer arrived. Check your connection and retry; your question is preserved.'},
 ja:{cancel:'待機を中止',cancelled:'待機を中止しました。質問は保存されています。再試行できます。',failed:'完全な回答を受信できませんでした。接続を確認して再試行してください。質問は保存されています。'},
 ko:{cancel:'대기 중지',cancelled:'대기를 중지했습니다. 질문은 유지되며 다시 시도할 수 있습니다.',failed:'완전한 답변을 받지 못했습니다. 연결을 확인하고 다시 시도하세요. 질문은 유지됩니다.'},
 fr:{cancel:'Arrêter l’attente',cancelled:'Attente arrêtée. Votre question est conservée ; vous pouvez réessayer.',failed:'Aucune réponse complète reçue. Vérifiez la connexion et réessayez ; votre question est conservée.'},
 de:{cancel:'Warten beenden',cancelled:'Warten beendet. Ihre Frage bleibt erhalten und kann erneut gesendet werden.',failed:'Keine vollständige Antwort erhalten. Verbindung prüfen und erneut versuchen. Ihre Frage bleibt erhalten.'},
 es:{cancel:'Dejar de esperar',cancelled:'Espera detenida. Tu pregunta se conserva y puedes reintentar.',failed:'No llegó una respuesta completa. Comprueba la conexión y reintenta; tu pregunta se conserva.'},
 pt:{cancel:'Parar de esperar',cancelled:'Espera interrompida. Sua pergunta foi preservada e você pode tentar novamente.',failed:'Nenhuma resposta completa chegou. Verifique a conexão e tente novamente; sua pergunta foi preservada.'},
 ar:{cancel:'إيقاف الانتظار',cancelled:'تم إيقاف الانتظار. تم الاحتفاظ بسؤالك ويمكنك إعادة المحاولة.',failed:'لم يصل جواب كامل. تحقق من الاتصال وأعد المحاولة؛ تم الاحتفاظ بسؤالك.'},
};
export function requestStatusCopy(lang:LingxiLang){return COPY[lang]??COPY.en}
