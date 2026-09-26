"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type PreferredCurrency = "CNY" | "USD";

type CurrencyContextValue = {
  currency: PreferredCurrency;
  ready: boolean;
  setCurrency: (currency: PreferredCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE = "lingxifield:preferred-currency";

function parse(value: unknown): PreferredCurrency | null {
  return value === "CNY" || value === "USD" ? value : null;
}

export default function CurrencyPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<PreferredCurrency>("USD");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const local = (() => {
      try { return parse(localStorage.getItem(STORAGE)); } catch { return null; }
    })();

    void fetch("/api/preferences/currency", { cache: "no-store" })
      .then(async (r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!active) return;
        const account = parse(data?.accountCurrency);
        const cookie = parse(data?.cookieCurrency);
        const recommended = parse(data?.recommendedCurrency);
        const resolved = account || local || cookie || recommended || "USD";
        setCurrencyState(resolved);
        try { localStorage.setItem(STORAGE, resolved); } catch {}
      })
      .catch(() => {
        if (!active) return;
        setCurrencyState(local || "USD");
      })
      .finally(() => { if (active) setReady(true); });

    return () => { active = false; };
  }, []);

  const setCurrency = useCallback((next: PreferredCurrency) => {
    setCurrencyState(next);
    setReady(true);
    try { localStorage.setItem(STORAGE, next); } catch {}

    void fetch("/api/preferences/currency", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currency: next }),
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent("lingxi:currency", { detail: { currency: next } }));
  }, []);

  const value = useMemo(
    () => ({ currency, ready, setCurrency }),
    [currency, ready, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function usePreferredCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("CurrencyPreferenceProvider is missing");
  return value;
}
