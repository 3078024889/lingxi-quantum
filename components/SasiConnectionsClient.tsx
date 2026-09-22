"use client";

import { useEffect, useState } from "react";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import ConnectionCenter from "@/app/sasi/ConnectionCenter";

export default function SasiConnectionsClient({ accountEmail }: { accountEmail: string | null }) {
  const { lang } = useLingxiLang();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="lx11-page">
      <div className="lx11-wrap">
        <ConnectionCenter lang={lang === "zh" ? "zh" : "en"} dark={dark} accountEmail={accountEmail} />
      </div>
    </main>
  );
}
