"use client";
type ToolAccessResult={ok:boolean;error?:string;accessKind?:"daily_free"|"pass";alreadyClaimed?:boolean};
export const TOOL_PASS_ENFORCED=process.env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true";
export class ToolAccessError extends Error{constructor(public code:string){super(code);this.name="ToolAccessError";}}
export async function claimToolStart(toolSlug:string,units=1,requestId=crypto.randomUUID()):Promise<ToolAccessResult>{
 if(!TOOL_PASS_ENFORCED)return {ok:true};
 const response=await fetch("/api/tools/access",{
  method:"POST",headers:{"Content-Type":"application/json"},
  credentials:"same-origin",cache:"no-store",
  body:JSON.stringify({toolSlug,units,requestId})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.ok)throw new ToolAccessError(String(data.error||"TOOL_ACCESS_UNAVAILABLE"));
 return data;
}
export const TOOL_ACCESS_MESSAGES:Record<string,Record<string,string>>={
 zh:{LOGIN_REQUIRED:"请先登录后使用免费次数或购买工具通用包。",DAILY_TOOL_FREE_USED:"此工具今天的免费次数已使用完毕。可购买全场通用包继续使用。",TOOL_PASS_REQUIRED:"每个工具每天免费处理一个文件。批量处理请购买通用包。",TOOL_ACCESS_UNAVAILABLE:"暂时无法确认使用权限，请稍后再试。"},
 en:{LOGIN_REQUIRED:"Sign in to use your daily free turn or buy a tools pass.",DAILY_TOOL_FREE_USED:"Today's free use is spent. A tools pass lets you continue.",TOOL_PASS_REQUIRED:"One file per tool is free daily. Buy a pass for batches.",TOOL_ACCESS_UNAVAILABLE:"Access could not be verified. Please try again."},
 ja:{LOGIN_REQUIRED:"ログインしてください。",DAILY_TOOL_FREE_USED:"本日の無料利用は終了しました。",TOOL_PASS_REQUIRED:"一日1ファイル無料です。複数ファイルには共通パスが必要です。",TOOL_ACCESS_UNAVAILABLE:"利用権限を確認できません。"},
 ko:{LOGIN_REQUIRED:"먼저 로그인하세요.",DAILY_TOOL_FREE_USED:"오늘의 무료 이용을 마쳤습니다.",TOOL_PASS_REQUIRED:"하루 한 파일은 무료입니다. 일괄 처리는 이용권이 필요합니다.",TOOL_ACCESS_UNAVAILABLE:"이용 권한을 확인할 수 없습니다."},
 fr:{LOGIN_REQUIRED:"Connectez-vous.",DAILY_TOOL_FREE_USED:"L'utilisation gratuite du jour est épuisée.",TOOL_PASS_REQUIRED:"Un fichier gratuit par jour. Un pass est nécessaire pour le traitement par lot.",TOOL_ACCESS_UNAVAILABLE:"Impossible de vérifier l'accès."},
 de:{LOGIN_REQUIRED:"Bitte anmelden.",DAILY_TOOL_FREE_USED:"Der heutige Gratiszugang ist aufgebraucht.",TOOL_PASS_REQUIRED:"Eine Datei pro Tag kostenlos. Für Stapel benötigen Sie den Pass.",TOOL_ACCESS_UNAVAILABLE:"Zugriff konnte nicht bestätigt werden."},
 es:{LOGIN_REQUIRED:"Inicia sesión.",DAILY_TOOL_FREE_USED:"Se agotó el uso gratuito de hoy.",TOOL_PASS_REQUIRED:"Un archivo gratis al día. Para lotes necesitas el pase.",TOOL_ACCESS_UNAVAILABLE:"No se pudo verificar el acceso."},
 pt:{LOGIN_REQUIRED:"Entre na sua conta.",DAILY_TOOL_FREE_USED:"O uso grátis de hoje acabou.",TOOL_PASS_REQUIRED:"Um arquivo grátis por dia. Lotes exigem o passe.",TOOL_ACCESS_UNAVAILABLE:"Não foi possível verificar o acesso."},
 ar:{LOGIN_REQUIRED:"سجّل الدخول أولاً.",DAILY_TOOL_FREE_USED:"انتهى الاستخدام المجاني لهذا اليوم.",TOOL_PASS_REQUIRED:"ملف واحد مجاناً يومياً. تتطلب الدفعات باقة.",TOOL_ACCESS_UNAVAILABLE:"تعذّر التحقق من صلاحية الاستخدام."}
};
export function toolAccessMessage(lang:string,error:string):string{
 const localized=TOOL_ACCESS_MESSAGES[lang]||TOOL_ACCESS_MESSAGES.en;
 return localized[error]||localized.TOOL_ACCESS_UNAVAILABLE;
}
