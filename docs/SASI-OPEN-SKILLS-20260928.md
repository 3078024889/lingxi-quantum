# SASI 开源能力接入记录

## 本轮实际安装

以下安装到本机 Codex Skills 目录，下一轮可发现。固定版本，不自动执行上游安装命令、付费云任务或任意工作流。

| Skill | 来源与固定版本 | 许可 | 用途与现状 |
|---|---|---|---|
| video-shotcraft | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft/tree/e2d8928c57ef84701f9b0119ca4a1c28a62050c1) | Apache-2.0 | 已安装；产品演示视频制作方法，尚未部署网站渲染服务 |
| huggingface-local-models | [huggingface/skills](https://github.com/huggingface/skills/tree/80f9fa530e46f4ae642fcb9e1725bad0e1979395/skills/huggingface-local-models) | Apache-2.0 | 已安装；选择适合硬件的本地模型 |
| huggingface-community-evals | 同上仓库、同一版本 | Apache-2.0 | 已安装；评测模型，尚未运行新模型评测 |
| huggingface-datasets | 同上仓库、同一版本 | Apache-2.0 | 已安装；查找和读取数据集，数据集本身须单独审查许可 |
| comfyui-agent-skill-mie | [MieMieeeee/comfyui-agent-skill](https://github.com/MieMieeeee/comfyui-agent-skill/tree/0e48986f5fdb217be7243efd2e9b4d949bff1039) | Apache-2.0 | 已安装；调用已登记的自建图片、视频、语音工作流，尚未验收运行中的 ComfyUI 服务 |

Remotion 的运行库有独立许可，不能用 shotcraft 的 Apache 许可替代。模型权重、声音素材、数据集、自定义节点也分别核验。Anthropic 的专有文档 Skills 未作为开源代码复制。

## 网站已经接入的方法

`lib/sasi/creation-methods.ts` 是灵犀场自行编写的任务方法，不是复制上述项目代码，也不是把本机 Codex 直接开放给访客。

- 文本：直接回答、区分事实与推断、不虚报工具执行。
- 剧本：人物一致性、镜头目的、动作和对白时长。
- 书本：根据所给片段回答，标明引用与证据缺口。
- 网站：围绕用户任务组织页面，兼顾手机与无障碍，不虚构交易与用户案例。
- 图片：保留用户风格与主体要求、参考身份及产品细节。
- 视频：结合已有项目记忆，再补充连续性和镜头方法；单镜头与多集报价均使用。

在报价时编译并保存方法版本和完整请求。确认时执行保存的内容，不从客户端重新接受提示词，也不在确认后偷偷更换方法。文本报价计算包含方法内容；图片/视频沿用已有经审核的价格配置。此改动没有新增平台收费、扣款或支付渠道。

## 尚未成为线上服务的部分

安装开发 Skills 不等于已有图片/视频算力。ComfyUI 批量生成、shotcraft 产品视频渲染、本地模型评测仍须实际运行、验收输出后才可以对用户标记可用。没有新增付费模型调用；没有承诺无限上下文或与 GPT 相同能力。

可以收取生成服务费用，但开放售卖前仍须具备：有效价格、可用算力/用户连接、预算确认、成功交付和失败退款规则。服务不可用时不能凭 Skill 已安装就收费。

复现安装：使用 Codex skill-installer，按上表仓库、版本和 skill 目录安装。保留各仓库 LICENSE/NOTICE；不得把不允许商业使用的代码改名后当成自有商业代码。

验收命令：`node scripts/test-creation-methods.cjs`、`npx tsc --noEmit`、`npm run audit:sasi`、`npm run build`。测试中的假供应商只验证请求与预算流程，不代表真实模型生成质量。

本轮实际结果：上述四项通过，生产构建完成 764 个页面；现有图片和视频请求测试 `test-byok-expansion.cjs`、`test-sasi-seedance-byok.cjs` 也通过。构建仍有现存 React Hook 与图片优化警告。本轮没有线上部署验收、模型质量评测或真实支付验收。
