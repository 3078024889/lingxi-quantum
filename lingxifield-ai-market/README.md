# 灵犀场全球SIAI排行榜

LINGXIFIELD Global SIAI Rankings：面向全球用户的 AI 工具、模型、价格、免费额度、地区支持与商用条件查询平台。

## 独立应用边界

- 本目录是独立 Next.js 15 / React 19 / TypeScript 应用，部署根目录为 `lingxifield-ai-market/`。
- 它与仓库根目录的灵犀场主站共存；不要把本目录的 `app/`、`package.json` 或配置覆盖到仓库根目录。
- Vercel 项目 `lingxifield-ai-market-review` 的 Root Directory 应保持为 `lingxifield-ai-market`。
- 本目录使用自己的依赖锁文件、页面路由、API、数据、测试和发布门禁。

## Windows 本地运行

```powershell
cd D:\30780\lingxi-quantum\lingxifield-ai-market
npm ci
npm run dev
```

打开 `http://localhost:3000`。

## 工程验收

```powershell
npm ci
npm run gate
```

`gate` 依次执行数据验证、目录验证、完整合同测试、TypeScript 类型检查和 Next.js 生产构建。Next 构建还会执行预构建回归测试。

## 当前数据边界（2026-11-01）

- 首页精选产品档案：32 个。
- 独立导入目录记录：22 条。两者属于不同数据集合，不得将其混为一个“全球工具总数”。
- 当前经核验的 SEO/GEO 观测：0 条；没有真实测量证据前，不发布搜索排名、AI 引用排名或市场份额结论。
- 支付：支付宝、微信支付、PayPal 均为未启用状态；适配器代码不等于商户授权或真实收款。
- 厂商资料提交：公开申请仅进入待身份核验状态，不自动取得产品所有权或发布权限。

## 域名与收录

`globalsiai.com` 与 `globalsiai.cn` 是本项目规划的候选域名，当前尚未绑定到此 Vercel 项目。每次发布只选择一个 canonical origin；另一个域名应采用明确的 301 跳转，或提供真正独立的本地化内容并正确配置 hreflang，不能无差别复制页面争夺收录。

预览环境始终保持 noindex。只有在域名所有权、DNS、HTTPS、九语言页面、产品事实来源、GSC 权限及发布验收全部通过后，才允许设置生产收录门禁。
