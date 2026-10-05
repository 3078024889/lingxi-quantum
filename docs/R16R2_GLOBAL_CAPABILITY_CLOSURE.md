# R16R2 — Capability Genome Closure

## 这次失败的真实根因

R16R1 已经把公开工具 recipe 从 110 补到 118，并且 118 个工具都完成唯一主分类。

随后 `capability-genome.mjs` 继续向下一层检查时发现：
`pdf-attachments` 引用了 `document.pdf-structural-inspection`，
但 capability-genome.json 没有定义它。

进一步一次性扫描全部 recipes，而不是继续等脚本一个一个报错，发现当前一共有 7 个未知 capability 引用，实际只缺两个 capability ID：

### document.pdf-structural
被 4 个工具使用：
- pdf-protect
- pdf-unlock
- pdf-permissions
- pdf-web-optimize

语义：对 PDF 结构/权限/线性化等做结构级修改，输入 PDF，输出 PDF。

### document.pdf-structural-inspection
被 3 个工具使用：
- pdf-inspect
- pdf-attachments
- pdf-bookmarks

语义：读取 PDF 的结构、附件、书签等结构信息，输入 PDF，输出结构化检查结果。

## 为什么不把它们硬改成已有 capability

已有的 `document.page-model`、`document.preview`、`document.overlay.*` 等都不是同一能力。
把这些工具随便映射到旧 capability 虽然能让 audit 变绿，但会让 capability genome 失真。

因此 R16R2 选择补齐真正缺失的能力定义，而不是“为了过测试改名字”。

## 全球成熟平台提取

Inngest 强调稳定 step ID 和明确的 durable primitive：逻辑能力要有稳定身份，部署后不能随便重命名，否则正在运行的工作无法正确复用历史结果。SASI 的 capability ID 同样应该是稳定契约，而不是临时字符串。 

Temporal 的 workflow versioning 也说明长期运行系统中，能力/步骤契约需要兼容演进，而不是在新版本里偷偷改变旧语义。

因此新增永久门禁：
- 一次性枚举所有 recipe → capability 引用；
- 一次性枚举所有 workflow → capability 引用；
- 未知引用全部打印，而不是只报第一个；
- 只有真实语义缺失时才新增 capability；
- 不允许为了 audit PASS 把工具错误映射到不相干能力。

## R16R2 后的 Capability Genome

原有 capability：58
新增：2
目标：60

公开 tool recipes：118
未知 capability：0
