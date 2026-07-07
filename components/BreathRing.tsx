export default function BreathRing() {
  return (
    <div className="relative flex h-[260px] w-[260px] items-center justify-center sm:h-[340px] sm:w-[340px]">
      <div
        className="breath-ring absolute h-full w-full rounded-full border border-lattice/30"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="breath-ring absolute h-[78%] w-[78%] rounded-full border border-amber/25"
        style={{ animationDelay: "-1.4s" }}
      />
      <div
        className="breath-ring absolute h-[54%] w-[54%] rounded-full border border-rose/20"
        style={{ animationDelay: "-2.8s" }}
      />
      <div className="relative z-10 text-center">
        <p className="font-display text-sm uppercase tracking-widest2 text-bone-dim">
          量子息法
        </p>
        <p className="mt-2 font-display text-2xl tracking-widest text-bone">
          上扬 · 展开
        </p>
      </div>
    </div>
  );
}
