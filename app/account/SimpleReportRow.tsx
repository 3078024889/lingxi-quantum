import Link from "next/link";
import Bi from "@/components/Bi";

// v251：生命韧性、桃花磁场、今日运势潮汐、财富创造地图这四个产品，
// 之前场域入口完全没有列出对应的报告——不是查询逻辑漏了判断，是
// 压根没写查这四张表的代码，导致真的付过钱的人，找不到回去再看的
// 入口。这个组件先解决"能找到、能点进去看"这个最紧急的问题，删除
// 功能这四个产品目前还没有对应的接口，先不做，不影响主问题。
export default function SimpleReportRow({
  href,
  title,
  date,
}: {
  href: string;
  title: string | null;
  date: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-sm border border-white/10 bg-void-deep px-5 py-3 transition hover:opacity-80"
    >
      <span className="font-display text-lattice">{title || <Bi zh="未命名报告" en="Untitled report" />}</span>
      <span className="text-xs text-bone-dim">{date}</span>
    </Link>
  );
}
