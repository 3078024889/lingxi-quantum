"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";

// 注销是不可逆操作——删了就是删了，之前解锁过的报告、买过的修炼
// 技术、多维叙事，全部一起清空，重新注册也找不回来。所以这里不是点一下
// 就立刻执行，要先点一次，弹出一段说明和第二次确认按钮，逼自己
// 慢下来看清楚再决定。
export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");

  const confirmDelete = async () => {
    setStatus("deleting");
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      // 注销之后，不用一句冷冰冰的"操作成功"打发——留一句话，让这次
      // 离开，也带着场域本来的语气，而不是像在关掉一个软件账户。
      sessionStorage.setItem(
        "lx-farewell",
        JSON.stringify({
          zh: "欢迎再次回归灵犀场。当你准备好时，记得回家的路。",
          en: "Welcome back to the Field, whenever you return. When you're ready, remember the way home.",
        })
      );
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
        className="w-full py-3 text-center text-xs text-bone-soft underline underline-offset-2 transition hover:text-rose"
      >
        <Bi zh="注销并永远离开灵犀场" en="Deregister & Leave the Field" />
      </button>
    );
  }

  return (
    <div className="w-full rounded-sm border border-rose/30 bg-rose/5 p-5 text-left">
      <p className="text-sm text-rose">
        <Bi
          zh="注销会永久删除你在灵犀场的登录身份和全部数据——包括已解锁的生命图谱报告、修炼技术、多维叙事。这个操作无法撤销，重新注册也找不回来。"
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
