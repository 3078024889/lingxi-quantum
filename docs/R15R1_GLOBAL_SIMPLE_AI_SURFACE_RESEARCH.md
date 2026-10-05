# R15R1 — Region Type Fix + GPT-like Simple Surface Research

## 当前 Build 失败根因

`ExperienceRegion` 的真实类型是：

`"global" | "china"`

R15 handler 错误写成：

`"global" | "cn"`

所以 TypeScript 正确拒绝。

R15R1 改为：
- canonical: `china`
- legacy input: `cn` 仍兼容并归一化成 `china`
- 新增 regression gate，防止 region alias 再次漂移。

## 全球产品界面优势提取

### ChatGPT
OpenAI 当前把文件、Library、Deep Research 等能力集中到 composer 的 “+ / tools” 入口。
关键优势不是功能少，而是：
- 主界面只有一个输入框；
- 复杂能力藏在同一个 add/tools 菜单；
- 用户先表达目标，再按需添加文件/研究/图片等上下文；
- Deep Research 虽然后台复杂，但用户只看计划、进度、结果，不看 runId/queue/provider。

### Gemini
Gemini 也是在主输入框的 Add files 入口继续扩展：
- 文件
- Drive
- Notebook
- Deep Research
- GitHub/code import
能力多，但不把后台架构词塞进主界面。

### Claude Projects
Claude Projects 的优势是：
- 项目知识 + 对话集中在一个 project context；
- 用户不需要理解向量库、RAG provider、thread store 等内部概念；
- 长上下文/知识源是“项目能力”，不是额外工程界面。

## 对 SASI 的提取

SASI 不应该复制某一家的视觉，而应该吸收共同优势：

1. **One conversation / one composer**
   主界面永远是一个输入框，不再给用户五套 SASI 产品入口。

2. **Progressive disclosure**
   “+” 菜单承载：
   - 添加照片和文件
   - 从资料库添加
   - 深度研究
   - 网页搜索
   - 创建图像
   未来插件/连接服务放二级，不把 Provider/API 暴露在主界面。

3. **Goal first, mechanics later**
   用户说“把这个网站改漂亮”“研究这篇论文”“做成短剧”。
   SASI 自己判定 mode/task，不让用户先学模式。

4. **Human progress, machine state hidden**
   用户看到：
   - 正在理解资料
   - 正在整理结构
   - 正在生成
   - 等待你的确认
   不看到：
   - runId
   - queue
   - lease
   - workflow_version
   - provider
   - model id

5. **Artifacts stay in the same conversation**
   网站、书本、研究报告、图片、视频都属于同一个 Thread 的作品，不跳进另一个“产品”。

6. **Resume invisibly**
   Snapshot/SSE/worker reconnect 是基础设施，不应该成为 UI 教程。
   用户刷新回来，只看到：“还在继续。”

## R16 UI 目标

主面：
- 对话
- 一个 composer
- “+”
- 语言/语音（如需要）
- 发送

“+” 一级菜单：
- 添加照片和文件
- 从资料库添加
- 深度研究
- 网页搜索
- 创建图像

项目/作品/连接服务：
- 按上下文才出现；
- 不占主输入区；
- 技术信息放“详情/运行信息”二级面板。

这就是“前台像 ChatGPT 一样简单，后台比普通聊天产品复杂很多”。
