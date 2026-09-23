"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LINGXIFIELD route error]", error);
  }, [error]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "#f7f7f5",
      color: "#171717",
      fontFamily: "Inter, 'Noto Sans SC', sans-serif",
    }}>
      <section style={{ width: "min(560px, 100%)", textAlign: "center" }}>
        <p style={{ fontSize: 12, letterSpacing: ".12em", opacity: .55 }}>LINGXIFIELD</p>
        <h1 style={{ marginTop: 14, fontSize: 28, fontWeight: 650 }}>页面暂时没有完成加载</h1>
        <p style={{ marginTop: 12, lineHeight: 1.8, opacity: .68 }}>
          可以重新加载当前页面；你的账户与已保存内容不会因此丢失。
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{ border: 0, borderRadius: 10, padding: "11px 16px", background: "#171717", color: "#fff", cursor: "pointer" }}
          >
            重新加载
          </button>
          <a
            href="/account"
            style={{ border: "1px solid #d8d8d4", borderRadius: 10, padding: "10px 16px", color: "#171717", textDecoration: "none" }}
          >
            我的账户
          </a>
        </div>
      </section>
    </main>
  );
}
