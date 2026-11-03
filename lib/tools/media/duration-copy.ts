/** Paid video operations never quote an unmeasured media duration. */
const copy={
 zh:{loading:"正在读取视频真实时长，确认后显示价格。",invalid:"无法读取视频时长，请更换可播放的视频文件；不会按默认一分钟收费。"},
 en:{loading:"Reading the actual video duration before pricing…",invalid:"Unable to read the video duration. Choose a playable video; no one-minute estimate will be billed."},
 ja:{loading:"料金表示前に動画の実際の長さを確認しています…",invalid:"動画の長さを確認できません。再生可能な動画を選択してください。仮の1分料金では請求しません。"},
 ko:{loading:"요금을 표시하기 전에 실제 동영상 길이를 확인하고 있습니다…",invalid:"동영상 길이를 확인할 수 없습니다. 재생 가능한 파일을 선택하세요. 임의의 1분 요금은 청구하지 않습니다."},
 fr:{loading:"Vérification de la durée réelle de la vidéo avant tarification…",invalid:"Durée vidéo introuvable. Choisissez une vidéo lisible ; aucune minute estimée ne sera facturée."},
 de:{loading:"Die tatsächliche Videodauer wird vor der Preisberechnung geprüft…",invalid:"Videodauer nicht lesbar. Wählen Sie ein abspielbares Video; keine pauschale Minute wird berechnet."},
 es:{loading:"Comprobando la duración real del vídeo antes de calcular el precio…",invalid:"No se puede leer la duración. Elige un vídeo reproducible; no se cobrará un minuto estimado."},
 pt:{loading:"A verificar a duração real do vídeo antes de calcular o preço…",invalid:"Não foi possível ler a duração. Escolha um vídeo reproduzível; não será cobrado um minuto estimado."},
 ar:{loading:"جارٍ التحقق من المدة الفعلية للفيديو قبل عرض السعر…",invalid:"تعذّر قراءة مدة الفيديو. اختر فيديو قابلاً للتشغيل؛ لن يتم احتساب دقيقة افتراضية."}
} as const;
export type MediaDurationLang=keyof typeof copy;
export function mediaDurationCopy(lang:string,key:"loading"|"invalid"):string{
 return copy[(lang in copy?lang:"en") as MediaDurationLang][key];
}
