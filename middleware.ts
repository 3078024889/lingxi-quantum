import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 中间件：在每次请求时刷新登录会话，保持登录状态。
export async function middleware(request: NextRequest) {
  // v227：Search Console 报的 /narrative/（带斜杠）404——根因是这个
  // 项目没有配置 trailingSlash，Next.js 默认区分"/narrative"和
  // "/narrative/"这两个不同的URL，只有前者能匹配到真实页面，后者
  // 会直接404。谁给这个带斜杠的版本发了链接（可能是外部引用、也可能
  // 是Google自己在尝试变体）不重要，重要的是：只要还有任何URL带着
  // 多余的结尾斜杠被访问到，都会撞上同一个问题，不只是narrative这
  // 一个路径。这里做一个全站通用的修复：只要访问的路径带结尾斜杠
  // （根路径"/"本身除外），永久重定向（308）到去掉斜杠的版本，保留
  // 查询参数——一次性解决这一类问题，不用每发现一个就手动加一条。
  const { pathname } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(cleanUrl, 308);
  }

  // v241：之前怀疑过的一个方向——支付这类POST接口，日志里显示的来源
  // 是"edge-middleware"，而不是"serverless"，说明请求很可能连真正的
  // API路由函数都没跑到，是在这一层就出问题了。这里下面这段
  // supabase.auth.getUser()，是唯一会在中间件里发起真实网络请求的
  // 地方（要去问Supabase"这个人现在登录状态是什么"）——如果Supabase
  // 那次请求变慢或者失败，会直接卡在这一层，而中间件运行的Edge
  // Runtime，超时限制比serverless函数更短、也不支持用maxDuration
  // 调整，v240那次加的maxDuration完全帮不到这里。
  //
  // 所有 /api/* 路由本身都已经各自用 createClient() 重新做了一遍
  // 登录校验（这是必须的，不能省），中间件这里刷新登录cookie，主要
  // 是为了让浏览器"翻页面"的时候session不过期，对一次性的API请求
  // 意义不大——所以这里直接跳过，把这个网络请求从"支付"这类接口的
  // 关键路径上完全拿掉，不是让它变得更快，是让它压根不在这条路径上。
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // 若环境变量未配置，跳过（避免构建/部署初期报错）
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 就算是页面请求，也不让这次刷新无限期地卡住中间件——5秒内
  // Supabase没有回应，就放行，让页面继续加载，只是这次没刷新到最新的
  // session而已，不是什么严重后果；比"整个页面因为这一步卡死"要好
  // 得多。
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("middleware getUser timeout")), 5000)),
    ]);
  } catch (e) {
    console.error("[middleware] 刷新登录状态失败或超时，本次请求跳过刷新：", e);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
