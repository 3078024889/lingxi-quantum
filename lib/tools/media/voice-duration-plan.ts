export type VoiceDurationPlan={needsFit:boolean;tempo:number;filter:string};
/** Whole-track tempo fit only; never claim lip sync or word alignment.
 * Reject impossible durations and excessive tempo to avoid chopping the voice.
 */
export function planVoiceDurationFit(audioSeconds:number,videoSeconds:number):VoiceDurationPlan{
 if(!Number.isFinite(audioSeconds)||!Number.isFinite(videoSeconds)||
    audioSeconds<=0||videoSeconds<0.3||videoSeconds>7200||audioSeconds>14400)
  throw Error("DUB_DURATION_UNVERIFIED");
 if(audioSeconds<=videoSeconds+0.04)return {needsFit:false,tempo:1,filter:"apad"};
 const target=Math.max(.2,videoSeconds-Math.min(.07,videoSeconds*.01));
 const tempo=audioSeconds/target;
 if(!Number.isFinite(tempo)||tempo<.5||tempo>1.8)throw Error("DUB_AUDIO_TOO_LONG_FOR_VIDEO");
 return {needsFit:true,tempo,filter:"atempo="+tempo.toFixed(6)+",apad"};
}

type VoiceUi={stage:string;tooLong:string;failed:string};
const VOICE_UI:Record<string,VoiceUi>={
 zh:{stage:"正在核对配音与视频的总时长…",tooLong:"配音明显长于视频，无法在保证可听清的情况下适配。此次文件未完成，请调整视频长度后重试。",failed:"配音音轨处理未完成。未生成可下载的成功文件，请稍后重试。"},
 en:{stage:"Checking narration against the video's duration…",tooLong:"The narration is too long for this video to fit at a clear speaking speed. No completed file was produced. Adjust video length and retry.",failed:"The voice track could not be completed. No successful download was produced. Please retry."},
 ja:{stage:"ナレーションと動画の長さを確認しています…",tooLong:"ナレーションが動画より長すぎるため、明瞭な音声で調整できません。動画の長さを調整して再試行してください。",failed:"音声トラックの処理を完了できませんでした。完了ファイルは生成されていません。"},
 ko:{stage:"더빙과 영상 길이를 확인하는 중…",tooLong:"더빙이 영상보다 너무 길어 음질을 유지하며 맞출 수 없습니다. 영상 길이를 조정한 뒤 다시 시도하세요.",failed:"음성 트랙 처리를 완료하지 못했습니다. 완료된 다운로드 파일이 생성되지 않았습니다."},
 fr:{stage:"Vérification de la durée de la voix et de la vidéo…",tooLong:"La narration est trop longue pour être adaptée à cette vidéo sans perdre en clarté. Ajustez la durée de la vidéo puis réessayez.",failed:"La piste audio n'a pas pu être finalisée. Aucun fichier terminé n'a été généré."},
 de:{stage:"Sprecher- und Videolänge werden geprüft…",tooLong:"Die Sprachausgabe ist zu lang, um klar in dieses Video zu passen. Videolänge anpassen und erneut versuchen.",failed:"Die Sprachspur konnte nicht fertiggestellt werden. Keine fertige Datei wurde erzeugt."},
 es:{stage:"Comprobando la duración de la voz y del vídeo…",tooLong:"La narración es demasiado larga para ajustarse sin perder claridad. Ajusta la duración del vídeo y vuelve a intentarlo.",failed:"No se pudo completar la pista de voz. No se generó ningún archivo final."},
 pt:{stage:"Verificando a duração da narração e do vídeo…",tooLong:"A narração é longa demais para caber com clareza neste vídeo. Ajuste a duração do vídeo e tente novamente.",failed:"Não foi possível concluir a faixa de voz. Nenhum arquivo final foi gerado."},
 ar:{stage:"جارٍ التحقق من مدة التعليق الصوتي والفيديو…",tooLong:"التعليق الصوتي أطول من أن يناسب الفيديو بوضوح. عدّل مدة الفيديو ثم أعد المحاولة.",failed:"تعذرت معالجة المسار الصوتي بالكامل. لم يُنشأ ملف نهائي للتنزيل."}
};
export function voiceDurationCopy(locale:string):VoiceUi{return VOICE_UI[locale]||VOICE_UI.en}
export function voiceDurationError(locale:string,cause:unknown):string|null{
 if(!(cause instanceof Error)||!cause.message.startsWith("DUB_"))return null;
 const copy=voiceDurationCopy(locale);
 return cause.message==="DUB_AUDIO_TOO_LONG_FOR_VIDEO"?copy.tooLong:copy.failed;
}
