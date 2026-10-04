"use client";

import { useId } from "react";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { usePreferredCurrency, type PreferredCurrency } from "@/components/CurrencyPreferenceProvider";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { lang } = useLingxiLang();
  const { currency, setCurrency } = usePreferredCurrency();
  const id = useId();
  const labels = {
    zh: ["支付币种", "人民币", "美元"],
    en: ["Payment currency", "Chinese yuan", "US dollar"],
    ja: ["支払い通貨", "人民元", "米ドル"],
    ko: ["결제 통화", "위안", "미국 달러"],
    fr: ["Devise de paiement", "Yuan chinois", "Dollar américain"],
    de: ["Zahlungswährung", "Chinesischer Yuan", "US-Dollar"],
    es: ["Moneda de pago", "Yuan chino", "Dólar estadounidense"],
    pt: ["Moeda de pagamento", "Yuan chinês", "Dólar americano"],
    ar: ["عملة الدفع", "يوان صيني", "دولار أمريكي"],
  };
  const [label, cny, usd] = labels[lang] ?? labels.en;

  if (compact) {
    return (
      <label className="inline-flex items-center gap-1 rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-2.5 py-1.5 text-xs text-[var(--lx-muted)]">
        <span>{currency === "CNY" ? "¥" : "$"}</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as PreferredCurrency)}
          aria-label={label}
          className="bg-transparent text-[var(--lx-ink)] outline-none"
        >
          <option value="CNY">CNY</option>
          <option value="USD">USD</option>
        </select>
      </label>
    );
  }

  return (
    <div className="mt-3">
      <label htmlFor={id} className="lx11-lang-label">{label}</label>
      <select
        id={id}
        value={currency}
        onChange={(e) => setCurrency(e.target.value as PreferredCurrency)}
        className="lx11-lang-select"
      >
        <option value="CNY">CNY ¥ {cny}</option>
        <option value="USD">USD $ {usd}</option>
      </select>
    </div>
  );
}
