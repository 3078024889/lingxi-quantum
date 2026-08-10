import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, compareLifeVectors } from '@/lib/life-vector';
import { generateStaticRelationshipReport } from '@/lib/knowledge-loader';

// 绕过 RLS 限制，确保服务器能强制写入
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, forceRegenerate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    // 1. 获取用户双人排盘原始数据
    const { data: submission, error: fetchError } = await supabase
      .from('relationship_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // 2. 生命向量引擎计算（毫秒级，纯本地代码运算）
    const vectorA = computeLifeVector(submission.facts_a);
    const vectorB = computeLifeVector(submission.facts_b);
    const resonanceResult = compareLifeVectors(vectorA, vectorB);

    // 如果已有缓存且不强制刷新，直接返回（彻底 0 延迟）
    if (submission.full_report && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        report: submission.full_report,
        vectors: { a: vectorA, b: vectorB }
      });
    }

    const relType = submission.relationship_type || 'romantic';

    // 3. 【核心降维打击】彻底切断大模型，直接调用本地神殿知识库瞬间拼装！
    const finalReportText = generateStaticRelationshipReport(resonanceResult, relType);

    // 4. 将极速生成的顶级报告存入数据库
    const { error: updateError } = await supabase
      .from('relationship_submissions')
      .update({
        full_report: finalReportText,
        full_report_en: finalReportText // 同步存入英文占位，防止前端组件报错
      })
      .eq('id', id);

    if (updateError) {
      console.error("[灵犀场预警] 数据库更新报告失败:", updateError);
    }

    // 5. 瞬间返回！不再看大模型厂商的脸色！
    return NextResponse.json({
      success: true,
      report: finalReportText,
      vectors: { a: vectorA, b: vectorB }
    });

  } catch (error: any) {
    console.error("[灵犀场预警] 关系共振生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
