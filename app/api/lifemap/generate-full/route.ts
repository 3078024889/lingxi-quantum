import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, findConflicts, calculateResilience, calculateWealthDetail, topTraits } from '@/lib/life-vector';
import { generateStaticLifeMapReport } from '@/lib/knowledge-loader';

// 强制动态渲染，防止 Vercel 在编译时提前静态验算导致崩溃
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 【关键修复】将初始化移入函数内部，确保只在用户请求时获取环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { id, forceRegenerate } = body;

    if (!id) return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });

    const possibleTables = ['lifemap_submissions', 'lifemaps', 'life_map_submissions', 'lifemap_reports'];
    let submission = null;
    let matchedTable = '';

    for (const tableName of possibleTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (data && !error) {
        submission = data;
        matchedTable = tableName;
        break;
      }
    }

    if (!submission || !matchedTable) {
      return NextResponse.json({ error: 'Submission not found in any lifemap table' }, { status: 404 });
    }

    const v = computeLifeVector(submission.facts || submission.fact || {});
    const conflicts = findConflicts(v);
    const resilience = calculateResilience(v);
    const wealth = calculateWealthDetail(v);
    const traits = topTraits(v, 3);
    
    if (submission.full_report && !forceRegenerate) {
      return NextResponse.json({ success: true, report: submission.full_report });
    }

    const userStatus = submission.occupation || 'default';
    const calcData = { v, conflicts, resilience, wealth, topTraits: traits };
    const finalReportText = generateStaticLifeMapReport(calcData, userStatus);

    const { error: updateError } = await supabase
      .from(matchedTable)
      .update({
        full_report: finalReportText,
        full_report_en: finalReportText
      })
      .eq('id', id);

    if (updateError) {
      console.error("[灵犀场预警] 数据库更新报告失败:", updateError);
    }

    return NextResponse.json({ success: true, report: finalReportText });

  } catch (error: any) {
    console.error("[灵犀场预警] 生命图谱生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
