"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { accountText } from "@/lib/account-experience-i18n";

export default function AccountProfileCard({ email, initialName }: { email: string; initialName: string }) {
  const { lang } = useLingxiLang();
  const t = (key: string) => accountText(lang, key);
  const [name, setName] = useState(initialName || "");
  const [saved, setSaved] = useState(initialName || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const next = initialName || "";
    setName(next);
    setSaved(next);
  }, [initialName]);

  const initials = useMemo(() => {
    const source = (saved || email.split("@")[0] || "L").trim();
    return Array.from(source).slice(0, 2).join("").toUpperCase();
  }, [saved, email]);

  async function save() {
    const next = name.trim();
    if (next.length < 2 || next.length > 24) {
      setMsg(t("nameInvalid"));
      return;
    }
    if (busy || next === saved) return;
    setBusy(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { display_name: next } });
      if (error) throw error;
      setSaved(next);
      setName(next);
      setMsg(t("saved"));
      window.dispatchEvent(new CustomEvent("lingxi:profile", { detail: { display_name: next } }));
    } catch (error) {
      setMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="lx-account-profile">
      <div className="lx-account-avatar" aria-hidden="true"><span>✦</span><b>{initials}</b></div>
      <div className="lx-account-profile-copy">
        <small>{t("profile")}</small>
        <h2>{saved}</h2>
        <p>{email}</p>
        <div className="lx-account-name-edit">
          <input value={name} onChange={event => setName(event.target.value)} maxLength={24}
            autoComplete="nickname" aria-label={t("displayName")} />
          <button className="lx-account-save-button" type="button" onClick={save} disabled={busy || name.trim() === saved}
            aria-label={t("save")} title={t("save")}>
            {busy ? t("saving") : t("save")}
          </button>
        </div>
        <em>{t("displayNameHint")}</em>
        {msg && <strong role="status" aria-live="polite">{msg}</strong>}
      </div>
    </section>
  );
}
