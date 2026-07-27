import { createAdminClient } from "@/lib/supabase/admin";

// ────────────────────────────────────────────────────────────────────
// 简单限流（v225 新增）
// ────────────────────────────────────────────────────────────────────
// 给 /api/lingxi 这类没有登录门槛、调用频率又高的免费接口用——防止
// 同一个来源（同一个 IP）短时间内刷爆请求，把智谱免费档本就有限的
// 并发/额度占满，导致真正的用户（包括正在生成付费报告的用户）撞上
// 429。用 Supabase 里的一张表 + 一个原子的数据库函数实现固定窗口
// 限流，不需要额外的 Redis 之类的服务。
//
// 需要先在 Supabase SQL Editor 里跑一次配套的建表+建函数 SQL（见
// README 或这次的更新说明），这个文件本身不建表。
//
// 限流服务本身出故障（比如函数还没建、或者数据库一时连不上）时，
// 选择"放行"而不是"拒绝"——限流是锦上添花的保护措施，不能因为它
// 自己出问题，反而把正常功能也一起打挂。
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("rate_limit_check", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] 检查失败，本次放行:", error);
      return true;
    }
    return data === true;
  } catch (e) {
    console.error("[rate-limit] 异常，本次放行:", e);
    return true;
  }
}

// 从请求头里取出客户端真实 IP——Vercel 会在 x-forwarded-for 里带上，
// 格式可能是"真实IP, 代理IP1, 代理IP2"，取第一个。取不到就退回一个
// 固定字符串，保证限流函数至少能正常调用（这种情况下等于所有查不到
// IP 的请求共用一个配额，比完全不限流要安全）。
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
