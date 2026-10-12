import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import {fetchPublicMedia} from "@/lib/security/public-media-fetch";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";

export const runtime = "nodejs";
export const maxDuration = 45;

const MAX_BYTES = 100 * 1024 * 1024;
const MAX_HTML_BYTES = 5 * 1024 * 1024;


type Kind = "video" | "audio" | "image";

function platformFor(host: string) {
  const h = host.toLowerCase().replace(/\.$/, "");
  const matches=(root:string)=>h===root||h.endsWith("."+root);
  if (matches("douyin.com")) return "Douyin";
  if (matches("tiktok.com")) return "TikTok";
  if (matches("xiaohongshu.com") || matches("xhslink.com")) return "Xiaohongshu";
  if (matches("kuaishou.com") || matches("v.kuaishou.com")) return "Kuaishou";
  return null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/\\u002F/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\\//g, "/");
}

function firstHttp(value: string | undefined | null) {
  if (!value) return null;
  const decoded = decodeHtml(value)
    .replace(/^["']|["']$/g, "")
    .trim();
  try {
    const url = new URL(decoded);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractMeta(html: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
        "i",
      ),
    ];
    for (const pattern of patterns) {
      const hit = html.match(pattern)?.[1];
      const url = firstHttp(hit);
      if (url) return url;
    }
  }
  return null;
}

function extractJsonLikeUrl(html: string, fieldNames: string[]) {
  for (const field of fieldNames) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`"${escaped}"\\s*:\\s*"([^"]+)"`, "i"),
      new RegExp(`"${escaped}"\\s*:\\s*\\[\\s*"([^"]+)"`, "i"),
      new RegExp(`${escaped}\\\\?["']?\\s*[:=]\\s*\\\\?["']([^"'<>]+)`, "i"),
    ];
    for (const pattern of patterns) {
      const hit = html.match(pattern)?.[1];
      const url = firstHttp(hit);
      if (url) return url;
    }
  }
  return null;
}

function extractJsonLdContentUrl(html: string) {
  const scripts = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const match of scripts) {
    try {
      const value = JSON.parse(match[1]);
      const list = Array.isArray(value) ? value : [value];
      for (const node of list) {
        const direct =
          firstHttp(node?.contentUrl) ||
          firstHttp(node?.video?.contentUrl) ||
          firstHttp(node?.associatedMedia?.contentUrl);
        if (direct) return direct;
      }
    } catch {}
  }
  return null;
}

function resolvePublicSharePage(html: string, platform: string | null) {
  const meta =
    extractMeta(html, [
      "og:video:url",
      "og:video:secure_url",
      "og:video",
      "twitter:player:stream",
    ]) || extractJsonLdContentUrl(html);

  if (meta) return meta;

  const genericFields = [
    "playAddr",
    "play_addr",
    "playUrl",
    "play_url",
    "videoUrl",
    "video_url",
    "masterUrl",
    "master_url",
    "contentUrl",
    "srcNoMark",
    "photoUrl",
  ];

  const platformFields: Record<string, string[]> = {
    Douyin: ["playAddr", "play_addr", "videoPlayAddr", "playApi"],
    TikTok: ["playAddr", "playAddrH264", "downloadAddr"],
    Xiaohongshu: ["masterUrl", "master_url", "videoUrl", "streamUrl"],
    Kuaishou: ["photoUrl", "playUrl", "srcNoMark", "videoUrl"],
  };

  return extractJsonLikeUrl(
    html,
    [...(platform ? platformFields[platform] || [] : []), ...genericFields],
  );
}

async function fetchMediaOrResolveShare(input: {
  url: URL;
  kind: Kind;
  allowSharePageResolve: boolean;
  deadline: number;
}) {
  const first = await fetchPublicMedia(input.url.href,{kind:input.kind,allowHtml:input.kind==="video"&&input.allowSharePageResolve,deadline:input.deadline});
  const contentType = (first.response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType.startsWith(`${input.kind}/`)) {
    return {
      response: first.response,
      finalUrl: first.finalUrl,
      platform: platformFor(first.finalUrl.hostname),
      resolvedFromSharePage: false,
    };
  }

  if (
    input.kind !== "video" ||
    !input.allowSharePageResolve ||
    !contentType.includes("text/html")
  ) {
    throw new Error(
      contentType.includes("text/html")
        ? "HTML_PAGE_NOT_DIRECT_MEDIA"
        : `REMOTE_TYPE_${contentType || "UNKNOWN"}`,
    );
  }

  const platform = platformFor(first.finalUrl.hostname) || platformFor(input.url.hostname);
  if (!platform) throw new Error("UNSUPPORTED_SHARE_PAGE");

  const length = Number(first.response.headers.get("content-length") || "0");
  if (length > MAX_HTML_BYTES) throw new Error("SHARE_PAGE_TOO_LARGE");

  const html = await first.response.text();
  const direct = resolvePublicSharePage(html, platform);

  if (!direct) {
    throw new Error(`${platform.toUpperCase()}_PUBLIC_MEDIA_NOT_EXPOSED`);
  }

  const resolved = await fetchPublicMedia(direct,{kind:"video",allowHtml:false,deadline:input.deadline});
  const resolvedType = (resolved.response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (!resolvedType.startsWith("video/")) {
    throw new Error(`${platform.toUpperCase()}_RESOLVED_URL_NOT_VIDEO`);
  }

  return {
    response: resolved.response,
    finalUrl: resolved.finalUrl,
    platform,
    resolvedFromSharePage: true,
  };
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }
  const abuse = await enforceAbuseGuard(req, {
    scope: "media-import",
    ipLimit: 30,
    windowSeconds: 3600,
  });
  if (!abuse.ok) return NextResponse.json({ error: abuse.error }, { status: abuse.status });

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 32 * 1024) {
    return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
  }

  try {
    const parsed=await boundedRequestJson(req,32*1024);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error("REQUEST_INVALID");
    const body=parsed as Record<string,unknown>;
    const raw = String(body.url || "").trim();
    if(!raw||raw.length>4096)throw Error("REQUEST_INVALID");
    const kind = String(body.kind || "video") as Kind;
    const allowSharePageResolve = body.allowSharePageResolve !== false;

    if (!["video", "audio", "image"].includes(kind)) {
      return NextResponse.json({ error: "MEDIA_KIND_INVALID" }, { status: 400 });
    }

    const url = new URL(raw);
    const found = await fetchMediaOrResolveShare({
      url,
      kind,
      allowSharePageResolve,
      deadline:Date.now()+30_000,
    });

    const contentType = (found.response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    const length = Number(found.response.headers.get("content-length") || "0");
    if (Number.isFinite(length) && length > MAX_BYTES) {
      return NextResponse.json(
        { error: "链接文件超过 100MB。请改为直接上传文件。" },
        { status: 413 },
      );
    }

    const buffer = await found.response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "链接文件超过 100MB。请改为直接上传文件。" },
        { status: 413 },
      );
    }

    const pathName = found.finalUrl.pathname;
    const fromPath = decodeURIComponent(pathName.split("/").pop() || "");
    const ext =
      contentType.split("/")[1]?.replace("quicktime", "mov").replace("x-m4v", "m4v") ||
      "mp4";
    const rawName =
      fromPath && /\.[a-z0-9]{2,5}$/i.test(fromPath)
        ? fromPath
        : `${found.platform || "remote-video"}-${Date.now()}.${ext}`;
    const clean = rawName.replace(/[^\w.\-()+\u4e00-\u9fff]/g, "_").slice(-140);

    return new Response(buffer, {
      headers: {
        "content-type": contentType,
        "content-length": String(buffer.byteLength),
        "content-disposition": `attachment; filename="${clean || `remote-${kind}.${ext}`}"`,
        "cache-control": "no-store",
        "x-lingxi-source-platform": found.platform || "DirectMedia",
        "x-lingxi-share-resolved": found.resolvedFromSharePage ? "1" : "0",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if(["REQUEST_TOO_LARGE","MEDIA_TOO_LARGE","SHARE_PAGE_TOO_LARGE"].includes(message))return NextResponse.json({error:message},{status:413});
    if(message==="REQUEST_INVALID"||e instanceof SyntaxError||e instanceof TypeError)return NextResponse.json({error:"REQUEST_INVALID"},{status:400});
    if(message==="MEDIA_TIMEOUT")return NextResponse.json({error:message},{status:504});

    const friendly =
      message === "DOUYIN_PUBLIC_MEDIA_NOT_EXPOSED"
        ? "已识别为抖音分享页，但当前公开页面没有提供可直接读取的视频地址。请重试、换一条分享链接，或上传原始视频。"
        : message === "TIKTOK_PUBLIC_MEDIA_NOT_EXPOSED"
          ? "已识别为 TikTok 分享页，但当前公开页面没有提供可直接读取的视频地址。请重试或上传原始视频。"
          : message === "XIAOHONGSHU_PUBLIC_MEDIA_NOT_EXPOSED"
            ? "已识别为小红书分享页，但当前公开页面没有提供可直接读取的视频地址。请重试、换一条分享链接，或上传原始视频。"
            : message === "KUAISHOU_PUBLIC_MEDIA_NOT_EXPOSED"
              ? "已识别为快手分享页，但当前公开页面没有提供可直接读取的视频地址。请重试、换一条分享链接，或上传原始视频。"
              : message === "UNSUPPORTED_SHARE_PAGE"
                ? "这是网页链接，但不是当前支持的抖音、TikTok、小红书、快手分享页，也不是直接媒体文件。"
                : message;

    const clientCodes = [
      "HTTPS_REQUIRED",
      "URL_CREDENTIALS_FORBIDDEN",
      "NON_STANDARD_PORT_FORBIDDEN",
      "PRIVATE_NETWORK_FORBIDDEN",
      "TOO_MANY_REDIRECTS",
      "BAD_REDIRECT",
      "HTML_PAGE_NOT_DIRECT_MEDIA",
      "UNSUPPORTED_SHARE_PAGE",
      "SHARE_PAGE_TOO_LARGE",
    ];

    const known =
      clientCodes.includes(message) ||
      message.endsWith("_PUBLIC_MEDIA_NOT_EXPOSED") ||
      message.endsWith("_RESOLVED_URL_NOT_VIDEO") ||
      message.startsWith("REMOTE_TYPE_");

    return NextResponse.json(
      { error: friendly },
      { status: known ? 422 : 502 },
    );
  }
}
