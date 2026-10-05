# R13R2 — Explicit Roots + Release Provenance

本轮根因不是 literal copy，而是审计脚本把 repo 当前目录误当成 release 根。
成熟发布系统应显式区分：
- ReleaseRoot：安装包自身
- PayloadRoot：安装包 payload
- RepoRoot：被修改项目

R13R2 不再依赖 process.cwd() 猜 INSTALL.ps1 在哪里，而是显式把 `$PSCommandPath` 传给 Node 审计。

继续吸收全球成熟方案：
- SLSA provenance：artifact 必须能追溯“从哪里、何时、如何”产生，并以 cryptographic digest 唯一识别。
- Sigstore / in-toto：artifact digest、身份、声明可绑定并 fail-closed 验证。
- Hermetic build：禁止依赖隐式 cwd、隐式环境、隐式机器状态。

R13R2 新增：
- package payload manifest SHA256 全量验证；
- installer path 显式参数；
- release root 显式参数；
- repo copy 继续 source/destination hash 校验。

以后任何非 repo 资源审计都必须显式接收绝对路径。
