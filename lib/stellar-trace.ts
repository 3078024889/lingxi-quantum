import * as Astronomy from "astronomy-engine";
import { createHash } from "node:crypto";

export type StellarTraceInput = {
  name: string;
  birthDate: string;
  birthTime?: string;
  lastContactAt: string;
  lastKnownLat: number;
  lastKnownLon: number;
  context?: string;
};

export type TraceEvidence = {
  id: "time-palace" | "three-pass" | "host-guest" | "moving-line";
  labelZh: string;
  bearing: number;
  range: [number, number];
  distanceBand: "近" | "中" | "远";
  environmentZh: string[];
  evidenceZh: string;
};

export type StellarTraceResult = {
  version: "lingxifield-stellar-trace-v1";
  generatedAt: string;
  inquiryJulianDay: number;
  nineFields: Array<{ id: string; nameZh: string; longitude: number }>;
  evidence: TraceEvidence[];
  bearing: number;
  sector: [number, number];
  distanceKm: [number, number];
  candidate: { lat: number; lon: number; radiusKm: number };
  convergence: number;
  environmentZh: string[];
  artIndexes: [number, number];
  boundaryZh: string;
};

const bodies: Array<{ id: string; nameZh: string; body?: Astronomy.Body }> = [
  { id: "sun", nameZh: "太阳" },
  { id: "mercury", nameZh: "水星", body: "Mercury" as Astronomy.Body },
  { id: "venus", nameZh: "金星", body: "Venus" as Astronomy.Body },
  { id: "earth", nameZh: "地球", body: "Earth" as Astronomy.Body },
  { id: "mars", nameZh: "火星", body: "Mars" as Astronomy.Body },
  { id: "jupiter", nameZh: "木星", body: "Jupiter" as Astronomy.Body },
  { id: "saturn", nameZh: "土星", body: "Saturn" as Astronomy.Body },
  { id: "uranus", nameZh: "天王星", body: "Uranus" as Astronomy.Body },
  { id: "neptune", nameZh: "海王星", body: "Neptune" as Astronomy.Body },
];

const normalize = (value: number) => ((value % 360) + 360) % 360;
const round = (value: number, digits = 2) => Number(value.toFixed(digits));
const hashInt = (value: string) => Number.parseInt(createHash("sha256").update(value).digest("hex").slice(0, 12), 16);

function heliocentricLongitude(body: Astronomy.Body | undefined, at: Date) {
  if (!body) return 0;
  const vector = Astronomy.HelioVector(body, at);
  return normalize(Math.atan2(vector.y, vector.x) * 180 / Math.PI);
}

function destination(lat: number, lon: number, bearing: number, distanceKm: number) {
  const radius = 6371.0088;
  const angular = distanceKm / radius;
  const phi1 = lat * Math.PI / 180;
  const lambda1 = lon * Math.PI / 180;
  const theta = bearing * Math.PI / 180;
  const phi2 = Math.asin(Math.sin(phi1) * Math.cos(angular) + Math.cos(phi1) * Math.sin(angular) * Math.cos(theta));
  const lambda2 = lambda1 + Math.atan2(Math.sin(theta) * Math.sin(angular) * Math.cos(phi1), Math.cos(angular) - Math.sin(phi1) * Math.sin(phi2));
  return { lat: phi2 * 180 / Math.PI, lon: ((lambda2 * 180 / Math.PI + 540) % 360) - 180 };
}

function circularMean(values: number[]) {
  const x = values.reduce((sum, value) => sum + Math.cos(value * Math.PI / 180), 0);
  const y = values.reduce((sum, value) => sum + Math.sin(value * Math.PI / 180), 0);
  return normalize(Math.atan2(y, x) * 180 / Math.PI);
}

export function calculateStellarTrace(input: StellarTraceInput, now = new Date()): StellarTraceResult {
  const birthMoment = new Date(`${input.birthDate}T${input.birthTime || "12:00"}:00+08:00`);
  const lastContact = new Date(input.lastContactAt);
  if (!Number.isFinite(birthMoment.getTime()) || !Number.isFinite(lastContact.getTime())) throw new Error("invalid trace time");
  const nineFields = bodies.map((item) => ({ id: item.id, nameZh: item.nameZh, longitude: round(heliocentricLongitude(item.body, now), 3) }));
  const signature = `${input.name}|${birthMoment.toISOString()}|${lastContact.toISOString()}|${round(input.lastKnownLat, 4)}|${round(input.lastKnownLon, 4)}|${now.toISOString().slice(0, 13)}`;
  const seed = hashInt(signature);
  const astro = nineFields.reduce((sum, item, index) => sum + item.longitude * (index + 1), 0);
  const bases = [seed % 360, normalize(astro / 9), normalize((seed >>> 7) + nineFields[4].longitude), normalize((seed >>> 13) + nineFields[6].longitude)];
  const center = circularMean(bases);
  const environments = ["水域", "道路", "高地", "低洼", "建筑群", "交通节点", "林木", "开阔地"];
  const labels: TraceEvidence["id"][] = ["time-palace", "three-pass", "host-guest", "moving-line"];
  const zh = ["时宫方证", "三传行证", "主客远近证", "动爻环境证"];
  const evidence = bases.map((bearing, index): TraceEvidence => {
    const spread = 18 + ((seed >>> (index * 3)) % 10);
    return {
      id: labels[index], labelZh: zh[index], bearing: round(bearing, 1),
      range: [round(normalize(bearing - spread), 1), round(normalize(bearing + spread), 1)],
      distanceBand: ((seed >>> (index + 5)) % 3 === 0 ? "近" : (seed >>> (index + 5)) % 3 === 1 ? "中" : "远"),
      environmentZh: [environments[(seed + index * 3) % environments.length]],
      evidenceZh: index === 0 ? "取年命、行迹中断时刻与当下纪元，定其方证。" : index === 1 ? "取时序迁移与方位重合，察其行止。" : index === 2 ? "取内外层级与时间差，定远近带。" : "取动位与环境象，作为现实线索的复核条件。",
    };
  });
  const deviations = bases.map((value) => Math.min(Math.abs(value - center), 360 - Math.abs(value - center)));
  const convergence = Math.max(18, Math.round(100 - deviations.reduce((sum, value) => sum + value, 0) / deviations.length));
  const elapsedHours = Math.max(1, (now.getTime() - lastContact.getTime()) / 3600000);
  const centerDistance = Math.min(360, Math.max(12, 18 + (seed % 54) + Math.log2(elapsedHours + 1) * 7));
  const distanceKm: [number, number] = [Math.round(centerDistance * .62), Math.round(centerDistance * 1.38)];
  const point = destination(input.lastKnownLat, input.lastKnownLon, center, centerDistance);
  return {
    version: "lingxifield-stellar-trace-v1", generatedAt: now.toISOString(), inquiryJulianDay: round(Astronomy.MakeTime(now).ut + 2451545, 5),
    nineFields, evidence, bearing: round(center, 1), sector: [round(normalize(center - 22.5), 1), round(normalize(center + 22.5), 1)],
    distanceKm, candidate: { lat: round(point.lat, 2), lon: round(point.lon, 2), radiusKm: Math.max(12, Math.round((distanceKm[1] - distanceKm[0]) / 2)) },
    convergence, environmentZh: [...new Set(evidence.flatMap((item) => item.environmentZh))].slice(0, 4),
    artIndexes: [seed % 60, (seed * 17 + 23) % 60],
    boundaryZh: "本结果是古代时间方位规则、真实天文坐标与现代地理投影形成的实验性候选区域，不是对人员现实位置的事实认定，不等同于 GPS、通信基站、警方或救援机构定位。涉及人员安全时，请立即使用警方、通信、交通与紧急救援等可核验渠道。",
  };
}
