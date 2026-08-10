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
    
    // 兼容：前端可能传 id，也可能传 submissionId
    const targetId = body.id || body.submissionId;
    const forceRegenerate = body.forceRegenerate || false;

    if (!targetId) {
      console.error("[灵犀场预警] 缺少 ID，前端传来的 body:", body);
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    // 智能探测可能的表名
    const possibleTables = ['lifemap_submissions', 'lifemaps', 'life_map_submissions', 'lifemap_reports'];
    let submission = null;
    let matchedTable = '';

    for (const tableName of possibleTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', targetId)
        .single();
      
      if (data && !error) {
        submission = data;
        matchedTable = tableName;
        break;
      }
    }

    if (!submission || !matchedTable) {
      console.error(`[灵犀场预警] 在数据库中未找到 ID: ${targetId}`);
      return NextResponse.json({ error: 'Submission not found in any lifemap table' }, { status: 404 });
    }

    // --- 极速物理计算层（兼容 facts 或 fact 字段） ---
    const rawFacts = submission.facts || submission.fact || {};
    const v = computeLifeVector(rawFacts);
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

    // 将报告存入精准匹配的数据库表
    const { error: updateError } = await supabase
      .from(matchedTable)
      .update({
        full_report: finalReportText,
        full_report_en: finalReportText
      })
      .eq('id', targetId);

    if (updateError) {
      console.error("[灵犀场预警] 数据库更新报告失败:", updateError);
    }

    return NextResponse.json({ success: true, report: finalReportText });

  } catch (error: any) {
    console.error("[灵犀场预警] 生命图谱生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
