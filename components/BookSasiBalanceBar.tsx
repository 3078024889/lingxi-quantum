"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Record<LingxiLang, string>;
const c = (
  zh: string,
  en: string,
  ja: string,
  ko: string,
  fr: string,
  de: string,
  es: string,
  pt: string,
  ar: string
): Copy => ({ zh, en, ja, ko, fr, de, es, pt, ar });

const COPY = {
  title: c(
    "书本 SASI 使用真实 AI 余额",
    "Book SASI uses your real AI balance",
    "Book SASI は実際の AI 残高を使用します",
    "Book SASI는 실제 AI 잔액을 사용합니다",
    "Book SASI utilise votre solde IA réel",
    "Book SASI verwendet Ihr echtes KI-Guthaben",
    "Book SASI usa tu saldo real de IA",
    "O Book SASI usa seu saldo real de IA",
    "يستخدم Book SASI رصيد الذكاء الاصطناعي الحقيقي"
  ),
  current: c(
    "当前余额",
    "Current balance",
    "現在の残高",
    "현재 잔액",
    "Solde actuel",
    "Aktuelles Guthaben",
    "Saldo actual",
    "Saldo atual",
    "الرصيد الحالي"
  ),
  topup: c(
    "充值 AI 余额",
    "Top up AI balance",
    "AI 残高をチャージ",
    "AI 잔액 충전",
    "Recharger le solde IA",
    "KI-Guthaben aufladen",
    "Recargar saldo IA",
    "Recarregar saldo IA",
    "شحن رصيد الذكاء الاصطناعي"
  ),
  usage: c(
    "提问时按真实模型用量结算；未使用余额继续保留。",
    "Questions are charged by actual model usage; unused balance remains available.",
    "質問は実際のモデル使用量に応じて精算され、未使用残高はそのまま保持されます。",
    "질문은 실제 모델 사용량에 따라 결제되며 사용하지 않은 잔액은 그대로 유지됩니다.",
    "Les questions sont facturées selon l’usage réel du modèle ; le solde non utilisé reste disponible.",
    "Fragen werden nach tatsächlicher Modellnutzung abgerechnet; ungenutztes Guthaben bleibt erhalten.",
    "Las preguntas se cobran según el uso real del modelo; el saldo no utilizado se conserva.",
    "As perguntas são cobradas pelo uso real do modelo; o saldo não utilizado permanece disponível.",
    "تُحاسب الأسئلة حسب الاستخدام الفعلي للنموذج، ويظل الرصيد غير المستخدم متاحًا."
  ),
  login: c(
    "登录后可查看余额并使用书本 SASI。",
    "Sign in to view your balance and use Book SASI.",
    "ログインすると残高を確認し、Book SASI を利用できます。",
    "로그인하면 잔액을 확인하고 Book SASI를 사용할 수 있습니다.",
    "Connectez-vous pour voir votre solde et utiliser Book SASI.",
    "Melden Sie sich an, um Ihr Guthaben zu sehen und Book SASI zu nutzen.",
    "Inicia sesión para ver tu saldo y usar Book SASI.",
    "Entre para ver seu saldo e usar o Book SASI.",
    "سجّل الدخول لعرض رصيدك واستخدام Book SASI."
  ),
};

export default function BookSasiBalanceBar() {
  const { lang } = useLingxiLang();
  const t = (key: keyof typeof COPY) => COPY[key][lang] ?? COPY[key].en;
  const [balance, setBalance] = useState<number | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    fetch("/api/ai/wallet", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          setLoginRequired(true);
          return null;
        }
        const data = await response.json();
        if (!response.ok) return null;
        return Number(data.balanceRmb ?? 0);
      })
      .then((value) => {
        if (typeof value === "number" && Number.isFinite(value)) setBalance(value);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-950">{t("title")}</p>
          {loginRequired ? (
            <p className="mt-2 text-sm text-emerald-900/75">{t("login")}</p>
          ) : (
            <p className="mt-2 text-sm text-emerald-900/75">
              {t("current")}：
              <b className="ml-1 text-lg text-emerald-950">
                {balance == null ? "…" : `¥${balance.toFixed(2)}`}
              </b>
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-emerald-900/70">{t("usage")}</p>
        </div>
        <Link
          href="/ai-wallet"
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          {t("topup")} →
        </Link>
      </div>
    </section>
  );
}
