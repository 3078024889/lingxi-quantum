import type {
  SasiTeacherAdapter,
  SasiTeacherCallInput,
  SasiTeacherCallResult,
} from "@/lib/sasi/teachers/adapter";

export class SasiMockTeacherAdapter implements SasiTeacherAdapter {
  supports() {
    return true;
  }

  async call(input: SasiTeacherCallInput): Promise<SasiTeacherCallResult> {
    if (input.role === "extractor") {
      return {
        provider: "local",
        model: "mock-teacher-v1030",
        outputText: JSON.stringify({
          concept: "水的沸点与气压",
          domain: "physics",
          proposedDefinition:
            "水的沸点取决于外界压力；在标准大气压附近通常约为100摄氏度。",
          claims: [
            {
              text: "水的沸点会随外界压力变化。",
              confidence: 0.98,
            },
          ],
          relations: [
            {
              predicate: "depends-on",
              object: "external-pressure",
              confidence: 0.96,
            },
          ],
          conditions: ["标准大气压附近"],
          counterexamples: ["高海拔低压环境下沸点低于100摄氏度"],
          commonMisconceptions: ["水在任何环境中都固定100摄氏度沸腾"],
          uncertaintyNotes: [],
        }),
        usage: { inputTokens: 120, outputTokens: 130, costMinor: 0 },
      };
    }

    return {
      provider: "local",
      model: "mock-teacher-v1030",
      outputText: JSON.stringify({
        verdict: "support",
        confidence: 0.95,
        issues: [],
        suggestedCorrections: [],
        evidenceRequests: [],
      }),
      usage: { inputTokens: 150, outputTokens: 60, costMinor: 0 },
    };
  }
}
