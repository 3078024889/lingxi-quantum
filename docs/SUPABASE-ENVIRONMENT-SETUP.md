# SASI Supabase 环境连接与迁移

更新日期：2026-09-08

## 当前缺少什么

当前检出目录只有 `.env.example`，没有 `.env.local`；系统也没有可调用的 Supabase CLI，`supabase/config.toml` 尚未生成。因此代码可以构建，但无法在本机验证登录、Storage 和数据库事务，也不能把迁移推送到远端项目。

## 一、本地应用连接

在 Supabase Dashboard 的 **Project Settings → API** 获取项目 URL、浏览器可用的 publishable/anon key，以及只允许服务端使用的 service role key。复制 `.env.example` 为 `.env.local`，只填写变量值：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` 不得提交。`SUPABASE_SERVICE_ROLE_KEY` 不得放进 `NEXT_PUBLIC_*` 变量、浏览器输入框、日志或截图。

## 二、建立 CLI 工作流

Windows 优先使用 Supabase 官方文档支持的 Scoop 全局安装方式。当前 npm 稳定包 `2.117.0` 在本机解析不到它声明的 Windows x64 二进制包，因此不要把这个异常版本锁进项目依赖。

如果电脑尚未安装 Scoop，先按 [Scoop 官方安装说明](https://scoop.sh/) 完成安装；随后执行：

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase init
supabase login
supabase link --project-ref <project-ref>
```

`<project-ref>` 位于 Dashboard 地址 `/project/<project-ref>`。登录会打开官方授权页；连接远端时可能要求数据库密码。

如果远端数据库已经通过 Dashboard 或 SQL Editor 建过表，首次连接后先执行：

```powershell
supabase db pull
supabase migration list
```

检查生成的远端基线迁移，不要直接覆盖现有生产结构。

## 三、部署 SASI 迁移

SASI 当前迁移文件：

```text
supabase/migrations/20260908090000_sasi_foundation.sql
```

先预览，再应用：

```powershell
supabase db push --dry-run
supabase db push
```

禁止在生产环境运行 `supabase db reset --linked`，它会删除远端数据后重建。

## 四、验证

迁移后在本地登录 SASI，建立一个测试项目并上传一个小型 `.txt` 文件，然后验证：

- `sasi_projects` 出现一条属于当前用户的项目；
- `sasi_nodes` 为 Drama 生成 10 条或为 Build 生成 8 条记录；
- `sasi_node_dependencies` 构成顺序依赖；
- `sasi_assets` 的文本资产最终为 `ready` 且有 `sha256`；
- 私有桶 `sasi-quarantine` 不允许公共 URL 读取；
- PDF、DOCX、ZIP、图片、音视频保持 `external_scan_required`，直到外部恶意文件扫描器给出结果。

## 五、部署平台环境变量

生产部署平台还需配置同名的三个 Supabase 变量，并为 Preview 与 Production 分别绑定对应环境。更新变量后需要重新部署应用；“变量已保存”不等于线上函数已经加载新值。
