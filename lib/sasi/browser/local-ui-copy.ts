import type {LingxiLang} from "@/lib/lingxi-i18n";

type LocalCopy={title:string;lead:string;enable:string;ready:string;preparing:string};
export const SASI_LOCAL_COPY:Record<LingxiLang,LocalCopy>={
 zh:{title:"在此设备使用",lead:"启用后，部分日常对话可以直接在这台设备完成。首次准备可能需要一些时间。",enable:"启用",ready:"已可在此设备使用",preparing:"正在准备"},
 en:{title:"Use on this device",lead:"After enabling, some everyday conversations can be completed directly on this device. First-time preparation may take a while.",enable:"Enable",ready:"Ready on this device",preparing:"Preparing"},
 ja:{title:"この端末で使用",lead:"有効にすると、一部の日常会話をこの端末内で処理できます。初回準備には時間がかかる場合があります。",enable:"有効にする",ready:"この端末で利用できます",preparing:"準備中"},
 ko:{title:"이 기기에서 사용",lead:"사용 설정 후 일부 일상 대화를 이 기기에서 바로 처리할 수 있습니다. 처음 준비에는 시간이 걸릴 수 있습니다.",enable:"사용",ready:"이 기기에서 사용할 수 있음",preparing:"준비 중"},
 fr:{title:"Utiliser sur cet appareil",lead:"Une fois activé, certaines conversations courantes peuvent être traitées directement sur cet appareil. La première préparation peut prendre un peu de temps.",enable:"Activer",ready:"Prêt sur cet appareil",preparing:"Préparation"},
 de:{title:"Auf diesem Gerät verwenden",lead:"Nach der Aktivierung können einige alltägliche Unterhaltungen direkt auf diesem Gerät verarbeitet werden. Die erste Vorbereitung kann etwas dauern.",enable:"Aktivieren",ready:"Auf diesem Gerät bereit",preparing:"Wird vorbereitet"},
 es:{title:"Usar en este dispositivo",lead:"Al activarlo, algunas conversaciones cotidianas pueden procesarse directamente en este dispositivo. La preparación inicial puede tardar un poco.",enable:"Activar",ready:"Listo en este dispositivo",preparing:"Preparando"},
 pt:{title:"Usar neste dispositivo",lead:"Depois de ativar, algumas conversas do dia a dia podem ser processadas diretamente neste dispositivo. A preparação inicial pode levar algum tempo.",enable:"Ativar",ready:"Pronto neste dispositivo",preparing:"Preparando"},
 ar:{title:"الاستخدام على هذا الجهاز",lead:"بعد التفعيل يمكن إنجاز بعض المحادثات اليومية مباشرة على هذا الجهاز. قد يستغرق الإعداد الأول بعض الوقت.",enable:"تفعيل",ready:"جاهز على هذا الجهاز",preparing:"جارٍ الإعداد"}
};
