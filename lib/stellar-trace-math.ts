export type ConvergenceLevel = "divergent" | "weak" | "moderate" | "strong" | "high";

export type DirectionMode = {
  center: number;
  count: number;
  mass: number;
  resultantLength: number;
  bearings: number[];
};

export type CircularDirectionAnalysis = {
  diagnosticMean: number | null;
  resultantLength: number;
  circularDispersion: number;
  circularStdDegrees: number | null;
  level: ConvergenceLevel;
  qualified: boolean;
  sector: [number, number] | null;
  modes: DirectionMode[];
};

export const normalizeBearing = (value: number) => ((value % 360) + 360) % 360;
export const angularDistance = (left: number, right: number) => {
  const delta = Math.abs(normalizeBearing(left) - normalizeBearing(right));
  return Math.min(delta, 360 - delta);
};

function vector(values: number[]) {
  const x = values.reduce((sum, value) => sum + Math.cos(value * Math.PI / 180), 0) / values.length;
  const y = values.reduce((sum, value) => sum + Math.sin(value * Math.PI / 180), 0) / values.length;
  const resultantLength = Math.sqrt(x * x + y * y);
  return {
    mean: resultantLength < 1e-9 ? null : normalizeBearing(Math.atan2(y, x) * 180 / Math.PI),
    resultantLength,
  };
}

function levelFor(resultantLength: number): ConvergenceLevel {
  if (resultantLength < 0.25) return "divergent";
  if (resultantLength < 0.5) return "weak";
  if (resultantLength < 0.7) return "moderate";
  if (resultantLength < 0.85) return "strong";
  return "high";
}

/**
 * Finds descriptive circular modes without using a mode as permission to
 * output a location. A 70-degree neighbourhood deliberately joins a cluster
 * that crosses 0 degrees; qualification still depends on the global R gate.
 */
function directionModes(values: number[]): DirectionMode[] {
  const groups = new Map<string, number[]>();
  for (const anchor of values) {
    const members = values.filter((value) => angularDistance(anchor, value) <= 70);
    if (members.length < 2) continue;
    const key = [...members].sort((a, b) => a - b).map((value) => value.toFixed(6)).join("|");
    groups.set(key, members);
  }
  return [...groups.values()].map((bearings) => {
    const stats = vector(bearings);
    return {
      center: stats.mean ?? bearings[0],
      count: bearings.length,
      mass: bearings.length / values.length,
      resultantLength: stats.resultantLength,
      bearings: [...bearings],
    };
  }).sort((left, right) => right.count - left.count || right.resultantLength - left.resultantLength);
}

export function analyzeCircularDirections(rawValues: number[]): CircularDirectionAnalysis {
  const values = rawValues.filter(Number.isFinite).map(normalizeBearing);
  if (!values.length) {
    return { diagnosticMean: null, resultantLength: 0, circularDispersion: 1, circularStdDegrees: null, level: "divergent", qualified: false, sector: null, modes: [] };
  }
  const stats = vector(values);
  const level = levelFor(stats.resultantLength);
  // A primary direction exists only from moderate global convergence onward.
  // Weak or divergent vectors retain their mathematical mean for audit only.
  const qualified = stats.mean !== null && stats.resultantLength >= 0.5;
  const circularStdDegrees = stats.resultantLength > 0
    ? Math.sqrt(Math.max(0, -2 * Math.log(stats.resultantLength))) * 180 / Math.PI
    : null;
  const halfWidth = qualified ? Math.min(45, Math.max(8, circularStdDegrees ?? 45)) : null;
  return {
    diagnosticMean: stats.mean,
    resultantLength: stats.resultantLength,
    circularDispersion: 1 - stats.resultantLength,
    circularStdDegrees,
    level,
    qualified,
    sector: qualified && halfWidth !== null
      ? [normalizeBearing(stats.mean! - halfWidth), normalizeBearing(stats.mean! + halfWidth)]
      : null,
    modes: directionModes(values).slice(0, 3),
  };
}
