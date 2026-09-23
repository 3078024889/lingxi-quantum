"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LINGXIFIELD global error]", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
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
            <h1 style={{ marginTop: 14, fontSize: 28, fontWeight: 650 }}>灵犀场正在重新连接</h1>
            <p style={{ marginTop: 12, lineHeight: 1.8, opacity: .68 }}>
              当前页面加载没有完成。重新加载即可再次进入。
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ marginTop: 22, border: 0, borderRadius: 10, padding: "11px 16px", background: "#171717", color: "#fff", cursor: "pointer" }}
            >
              重新加载
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
