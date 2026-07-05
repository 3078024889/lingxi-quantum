import GateOrigin from "./gates/GateOrigin";
import GateRelation from "./gates/GateRelation";
import GateHealth from "./gates/GateHealth";
import GateMind from "./gates/GateMind";
import GateDestiny from "./gates/GateDestiny";
import EarthGrid from "./EarthGrid";

// 根据门 id 渲染对应的原创动态视觉（全部代码生成、零版权、会动）
export default function GateVisual({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  switch (id) {
    case "origin":
      return <GateOrigin className={className} />;
    case "relation":
      return <GateRelation className={className} />;
    case "wealth":
      return <EarthGrid className={className} />;
    case "health":
      return <GateHealth className={className} />;
    case "mind":
      return <GateMind className={className} />;
    case "destiny":
      return <GateDestiny className={className} />;
    default:
      return <GateOrigin className={className} />;
  }
}
