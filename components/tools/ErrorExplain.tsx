"use client";

import Bi from "@/components/Bi";

export default function ErrorExplain({
  reasonZh,
  reasonEn,
  hintZh,
  hintEn,
}: {
  reasonZh: string;
  reasonEn: string;
  hintZh?: string;
  hintEn?: string;
}) {
  return (
    <div className="mt-6 rounded-sm border border-rose/30 bg-rose/5 p-5">
      <p className="text-sm uppercase tracking-widest2 text-rose">
        <Bi zh="未能完成" en="Could not finish" />
      </p>
      <p className="mt-2 text-base text-bone">
        <Bi zh={reasonZh} en={reasonEn} />
      </p>
      {(hintZh || hintEn) && (
        <p className="mt-2 text-sm leading-6 text-bone-dim">
          <Bi zh={hintZh || ""} en={hintEn || hintZh || ""} />
        </p>
      )}
    </div>
  );
}
