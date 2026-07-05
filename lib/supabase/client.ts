"use client";

import { createBrowserClient } from "@supabase/ssr";

// 浏览器端 Supabase 客户端。
// 真实的 URL 与 publishable key 存放在 Vercel 环境变量里，代码只引用变量名。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
