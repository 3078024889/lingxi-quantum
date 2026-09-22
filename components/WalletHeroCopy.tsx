"use client";

import LxText from "@/components/LxText";

export default function WalletHeroCopy() {
  return (
    <>
      <p className="lx11-kicker">
        <LxText
          zh="AI 余额"
          en="AI Balance"
          ja="AI 残高"
          ko="AI 잔액"
          fr="Solde IA"
          de="KI-Guthaben"
          es="Saldo IA"
          pt="Saldo IA"
          ar="رصيد الذكاء الاصطناعي"
        />
      </p>
      <h1 className="lx11-title">
        <LxText
          zh="让余额留在这里，等你真正需要时再流动。"
          en="Let your balance stay here until you truly need it."
          ja="本当に必要になるまで、残高はここに置いておけます。"
          ko="정말 필요할 때까지 잔액은 여기 그대로 둘 수 있습니다."
          fr="Gardez votre solde ici jusqu’au moment où vous en avez vraiment besoin."
          de="Lassen Sie Ihr Guthaben hier, bis Sie es wirklich brauchen."
          es="Deja tu saldo aquí hasta que realmente lo necesites."
          pt="Deixe seu saldo aqui até realmente precisar dele."
          ar="اترك رصيدك هنا حتى تحتاجه فعلًا."
        />
      </h1>
      <p className="lx11-lead">
        <LxText
          zh="不绑定会员，不制造“快过期”的压力。创作、研究与需要 AI 的工具，共用同一个余额入口。"
          en="No membership lock-in and no artificial expiry pressure. Creation, research and AI-powered tools share one balance."
          ja="会員縛りも、期限切れを急かす仕組みもありません。制作・研究・AI ツールで同じ残高を使います。"
          ko="멤버십에 묶이지 않고 만료 압박도 없습니다. 제작·연구·AI 도구가 하나의 잔액을 공유합니다."
          fr="Aucun abonnement imposé ni pression d’expiration. Création, recherche et outils IA partagent un même solde."
          de="Keine Mitgliedschaftsbindung und kein künstlicher Ablaufdruck. Erstellung, Forschung und KI-Werkzeuge teilen ein Guthaben."
          es="Sin membresía obligatoria ni presión artificial por caducidad. Creación, investigación y herramientas de IA comparten un mismo saldo."
          pt="Sem assinatura obrigatória nem pressão artificial de expiração. Criação, pesquisa e ferramentas de IA usam o mesmo saldo."
          ar="لا عضوية إلزامية ولا ضغط انتهاء مصطنع. الإنشاء والبحث وأدوات الذكاء الاصطناعي تشترك في رصيد واحد."
        />
      </p>
    </>
  );
}
