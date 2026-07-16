"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Bi from "@/components/Bi";

// 之前账户页完全没有"修改密码"这个功能——用户已经登录、身份已经确认，
// 不需要走"忘记密码→发邮件→点链接"那一整套流程，直接调 Supabase 的
// updateUser 就能改，比走邮箱验证快很多，这里做成一个可以展开的小表单。
export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (pw.length < 6) {
      setError("新密码至少需要6位。");
      return;
    }
    if (pw !== pw2) {
      setError("两次输入的新密码不一致。");
      return;
    }
    setStatus("saving");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    if (err) {
      setStatus("error");
      setError(err.message || "修改失败，请稍后再试。");
      return;
    }
    setStatus("done");
    setPw("");
    setPw2("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-white/15 py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim transition hover:border-lattice/40 hover:text-lattice"
      >
        <Bi zh="修改密码" en="Change Password" />
      </button>
    );
  }

  return (
    <div className="bg-void-deep w-full rounded-sm p-5 text-left">
      <p className="text-sm text-bone-dim"><Bi zh="修改密码" en="Change Password" /></p>
      {status === "done" ? (
        <p className="mt-3 text-sm text-lattice"><Bi zh="密码已更新。" en="Password updated." /></p>
      ) : (
        <>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="新密码（至少6位）"
            className="mt-3 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-sm text-bone outline-none focus:border-lattice/60"
          />
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="再次输入新密码"
            className="mt-3 w-full rounded-sm border border-white/15 bg-void px-4 py-3 text-sm text-bone outline-none focus:border-lattice/60"
          />
          {error && <p className="mt-2 text-xs text-rose">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              onClick={submit}
              disabled={status === "saving"}
              className="flex-1 bg-lattice py-2.5 font-display text-xs uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
            >
              {status === "saving" ? <Bi zh="保存中…" en="Saving…" /> : <Bi zh="保存" en="Save" />}
            </button>
            <button
              onClick={() => { setOpen(false); setError(""); }}
              className="flex-1 border border-white/15 py-2.5 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-bone"
            >
              <Bi zh="取消" en="Cancel" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
