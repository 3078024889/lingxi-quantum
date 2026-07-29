"use client";

import Link from "next/link";
import Bi from "./Bi";

// v244：之前"请先登录"这句话，只是纯文字提示，没有任何按钮能点过去——
// 第一次来的用户，尤其是手机上操作的人，根本不知道"登录入口"藏在哪，
// 更不知道场域本身的"进入场域"链接就是登录页。这个组件统一处理：
// 检测到错误信息是"请先登录"这一类的时候，除了文字，额外渲染一个
// 能直接点过去的按钮，链接到 /account（登录/注册页面）。
export default function ErrorWithLoginPrompt({ error, className }: { error: string; className?: string }) {
  const isLoginError = /请先登录|please (sign|log) ?in/i.test(error);

  return (
    <div className={className}>
      <p className="text-xs text-rose">{error}</p>
      {isLoginError && (
        <Link
          href="/account"
          className="mt-2 inline-block border border-lattice/40 px-4 py-1.5 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:bg-lattice hover:text-void-deep"
        >
          <Bi zh="去登录 / 注册 →" en="Log In / Sign Up →" />
        </Link>
      )}
    </div>
  );
}
