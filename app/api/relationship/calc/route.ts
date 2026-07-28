import { NextResponse } from "next/server";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { computeLifeVector, compareLifeVectors, type LifeVectorInput } from "@/lib/life-vector";

export const runtime = "nodejs";

// v230：关系共振之前完全没有免费引流入口——填完两人信息，直接进付款
// 流程。这个接口补上这一层，跟 resilience/romance 的 /calc 是同一套
// 设计原则：不登录、不调用AI、纯函数计算，即开即用，专门承接搜索
// 流量（"两个人合不合适"这类搜索词）。返回的是两人生命向量的真实
// 交叉对比——共鸣点、互补点、摩擦点——这些数据本来就是 AI 生成完整
// 报告时会用到的同一份原始计算（compareLifeVectors），这里只是提前
// 亮出来一部分当作免费预览，不是另外编一套简化版数据。真正的AI叙事
// 解读（为什么共鸣、这段关系怎么发展）留在付费的完整报告里。

type PersonInput = { year: number; month: number; day: number; hour: number; minute: number; hasTime: boolean; calendarType?: string };

function resolveBirth(p: PersonInput): BirthInput {
  let { year, month, day } = p;
  if (p.calendarType === "lunar") {
    const solar = lunarToSolar(year, month, day);
    year = solar.year; month = solar.month; day = solar.day;
  }
  return { year, month, day, hour: p.hasTime ? p.hour : 12, minute: p.hasTime ? p.minute : 0, hasTime: !!p.hasTime };
}

function validPerson(p: Partial<PersonInput>): p is PersonInput {
  return (
    typeof p.year === "number" && typeof p.month === "number" && typeof p.day === "number" &&
    p.year >= 1 && p.year <= 2026 && p.month >= 1 && p.month <= 12 && p.day >= 1 && p.day <= 31
  );
}

export async function POST(req: Request) {
  let body: { a?: Partial<PersonInput>; b?: Partial<PersonInput> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  const { a, b } = body;
  if (!a || !b || !validPerson(a) || !validPerson(b)) {
    return NextResponse.json({ error: "请检查两个人的出生日期是否都填写完整。" }, { status: 400 });
  }

  try {
    const factsA = computeLifeMapFacts(resolveBirth(a));
    const factsB = computeLifeMapFacts(resolveBirth(b));
    const vA = computeLifeVector(factsA as LifeVectorInput);
    const vB = computeLifeVector(factsB as LifeVectorInput);
    const { resonant, complementary, friction } = compareLifeVectors(vA, vB);

    return NextResponse.json({
      vectors: { a: vA, b: vB },
      resonance: { resonant, complementary, friction },
      sunSignA: factsA.sunSignZh, sunSignB: factsB.sunSignZh,
      sunSignAEn: factsA.sunSignEn, sunSignBEn: factsB.sunSignEn,
    });
  } catch (e) {
    console.error("[relationship calc] 计算失败:", e);
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
