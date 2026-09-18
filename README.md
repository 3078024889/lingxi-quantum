# 灵犀场 LINGXIFIELD · SASI

> 一念成片，一念即达，一念显化。  
> 官网：**[lingxifield.com](https://lingxifield.com)** · **[lingxifield.cn](https://lingxifield.cn)**  
> 仓库：https://github.com/3078024889/lingxi-quantum

灵犀场（LingxiField）是融合 **SASI 智能创作平台**、**意识显化与场域精测**、**修炼技术**，以及 **在线小工具（本地优先）** 的中英双语数字空间。

技术栈：**Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel**

---

## 本地开发

```bash
# 建议 Node.js 18+
cd lingxi-quantum
npm install          # 或 pnpm install
cp .env.example .env.local   # 填入 Supabase / 支付等密钥
npm run dev
```

打开 http://localhost:3000

> 不要把 `.pnpm-store/`、`node_modules/`、`.env.local` 提交进 Git。  
> 仓库若曾误提交 package store，体积会膨胀到数百 MB——请确保 `.gitignore` 已忽略它们。

---

## 生产域名

| 域名 | 用途 |
|------|------|
| https://lingxifield.com | 国际 / 主站 |
| https://lingxifield.cn | 国内备案域；微信授权与支付优先 |
| Vercel 预览 | `lingxi-quantum-*.vercel.app` |

`middleware.ts` 会把 `www.lingxifield.com` / `www.lingxifield.cn` **308** 到裸域，并统一去掉多余尾斜杠。

部署：推送 `main` 后 Vercel 自动构建。本地也可：

```bash
git add .
git commit -m "说明本次改动"
git push origin main
```

Windows 工作副本路径示例：`D:\lingxi-quantum`

---

## 产品结构（现状）

### 1. SASI（站点首页 `/`）

面向结果的智能生产系统：理解目标 → 制作提案 → 能力编排 → 审校交付。  
含苍玄 AI 导演、短剧工坊、编程构建部署、Skills、模型与制作账户等（见 `app/sasi/*`、`lib/sasi/*`）。

旧路径 `/sasi` 永久重定向到 `/`。

### 2. 第二层 · 灵犀场

| 路径 | 说明 |
|------|------|
| `/live-as` | 意识显化 |
| `/field-tests` | 场域精测入口 |
| `/life-map` `/relationship` `/resilience` `/romance` `/wealth` `/daily` `/mirror` `/qian` `/archetype` | 各精测产品 |
| `/practice` | 修炼技术（量子息法 等） |
| `/subconscious` | 重塑潜意识 |
| `/learn` `/glossary` `/narrative` | 探索与内容 |
| `/account` | 我的场域 / 订单 |

### 3. 在线工具 `/tools`（新增模块）

定位：**遇到数字问题，丢进来就知道怎么回事，并尽量直接解决。**

- 优先 **浏览器本地处理**，文件不上传服务器  
- 统一 `ToolShell` + `registry`，禁止每个工具复制一套上传/SEO/错误组件  
- 重型库仅在对应页面动态加载，避免首页 bundle 膨胀  

**已上线（live）示例：**

- 图片：PNG↔JPG、WebP 转换、压缩、精确压到 20/50/100/200/500KB、尺寸修改、清 EXIF  
- 文件：真实格式检测（Magic Bytes）、MD5/SHA256、两文件一致性  
- 通用：JSON 格式化、时间戳转换、二维码生成  
- 场域：数字能量 `/tools/number-energy`

**规划中（planned，诚实占位，无假按钮）：** HEIC、二维码读取、PDF 合并/拆分/压缩、图片↔PDF 等。

架构说明见：`docs/TOOLS-MODULE-ARCHITECTURE.md`

---

## 目录速览

```text
app/                 路由与 API（SASI 首页、场域产品、tools、支付回调…）
components/          共享 UI（Nav / Footer / 报告 / tools/*）
lib/                 业务逻辑（sasi / 报告引擎 / tools 处理器…）
knowledge/           场域知识库（写作纪律见 docs/）
supabase/            schema 与 migrations
miniapp/             微信小程序
docs/                产品与审计文档
scripts/             审计与 ingest 脚本
public/              静态资源、OG、备案校验文件
```

---

## 常用脚本

```bash
npm run dev
npm run build
npm run lint
npm run audit:security
npm run audit:sasi
# 更多 audit:* 见 package.json
```

---

## 环境变量

见 `.env.example`。至少需要：

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（服务端）
- 支付相关：PayPal / 微信 / 支付宝（按已开通渠道）
- SASI 制作开关与供应商密钥（未验收前保持 `false`）

**切勿**把真实密钥提交进仓库。

---

## 内容与合规原则（摘要）

- 运行时报告以确定性知识库 / 计算为主；自由文本入口的 AI 仅作解析器，不替用户编造命运或医疗结论。  
- 不提供伪造法定公章等能力。  
- 工具页广告不得遮挡核心操作（假下载按钮禁止）。  
- PayPal 合规：产品命名避免 fortune-teller 类表述；旧 `/tarot` → `/mirror` 308。

---

## 更新日志

大版本说明见 `CHANGELOG.md` 与 `docs/V*-RELEASE-NOTES.md`。

---

## 联系与备案

- 站点：lingxifield.com / lingxifield.cn  
- 备案：湘ICP备2026031465号  

---

*本 README 已替换「第一阶段：首页 + 六道之门」旧部署教程。若你本地 `D:\lingxi-quantum` 仍显示旧文档，请拉取 `main` 最新提交。*
