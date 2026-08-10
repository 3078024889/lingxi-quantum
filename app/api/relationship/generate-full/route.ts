import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, compareLifeVectors } from '@/lib/life-vector';
import { generateStaticRelationshipReport } from '@/lib/knowledge-loader';
import { getRelationshipProductMeta } from '@/lib/relationship-config';

// 强制动态渲染，防止 Vercel 编译期间报错
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 【关键修复】必须放在 POST 函数内部，防止 Vercel 编译崩溃
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { id, forceRegenerate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    const { data: submission, error: fetchError } = await supabase
      .from('relationship_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const vectorA = computeLifeVector(submission.facts_a);
    const vectorB = computeLifeVector(submission.facts_b);
    const resonanceResult = compareLifeVectors(vectorA, vectorB);

    if (submission.full_report && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        report: submission.full_report,
        vectors: { a: vectorA, b: vectorB }
      });
    }

    const rawRelType = submission.relationship_type || 'romantic';
    const productMeta = getRelationshipProductMeta(rawRelType);
    const engineRelationType = productMeta.id; 

    const finalReportText = generateStaticRelationshipReport(resonanceResult, engineRelationType);

    const { error: updateError } = await supabase
      .from('relationship_submissions')
      .update({
        full_report: finalReportText,
        full_report_en: finalReportText
      })
      .eq('id', id);

    if (updateError) {
      console.error("[灵犀场预警] 数据库更新报告失败:", updateError);
    }

    return NextResponse.json({
      success: true,
      report: finalReportText,
      vectors: { a: vectorA, b: vectorB },
      productMeta 
    });

  } catch (error: any) {
    console.error("[灵犀场预警] 关系共振生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
