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

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
