"use client";

import Bi from "@/components/Bi";

export type CalendarType = "solar" | "lunar";

type Props = {
  value: CalendarType;
  onChange: (value: CalendarType) => void;
  context: "relationship" | "resilience" | "romance" | "wealth" | "mirror" | "qian";
  className?: string;
  showDescription?: boolean;
};

const CONTEXT_COPY = {
  relationship: {
    zh: "若补充双方具体出生时刻，关系共振可展开更细的时间位置层次与互动结构连接。",
    en: "Adding both specific birth times can reveal finer timing layers and interaction structures within Relationship Resonance.",
  },
  resilience: {
    zh: "若补充具体出生时刻，生命韧性结构可展开更细的时间节律与节点连接。",
    en: "Adding the specific birth time can reveal finer timing rhythms and node connections within your resilience structure.",
  },
  romance: {
    zh: "若补充具体出生时刻，桃花磁场可展开更细的时间层次与吸引、靠近及关系连接纹理。",
    en: "Adding the specific birth time can reveal finer timing layers within attraction, approach, and connection in your Romance Field.",
  },
  wealth: {
    zh: "若补充具体出生时刻，财富创造地图可展开更细的时间节律、价值流动与创造结构连接。",
    en: "Adding the specific birth time can reveal finer timing rhythms, value flows, and creative connections within your Wealth Creation Map.",
  },
  mirror: {
    zh: "若补充具体出生时刻，三重生命镜像可展开更细的时间位置层次与镜像连接。",
    en: "Adding the specific birth time can reveal finer time-position layers and connections across the three Life Mirrors.",
  },
  qian: {
    zh: "若补充具体出生时刻，生命灵签可展开更细的时间位置层次与三签结构连接。",
    en: "Adding the specific birth time can reveal finer time-position layers and structural links across the three Life Signs.",
  },
} as const;

/**
 * Shared calendar guidance for every web assessment that accepts a birth date.
 * Keeping the copy and control together prevents the selected calendar from
 * drifting away from the date actually sent to the calculation endpoint.
 */
export default function BirthDateGuidance({ value, onChange, context, className = "", showDescription = true }: Props) {
  const optionClass = (active: boolean) =>
    `rounded-sm border px-3 py-2 text-xs transition ${active
      ? "border-lattice/70 bg-lattice/15 text-bone"
      : "border-white/15 bg-void/40 text-bone-dim hover:border-lattice/40"}`;

  return (
    <div className={className}>
      <p className="text-sm text-bone-dim"><Bi zh="出生日期" en="Birth date" /></p>
      {showDescription && <p className="mt-1.5 text-xs leading-6 text-bone-dim/85">
        <Bi
          zh={`请选择实际使用的历法：阳历（公历）或农历。两种历法并不相同，通常身份证日期为阳历，知晓是农历的选农历；海外用户一般直接选择阳历。${CONTEXT_COPY[context].zh}`}
          en={`Choose the calendar actually used for this date: Gregorian (solar) or Chinese lunar. They are different calendar systems. Dates on identity documents are usually Gregorian; choose lunar only when you know the recorded date is lunar. Users outside China can generally choose Gregorian. ${CONTEXT_COPY[context].en}`}
        />
      </p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onChange("solar")} className={optionClass(value === "solar")} aria-pressed={value === "solar"}>
          <Bi zh="阳历（公历）" en="Gregorian (Solar)" />
        </button>
        <button type="button" onClick={() => onChange("lunar")} className={optionClass(value === "lunar")} aria-pressed={value === "lunar"}>
          <Bi zh="农历" en="Chinese Lunar" />
        </button>
      </div>
    </div>
  );
}

export function BirthTimeOptionalCopy() {
  return (
    <Bi
      zh="补充具体出生时刻（选填）"
      en="Add the specific birth time (optional)"
    />
  );
}
