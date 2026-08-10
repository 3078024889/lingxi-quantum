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

    // 智能探测可能的表名，彻底解决 Submission not found 问题
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

    // --- 极速物理计算层（毫秒级） ---
    const v = computeLifeVector(submission.facts || submission.fact || {});
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

    // 将 13 章完整极品文案存入精准匹配的数据库表
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

    return NextResponse.json({
      success: true,
      report: finalReportText
    });

  } catch (error: any) {
    console.error("[灵犀场预警] 生命图谱生成失败:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
