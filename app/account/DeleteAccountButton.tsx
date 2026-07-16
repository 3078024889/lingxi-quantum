"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";

// 注销账户是不可逆操作——删了就是删了，之前解锁过的报告、买过的修炼
// 技术、多维叙事，全部一起清空，重新注册也找不回来。所以这里不是点一下
// 就立刻执行，要先点"注销账户"，弹出一段说明和第二次确认按钮，逼自己
// 慢下来看清楚再决定。
export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");

  const confirmDelete = async () => {
    setStatus("deleting");
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setStatus("error");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 text-center text-xs text-bone-dim/50 underline underline-offset-2 transition hover:text-rose"
      >
        <Bi zh="注销账户" en="Delete Account" />
      </button>
    );
  }

  return (
    <div className="w-full rounded-sm border border-rose/30 bg-rose/5 p-5 text-left">
      <p className="text-sm text-rose">
        <Bi
          zh="注销账户会永久删除你的登录身份和全部数据——包括已解锁的生命图谱报告、修炼技术、多维叙事。这个操作无法撤销，重新注册也找不回来。"
          en="Deleting your account permanently removes your login and all your data — including unlocked Life Map reports, Practices, and Narratives. This cannot be undone, and re-registering will not recover it."
        />
      </p>
      {status === "error" && (
        <p className="mt-2 text-xs text-rose"><Bi zh="注销失败，请稍后再试，或联系我们处理。" en="Deletion failed — please try again, or contact us." /></p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          onClick={confirmDelete}
          disabled={status === "deleting"}
          className="flex-1 border border-rose bg-rose/10 py-2.5 font-display text-xs uppercase tracking-widest2 text-rose transition hover:bg-rose/20 disabled:opacity-50"
        >
          {status === "deleting" ? <Bi zh="正在注销…" en="Deleting…" /> : <Bi zh="确认永久注销" en="Confirm Permanent Deletion" />}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="flex-1 border border-white/15 py-2.5 font-display text-xs uppercase tracking-widest2 text-bone-dim transition hover:text-bone"
        >
          <Bi zh="我再想想" en="Not now" />
        </button>
      </div>
    </div>
  );
}
