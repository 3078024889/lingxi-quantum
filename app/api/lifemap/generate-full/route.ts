import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeLifeVector, findConflicts, calculateResilience, calculateWealthDetail, topTraits } from '@/lib/life-vector';
import { generateStaticLifeMapReport } from '@/lib/knowledge-loader';

// 强制动态渲染，防止 Vercel 在编译时提前静态验算导致崩溃
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 【关键修复】必须放在函数内部，只有请求时才读取环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { id, forceRegenerate, lang } = body;

    if (!id) return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });

    const possibleTables = ['lifemap_submissions', 'lifemaps', 'life_map_submissions', 'lifemap_reports'];
    let submission = null;
    let matchedTable = '';

    for (const tableName of possibleTables) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (data && !error) {
        submission = data;
        matchedTable = tableName;
        break;
      }
    }

    if (!submission || !matchedTable) {
      return NextResponse.json({ error: 'Submission not found in any lifemap table' }, { status: 404 });
    }

    // 判断是去查英文缓存还是中文缓存
    const targetReportCol = lang === 'en' ? 'full_report_en' : 'full_report';
    if (submission[targetReportCol] && !forceRegenerate) {
      return NextResponse.json({ success: true, report: submission[targetReportCol] });
    }

    const v = computeLifeVector(submission.facts || submission.fact || {});
    const conflicts = findConflicts(v);
    const resilience = calculateResilience(v);
    const wealth = calculateWealthDetail(v);
    const traits = topTraits(v, 3);
    
    const userStatus = submission.occupation || 'default';
    const calcData = { v, conflicts, resilience, wealth, topTraits: traits };

    // ⚡ 降维打击：将前端传来的 lang 塞进知识库引擎
    const finalReportText = generateStaticLifeMapReport(calcData, userStatus, lang);

    // 存入对应语言的字段
    const { error: updateError } = await supabase
      .from(matchedTable)
      .update({ [targetReportCol]: finalReportText })
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
