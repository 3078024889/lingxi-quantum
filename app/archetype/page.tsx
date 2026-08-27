import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";

export const metadata: Metadata = {
  title: "生命原型 | 灵犀场",
  description: "八个场域精测节点汇入此刻的主原型、隐藏原型与行动原型。",
};

export default function LifeArchetypePage() {
  return <><Nav /><main className="min-h-screen px-5 pb-24 pt-12 sm:pt-20"><FieldProductIntroduction href="/archetype" /><section id="field-assessment" className="mx-auto max-w-4xl lx-glass border border-lattice/20 p-7 sm:p-10"><p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="小程序独有 · 哥白尼树突演算" en="Mini Program Exclusive · Copernican Dendrite Calculation" /></p><h2 className="mt-5 font-display text-2xl text-bone"><Bi zh="它不是网页天文演算的复制品" en="It is not a copy of the web astronomical engine" /></h2><p className="mt-5 text-base leading-9 text-bone-dim"><Bi zh="网页通过真实天文与历法数据展开稳定的结构坐标；小程序通过情境选择激活知识节点，让节点沿树突联锁传播，并在已完成的八个产品记录中寻找此刻正在汇聚的共同结构。主原型、隐藏原型与行动原型会随真实状态变化，不是命运结论。" en="The website unfolds stable structural coordinates from astronomical and calendrical data. The Mini Program activates knowledge nodes through situated choices, propagates them through dendrite links, and looks for the present convergence across your eight completed product records. Main, Hidden, and Action archetypes can change with your lived state; they are not conclusions about fate." /></p><div className="mt-8 border-l border-lattice/45 pl-5 text-sm leading-7 text-bone-soft"><Bi zh="请在微信小程序的「场域精测」中进入生命原型。完成的基础精测越多，八域汇流层可读取的历史节点越完整；新用户也可以从当前五个节点问题开始。" en="Open Life Archetype from Field Insights in the WeChat Mini Program. The more foundational assessments you complete, the more historical nodes the eight-field convergence can read; new users can still begin with five present-state questions." /></div></section></main></>;
}
