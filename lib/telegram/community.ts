import { timingSafeEqual } from "node:crypto";

export const TELEGRAM_GROUP_URL = "https://t.me/globalsiai";
const WEBSITE = "https://lingxifield.com";
const RANKING = "https://lingxifield.com/siai";

export function marketingLink(base: string, campaign: string): string {
  const url = new URL(base);
  url.searchParams.set("utm_source", "telegram");
  url.searchParams.set("utm_medium", "community");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export function singaporeDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const editorial: { title: string; detail: string; cta: string; page: string; campaign: string }[] = [
  { title: "AI 工具太多，怎样找到真正适合自己的？", detail: "先确定任务：写作、编程、图片、视频还是音频。再比较功能、免费额度、使用地区及商用条件，不必只看热度。", cta: "按需求查看全球 SIAI 排行榜", page: RANKING, campaign: "ranking" },
  { title: "PDF 文件改不了？先试试在线编辑。", detail: "需要合并、拆分、压缩、签名、OCR 或导出时，先找对应工具。涉及敏感资料，上传前确认数据处理方式。", cta: "查看 PDF 工具", page: WEBSITE + "/tools", campaign: "pdf" },
  { title: "视频太大、没有字幕、声音太杂？", detail: "按任务选择视频压缩、转文字、字幕制作、配音或降噪；处理完成后记得预览并核对输出。", cta: "打开视频与音频工具", page: WEBSITE + "/tools", campaign: "video" },
  { title: "图片格式总是不兼容？", detail: "JPG、PNG、WebP、HEIC 转换，图片压缩与 OCR 可以按用途选择；注意原文件备份及输出清晰度。", cta: "试用在线图片工具", page: WEBSITE + "/tools", campaign: "image" },
  { title: "生成 10 秒视频究竟要花多少钱？", detail: "价格可能按积分、秒数、分辨率或订阅套餐计算。比较工具时要先查看官方套餐、免费额度与商业授权。", cta: "比较全球 SIAI 产品资料", page: RANKING, campaign: "pricing" },
  { title: "有创意，却不知道如何做分镜和短剧？", detail: "先写清故事冲突、角色、时长，再规划分镜、画面、对白及配音。生成前核对所选功能与费用。", cta: "探索 SASI 智能创作", page: WEBSITE + "/sasi", campaign: "sasi" },
  { title: "周末发现：少装软件，也能完成日常处理。", detail: "PDF、图片、字幕、表格、二维码、临时邮箱等需求，可以从一个工具目录查起。优先选择无需额外下载的简单流程。", cta: "浏览在线工具目录", page: WEBSITE + "/tools", campaign: "toolbox" },
];

export function dailyPost(date: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Singapore", weekday: "short" }).format(date);
  const item = editorial[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday)];
  return [
    "🌐 全球 SIAI｜每日实用发现", "",
    `【${item.title}】`, item.detail, "",
    `${item.cta}：`, marketingLink(item.page, item.campaign), "",
    "欢迎在群里提出你最想解决的工具问题。",
    `官方社区：${TELEGRAM_GROUP_URL}`,
  ].join("\n");
}

export function welcomeText(): string {
  return [
    "欢迎来到全球 SIAI 排行榜官方社区！",
    "这里讨论全球 SI/AI 工具、功能、价格和实用教程。",
    `实用工具：${marketingLink(WEBSITE + "/tools", "welcome")}`,
    `产品比较：${marketingLink(RANKING, "welcome")}`,
    "请勿发布广告、诈骗链接、助记词或账户密钥。",
    "输入 /help 查看使用方法。",
  ].join("\n");
}

export function commandReply(input: string): string | null {
  const command = input.trim().split(/\s+/)[0]?.toLowerCase().replace(/@globalsiai_officialbot$/, "");
  switch (command) {
    case "/start": case "/help": return welcomeText();
    case "/tools": return `在线工具目录：${marketingLink(WEBSITE + "/tools", "command_tools")}`;
    case "/ranking": return `全球 SIAI 排行榜：${marketingLink(RANKING, "command_ranking")}`;
    case "/community": return `全球 SIAI 社区：${TELEGRAM_GROUP_URL}`;
    default: return null;
  }
}

export function isAllowedGroup(chat: { id: number; username?: string; type: string }, allowed: string): boolean {
  if (chat.type !== "supergroup" && chat.type !== "group") return false;
  if (/^-?\d+$/.test(allowed)) return String(chat.id) === allowed;
  return chat.username?.toLowerCase() === allowed.replace(/^@/, "").toLowerCase();
}

export function isClearSpam(text: string): boolean {
  const links = text.match(/(?:https?:\/\/|t\.me\/|telegram\.me\/)/gi) || [];
  if (!links.length) return false;
  if (links.length >= 5) return true;
  return /稳赚不赔|保本高收益|保证盈利|私聊.{0,12}(?:转账|领钱|返利)|(?:助记词|私钥).{0,20}(?:提交|验证|填写)|(?:充值|入金).{0,10}(?:翻倍|返利)/i.test(text);
}

export function validWebhookSecret(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected || expected.length < 16) return false;
  const a = Buffer.from(actual); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string; username?: string };
  from?: { id: number; is_bot?: boolean };
  text?: string;
  new_chat_members?: Array<{ id: number; is_bot?: boolean }>;
};
export type TelegramUpdate = { update_id: number; message?: TelegramMessage };

export async function telegramApi(token: string, method: "sendMessage" | "deleteMessage" | "setWebhook", payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(8000), cache: "no-store",
  });
  if (!response.ok) throw new Error(`Telegram ${method} failed (HTTP ${response.status})`);
  const data: { ok?: boolean } = await response.json();
  if (!data.ok) throw new Error(`Telegram ${method} rejected request`);
}
