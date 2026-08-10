import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, findConflicts, calculateResilience, calculateWealthDetail, topTraits } from '@/lib/life-vector';
import { generateStaticLifeMapReport } from '@/lib/knowledge-loader';

// 绕过 RLS 强制写入数据库
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, forceRegenerate } = body;

    if (!id) return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });

    const { data: submission, error: fetchError } = await supabase
      .from('lifemap_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // --- 极速物理计算层（毫秒级） ---
    const v = computeLifeVector(submission.facts);
    const conflicts = findConflicts(v);
    const resilience = calculateResilience(v);
    const wealth = calculateWealthDetail(v);
    const traits = topTraits(v, 3);
    
    // 如果已经有缓存且不需要强制重刷，瞬间返回（0毫秒延迟）
    if (submission.full_report && !forceRegenerate) {
      return NextResponse.json({ success: true, report: submission.full_report });
    }

    // 提取用户填写的职业状态，实现动态场景映射 (Context Mapping)
    const userStatus = submission.occupation || 'default';

    // --- 绝对降维打击：切断大模型，调用本地神殿拼接《法典》语料！ ---
    const calcData = { v, conflicts, resilience, wealth, topTraits: traits };
    const finalReportText = generateStaticLifeMapReport(calcData, userStatus);

    // 将 13 章完整极品文案存入数据库
    const { error: updateError } = await supabase
      .from('lifemap_submissions')
      .update({
        full_report: finalReportText,
        full_report_en: finalReportText // 存一份防止多语言报错
      })
      .eq('id', id);

    if (updateError) {
      console.error("[灵犀场预警] 数据库更新报告失败:", updateError);
    }

    return NextResponse.json({
      success: true,
      report: finalReportText
    });

  } catch (error: any) {
    console.error("[灵犀场预警] 生命图谱生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
