import { createQimenProvider } from "../providers/qimen-provider";
import { createLiurenProvider } from "../providers/liuren-provider";
import { calculateAncientTrace } from "../ancient/engine";
import type { AncientTraceEnvelope, StellarAncientInput } from "../ancient/types";

export type PersonTraceInput = StellarAncientInput & {
  // optional real six-yao cast remains inside StellarAncientInput.liuyaoCast
};

export async function calculatePersonTrace(input: PersonTraceInput): Promise<AncientTraceEnvelope> {
  const qimen = createQimenProvider();
  const liuren = createLiurenProvider();

  return calculateAncientTrace(
    input,
    {
      qimen,
      liuren,
      // taiyi stays disabled until fixture-verified
      taiyi: undefined,
    },
    {
      // Do not fabricate modern km until calibration exists.
      calibratedDistanceKm: null,
    }
  );
}
