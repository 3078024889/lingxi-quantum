import Link from "next/link";
import Bi from "@/components/Bi";

// 修炼模块的付费墙包装：未激活显示激活提示，已激活显示 children
export default function PracticeGate({
  unlocked,
  user,
  productName,
  productNameEn,
  children,
}: {
  unlocked: boolean;
  user: boolean;
  productName: string;
  productNameEn?: string;
  children: React.ReactNode;
}) {
  if (unlocked) return <>{children}</>;
  const en = productNameEn || productName;
  return (
    <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
      <p className="font-display text-2xl text-bone">
        <Bi zh={`激活「${productName}」以开始练习`} en={`Activate ${en} to begin the practice`} />
      </p>
      <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
        <Bi
          zh={`下方的原理与引导你可以自由阅读。完整的分步练习属于「${productName}」修炼技术，一次激活，永久有效；或开启「四项合集」一并激活全部四项。`}
          en={`The principles and guidance below are free to read. The full step-by-step practice belongs to ${en} — one activation, yours forever; or open the Four-in-One Set to activate all four at once.`}
        />
      </p>
      <Link
        href="/membership"
        className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
      >
        {user ? <Bi zh="前往激活" en="Go to activate" /> : <Bi zh="登录并激活" en="Sign in & activate" />}
      </Link>
    </div>
  );
}
