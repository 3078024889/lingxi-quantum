"use client";

import { useState } from "react";
import { analyzePhoneNumber, analyzePlateNumber, type NumberEnergyResult } from "@/lib/number-energy-calc";
import Bi from "@/components/Bi";

const LEVEL_COLOR: Record<string, string> = {
  great: "#F0C868",
  good: "#8EDBD2",
  neutral: "#B8C9E6",
  caution: "#FF9FD6",
};
const LEVEL_LABEL_ZH: Record<string, string> = { great: "大吉", good: "吉", neutral: "中平", caution: "宜谨慎" };
const LEVEL_LABEL_EN: Record<string, string> = { great: "Very favorable", good: "Favorable", neutral: "Neutral", caution: "Proceed with care" };

function ResultCard({ result }: { result: NumberEnergyResult }) {
  return (
    <div className="bg-void-deep mt-8 rounded-sm p-6 sm:p-8">
      <p className="text-sm text-bone-dim">
        <Bi zh="总和灵动数" en="Total sum number" />
      </p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="font-display text-4xl" style={{ color: LEVEL_COLOR[result.lingdong.level] }}>
          {result.totalSum}
        </span>
        <span className="rounded-full px-3 py-1 text-xs" style={{ background: `${LEVEL_COLOR[result.lingdong.level]}22`, color: LEVEL_COLOR[result.lingdong.level] }}>
          <Bi zh={LEVEL_LABEL_ZH[result.lingdong.level]} en={LEVEL_LABEL_EN[result.lingdong.level]} />
        </span>
      </div>
      <p className="mt-3 text-base leading-8 text-bone-dim">
        <Bi zh={result.lingdong.zh} en={result.lingdong.en} />
      </p>

      {result.pairBreakdown.length > 0 && (
        <div className="mt-8">
          <p className="text-sm text-bone-dim"><Bi zh="逐组拆解（相邻两位数字之和）" en="Pairwise breakdown (adjacent digit sums)" /></p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {result.pairBreakdown.map((p, i) => (
              <div key={i} className="bg-void rounded-sm border border-[color:var(--aurora-glass-border)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-bone">{p.pair}</span>
                  <span className="text-xs" style={{ color: LEVEL_COLOR[p.lingdong.level] }}>
                    <Bi zh={LEVEL_LABEL_ZH[p.lingdong.level]} en={LEVEL_LABEL_EN[p.lingdong.level]} />
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-bone-dim">
                  <Bi zh={p.lingdong.zh} en={p.lingdong.en} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-6 text-xs leading-6 text-bone-soft">
        <Bi
          zh="这是民俗数字能量学（81数灵动数体系），是一套流传已久、约定俗成的符号含义表，不是天文或统计意义上「算出来」的结论——供参考，不作为决策依据。"
          en="This is folk number-energy numerology (the 81-number system) — a long-established, conventional table of symbolic meanings, not an astronomically or statistically derived result. For reference only, not a basis for decisions."
        />
      </p>
    </div>
  );
}

export default function NumberEnergyTool() {
  const [tab, setTab] = useState<"phone" | "plate">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [plateInput, setPlateInput] = useState("");
  const [phoneResult, setPhoneResult] = useState<NumberEnergyResult | null>(null);
  const [plateResult, setPlateResult] = useState<NumberEnergyResult | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setTab("phone")}
          className={`rounded-sm px-6 py-3 text-sm transition ${tab === "phone" ? "bg-lm2-violet/20 text-bone border border-lm2-violet/50" : "bg-void-deep text-bone-dim"}`}
        >
          <Bi zh="手机号测试" en="Phone Number" />
        </button>
        <button
          onClick={() => setTab("plate")}
          className={`rounded-sm px-6 py-3 text-sm transition ${tab === "plate" ? "bg-lm2-violet/20 text-bone border border-lm2-violet/50" : "bg-void-deep text-bone-dim"}`}
        >
          <Bi zh="车牌号测试" en="License Plate" />
        </button>
      </div>

      {tab === "phone" && (
        <div className="mt-8">
          <label className="block text-sm text-bone-dim"><Bi zh="输入手机号" en="Enter phone number" /></label>
          <div className="mt-2 flex gap-3">
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder={"138 0000 0000"}
              className="bg-void w-full rounded-sm border border-white/15 px-5 py-3 text-base text-bone outline-none focus:border-lattice/50"
            />
            <button
              onClick={() => phoneInput.trim() && setPhoneResult(analyzePhoneNumber(phoneInput))}
              className="bg-lattice shrink-0 rounded-sm px-6 py-3 text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
            >
              <Bi zh="测算" en="Analyze" />
            </button>
          </div>
          {phoneResult && <ResultCard result={phoneResult} />}
        </div>
      )}

      {tab === "plate" && (
        <div className="mt-8">
          <label className="block text-sm text-bone-dim"><Bi zh="输入车牌号（只取数字部分）" en="Enter plate number (digits only are used)" /></label>
          <div className="mt-2 flex gap-3">
            <input
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              placeholder={"京A 88888"}
              className="bg-void w-full rounded-sm border border-white/15 px-5 py-3 text-base text-bone outline-none focus:border-lattice/50"
            />
            <button
              onClick={() => plateInput.trim() && setPlateResult(analyzePlateNumber(plateInput))}
              className="bg-lattice shrink-0 rounded-sm px-6 py-3 text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
            >
              <Bi zh="测算" en="Analyze" />
            </button>
          </div>
          {plateResult && <ResultCard result={plateResult} />}
        </div>
      )}
    </div>
  );
}
