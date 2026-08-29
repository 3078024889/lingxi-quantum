import type { Metadata } from "next";
import StellarTraceExperience from "./StellarTraceExperience";

export const metadata: Metadata = {
  title: "灵犀场星迹 · 万里追踪 | Lingxi Stellar Trace",
  description: "以真实天文历算、时间方位模型与现代地理投影形成实验性候选坐标场。结果不等同于现实人员定位。",
};

export default function StellarTracePage() {
  return <StellarTraceExperience />;
}
