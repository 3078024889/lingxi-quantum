"use client";

import { useLingxiLang } from "@/lib/lingxi-i18n";
import { usePreferredCurrency, type PreferredCurrency } from "@/components/CurrencyPreferenceProvider";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { lang } = useLingxiLang();
  const { currency, setCurrency } = usePreferredCurrency();
  const zh = lang === "zh";

  if (compact) {
    return (
      <label className="inline-flex items-center gap-1 rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-2.5 py-1.5 text-xs text-[var(--lx-muted)]">
        <span>{currency === "CNY" ? "¥" : "$"}</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as PreferredCurrency)}
          aria-label={zh ? "支付币种" : "Payment currency"}
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
      <label className="lx11-lang-label">{zh ? "支付币种" : "Payment currency"}</label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as PreferredCurrency)}
        className="lx11-lang-select"
      >
        <option value="CNY">CNY ¥ {zh ? "人民币" : "Chinese Yuan"}</option>
        <option value="USD">USD $ {zh ? "美元" : "US Dollar"}</option>
      </select>
      <p className="mt-2 text-[11px] leading-5 text-[var(--lx-faint)]">
        {zh
          ? "不同币种采用独立定价，不按实时汇率换算。"
          : "Prices are set independently for each currency and are not based on live exchange rates."}
      </p>
    </div>
  );
}
