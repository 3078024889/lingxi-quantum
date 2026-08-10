import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, compareLifeVectors } from '@/lib/life-vector';
import { generateStaticRelationshipReport } from '@/lib/knowledge-loader';
import { getRelationshipProductMeta } from '@/lib/relationship-config';

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

    // 1. 获取双人排盘数据以及用户选择的关系类型 (romantic, business, general)
    const { data: submission, error: fetchError } = await supabase
      .from('relationship_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // 2. 向量计算
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

    // 3. 从我们刚建好的配置文件中获取关系的元数据（安全兜底为 romantic）
    const rawRelType = submission.relationship_type || 'romantic';
    const productMeta = getRelationshipProductMeta(rawRelType);
    
    // 映射给知识库加载器的具体指令类型 (romantic, business, general)
    const engineRelationType = productMeta.id; 

    // 4. 调用静态神殿，将高维法典与对应关系的行动指令瞬间拼装
    const finalReportText = generateStaticRelationshipReport(resonanceResult, engineRelationType);

    // 5. 写入数据库
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
      productMeta // 顺便把高维名字带给前端
    });

  } catch (error: any) {
    console.error("[灵犀场预警] 关系共振生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
