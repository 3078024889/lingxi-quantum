"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {type LingxiLang,useLingxiLang} from "@/lib/lingxi-i18n";

type HelpCopy={
  title:string;intro:string;noAccount:string;official:string;availability:string;
  alternative:string;otherMethods:string;mainland:string;global:string;
};

const COPY:Record<LingxiLang,HelpCopy>={
  zh:{title:"使用 PayPal 付款",intro:"灵犀场支持多种支付方式，PayPal 只是其中一种。",noAccount:"如果你选择 PayPal 付款但还没有账户，可前往 PayPal 官方网站注册个人账户，注册完成后返回灵犀场继续付款。",official:"PayPal 官方网站",availability:"注册及可用支付方式以 PayPal 在你所在国家或地区提供的服务为准。",alternative:"不想使用 PayPal？返回支付页面即可选择灵犀场提供的其他可用支付方式。",otherMethods:"查看其他支付方式",mainland:"中国大陆用户",global:"其他国家或地区用户"},
  en:{title:"Pay with PayPal",intro:"LINGXIFIELD supports multiple payment methods. PayPal is only one of the available options.",noAccount:"If you choose PayPal but do not yet have an account, you can create a personal PayPal account on the official PayPal website, then return to LINGXIFIELD to complete your payment.",official:"PayPal official website",availability:"Available registration and payment options depend on the services PayPal provides in your country or region.",alternative:"Prefer another payment method? Return to the payment page and choose another available option.",otherMethods:"View other payment methods",mainland:"Mainland China",global:"Other countries or regions"},
  ja:{title:"PayPalで支払う",intro:"LINGXIFIELDでは複数のお支払い方法をご利用いただけます。PayPalはそのうちの一つです。",noAccount:"PayPalでのお支払いを選択し、まだアカウントをお持ちでない場合は、PayPal公式サイトから個人アカウントを作成できます。登録後、LINGXIFIELDに戻ってお支払いを続けてください。",official:"PayPal公式サイト",availability:"登録方法および利用可能なお支払い方法は、お住まいの国・地域でPayPalが提供するサービスにより異なります。",alternative:"PayPalを利用しない場合は、お支払いページに戻り、他の利用可能なお支払い方法をお選びください。",otherMethods:"その他のお支払い方法",mainland:"中国本土",global:"その他の国・地域"},
  ko:{title:"PayPal로 결제",intro:"LINGXIFIELD는 다양한 결제 수단을 지원하며, PayPal은 그중 하나입니다.",noAccount:"PayPal 결제를 선택했지만 아직 계정이 없다면 PayPal 공식 웹사이트에서 개인 계정을 만든 후 LINGXIFIELD로 돌아와 결제를 계속할 수 있습니다.",official:"PayPal 공식 웹사이트",availability:"가입 및 사용 가능한 결제 방식은 국가 또는 지역별 PayPal 서비스에 따라 달라질 수 있습니다.",alternative:"PayPal을 사용하지 않으려면 결제 페이지로 돌아가 다른 사용 가능한 결제 수단을 선택하세요.",otherMethods:"다른 결제 수단 보기",mainland:"중국 본토",global:"기타 국가 또는 지역"},
  fr:{title:"Payer avec PayPal",intro:"LINGXIFIELD propose plusieurs moyens de paiement. PayPal n'est que l'une des options disponibles.",noAccount:"Si vous choisissez PayPal et que vous ne possédez pas encore de compte, vous pouvez créer un compte personnel sur le site officiel de PayPal, puis revenir sur LINGXIFIELD pour terminer votre paiement.",official:"Site officiel de PayPal",availability:"Les possibilités d'inscription et de paiement dépendent des services PayPal disponibles dans votre pays ou région.",alternative:"Vous préférez un autre moyen de paiement ? Revenez à la page de paiement et choisissez une autre option disponible.",otherMethods:"Voir les autres moyens de paiement",mainland:"Chine continentale",global:"Autres pays ou régions"},
  de:{title:"Mit PayPal bezahlen",intro:"LINGXIFIELD unterstützt mehrere Zahlungsmethoden. PayPal ist nur eine der verfügbaren Optionen.",noAccount:"Wenn Sie PayPal verwenden möchten, aber noch kein Konto besitzen, können Sie auf der offiziellen PayPal-Website ein persönliches Konto erstellen und anschließend zu LINGXIFIELD zurückkehren, um die Zahlung abzuschließen.",official:"Offizielle PayPal-Website",availability:"Registrierung und verfügbare Zahlungsmöglichkeiten richten sich nach den PayPal-Diensten in Ihrem Land oder Ihrer Region.",alternative:"Sie möchten PayPal nicht verwenden? Kehren Sie zur Zahlungsseite zurück und wählen Sie eine andere verfügbare Zahlungsmethode.",otherMethods:"Andere Zahlungsmethoden anzeigen",mainland:"Festlandchina",global:"Andere Länder oder Regionen"},
  es:{title:"Pagar con PayPal",intro:"LINGXIFIELD admite varios métodos de pago. PayPal es solo una de las opciones disponibles.",noAccount:"Si eliges PayPal y todavía no tienes una cuenta, puedes crear una cuenta personal desde el sitio web oficial de PayPal y luego volver a LINGXIFIELD para completar el pago.",official:"Sitio web oficial de PayPal",availability:"Las opciones de registro y pago disponibles dependen de los servicios que PayPal ofrezca en tu país o región.",alternative:"¿Prefieres otro método de pago? Vuelve a la página de pago y selecciona otra opción disponible.",otherMethods:"Ver otros métodos de pago",mainland:"China continental",global:"Otros países o regiones"},
  pt:{title:"Pagar com PayPal",intro:"A LINGXIFIELD oferece várias formas de pagamento. O PayPal é apenas uma das opções disponíveis.",noAccount:"Se escolher pagar com PayPal e ainda não tiver uma conta, poderá criar uma conta pessoal no site oficial do PayPal e depois regressar à LINGXIFIELD para concluir o pagamento.",official:"Site oficial do PayPal",availability:"As opções de registo e pagamento disponíveis dependem dos serviços oferecidos pelo PayPal no seu país ou região.",alternative:"Prefere outro método de pagamento? Volte à página de pagamento e escolha outra opção disponível.",otherMethods:"Ver outros métodos de pagamento",mainland:"China continental",global:"Outros países ou regiões"},
  ar:{title:"الدفع عبر PayPal",intro:"تدعم LINGXIFIELD عدة طرق للدفع، وPayPal هو مجرد أحد الخيارات المتاحة.",noAccount:"إذا اخترت الدفع عبر PayPal ولم يكن لديك حساب بعد، يمكنك إنشاء حساب شخصي من خلال الموقع الرسمي لـ PayPal، ثم العودة إلى LINGXIFIELD لإكمال عملية الدفع.",official:"الموقع الرسمي لـ PayPal",availability:"تعتمد خيارات التسجيل والدفع المتاحة على الخدمات التي يوفرها PayPal في بلدك أو منطقتك.",alternative:"إذا كنت تفضل عدم استخدام PayPal، يمكنك العودة إلى صفحة الدفع واختيار إحدى طرق الدفع الأخرى المتاحة.",otherMethods:"عرض طرق دفع أخرى",mainland:"برّ الصين الرئيسي",global:"بلدان أو مناطق أخرى"},
};

function isMainlandChineseBrowser(){
  if(typeof navigator==="undefined")return false;
  const locales=[navigator.language,...(navigator.languages||[])].map(x=>String(x).toLowerCase());
  return locales.some(x=>x==="zh-cn"||x.startsWith("zh-cn-"));
}

export default function PaypalHelp({compact=false}:{compact?:boolean}){
  const{lang}=useLingxiLang();
  const[mainlandCn,setMainlandCn]=useState(false);
  useEffect(()=>setMainlandCn(isMainlandChineseBrowser()),[]);
  const c=COPY[lang];

  return <section className={`rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] ${compact?"p-5":"p-6"}`} dir={lang==="ar"?"rtl":"ltr"}>
    <h2 className="text-lg font-semibold text-[var(--lx-ink)]">{c.title}</h2>
    <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{c.intro}</p>
    <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{c.noAccount}</p>

    {lang==="zh"?(
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a href="https://www.paypal.com/c2/webapps/mpp/account-selection?locale.x=zh_CN" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm text-[var(--lx-ink)] hover:border-[var(--lx-line-strong)]">
          <span className="block text-xs text-[var(--lx-faint)]">{c.mainland}</span><b className="mt-1 block">PayPal China ↗</b>
        </a>
        <a href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm text-[var(--lx-ink)] hover:border-[var(--lx-line-strong)]">
          <span className="block text-xs text-[var(--lx-faint)]">{c.global}</span><b className="mt-1 block">PayPal.com ↗</b>
        </a>
      </div>
    ):(
      <a href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm font-medium text-[var(--lx-ink)] hover:border-[var(--lx-line-strong)]">{c.official} ↗</a>
    )}

    {lang==="zh"&&mainlandCn&&<p className="mt-3 text-xs text-[var(--lx-faint)]">已根据当前浏览器语言环境优先显示中国大陆注册入口。</p>}
    <p className="mt-4 text-xs leading-6 text-[var(--lx-faint)]">{c.availability}</p>
    <div className="mt-4 border-t border-[var(--lx-line)] pt-4">
      <p className="text-sm leading-7 text-[var(--lx-muted)]">{c.alternative}</p>
      <Link href="/ai-wallet" className="mt-2 inline-flex text-sm font-medium text-[var(--lx-ink)] underline underline-offset-4">{c.otherMethods} →</Link>
    </div>
  </section>;
}
