# SASI 免费本地模型体验

目标：不垫付模型 API 测试费，先用现有电脑跑出真实结果。此目录是本地体验与验收工具，不改变线上支付和生产模型配置，也不向公网开放服务。

## 选择与来源

| 用途 | 选择 | 许可与实际边界 |
|---|---|---|
| 文字 | Qwen3-0.6B 官方 Q8 GGUF + llama.cpp CPU | Apache-2.0 / MIT；小模型，适合先验证问答，不代表 GPT 级能力 |
| 图片 | Stable Diffusion 1.5 + stable-diffusion.cpp CPU | CreativeML OpenRAIL-M / MIT；权重免费，但有使用限制，不能称为无条件使用的 Apache 模型 |
| 低显存视频候选 | CogVideoX-2B | Apache-2.0；官方称优化后 FP16 从约 4GB 起，但测试为 A100/H100，不能保证 MX150 兼容、速度或实际内存足够 |
| 另一视频候选 | Wan2.1 T2V 1.3B | Apache-2.0；官方基线约 8.19GB 显存，原有自托管 worker 已保留配置 |

官方来源：

- https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- https://github.com/ggml-org/llama.cpp
- https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/sd.md
- https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- https://huggingface.co/zai-org/CogVideoX-2b
- https://github.com/Wan-Video/Wan2.1

“免费”指不收模型 API 调用费；现有硬件的电力、存储、带宽和占用时间仍有成本。网上免费 GPU 体验额度、排队演示站不能视为稳定免费的商用后台。

## 启动已准备好的本机体验页

在仓库根目录执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/local-models/start-studio.ps1
```

浏览器打开 http://127.0.0.1:8765 。文字服务在 8766。两者只监听本机，未设开机自启。重启电脑后重新执行上述命令即可。不要通过内网穿透将这个无登录的本地体验页开放给别人。

本机另有 `D:\SASI-local-runtime\Start-SASI.cmd`，双击可以启动后台进程并打开浏览器。关闭浏览器不会结束模型进程；需要完全停止时在任务管理器确认对应 `llama-server.exe` 和 `local_studio.py` 的 Python 进程再结束，不要结束其它 Python 任务。

文字和图片一次只处理一个任务。文字模型单独驻留约 1GB 工作内存；图片可能明显占用 CPU，耗时需要实测。这里不存储会话历史，任务状态只保存在当前进程，生成图片与运行日志保存在 `D:\SASI-local-runtime\outputs`，由用户管理删除。

## 首次准备或恢复下载

Python 3.10+ 标准库即可准备与启动体验页，模型运行器已编译为 Windows x64。仓库现有 worker 的 `.venv\Scripts\python.exe` 可用。

```powershell
workers/sasi-compute-v19/.venv/Scripts/python.exe scripts/local-models/provision.py text-runtime image-runtime text-model image-model
```

所有资产固定到 release / revision，下载完成必须与官方公布的 SHA-256 一致。大文件分块下载并保留临时块用于重试。模型、二进制和私人结果存仓库外；不将数 GB 权重提交到 Git。图片原权重约 4.27GB，文字权重约 639MB；重复运行会先检查已有文件。

单独生成图片：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/local-models/start-local.ps1 -Capability image -Prompt "A red house beside a lake, watercolor illustration"
```

默认 CPU、Q8 权重量化、256×256、8 步，只作运行验收。不是最终商用画质，文字生图宜先用英文描述。运行器与权重都在本地，不设置火山、OpenAI 或其它付费密钥。

体验页提供“快速预览 8 步”和“更清晰 20 步”，默认选择后者。低步数可能出现严重细节缺失，更多步数会延长等待；256px 仍只是轻量体验规格。CLI 可用 `-Steps 20 -Size 512` 显式尝试更高规格，当前不承诺这台机器的耗时与画质。

## 视频实验：已准备脚本，尚未安装及验收

`video_local.py` 固定 CogVideoX-2B revision，并使用 FP16、顺序 CPU 卸载、VAE slicing/tiling。它不调用外部推理 API。视频依赖与约 13.8GB 权重并未自动安装，避免在当前机器内存不足时占满资源。

在能够运行兼容 CUDA/PyTorch 的实验主机上，建立独立 venv，按 `requirements-video.txt` 安装。PyTorch CUDA 构建必须支持该显卡架构；不能只看“4GB”就认定支持。安装成功后依次运行：

```powershell
python scripts/local-models/video_local.py prepare
python scripts/local-models/video_local.py run --prompt "A red balloon floating slowly above a green meadow."
```

prepare 是联网下载权重；run 是本地离线推理。run 设置了当前可用系统内存 12GiB 的实验保护门槛（本项目保守限制，并非模型官方最低配置）。成功写出视频并通过人工质量检查前，体验页的视频按钮保持不可用。不能把脚本准备好写成“视频已跑通”。

真正接入公网 SASI 前，还需鉴权、持久任务与订单交付验收；本地模型运行成功不等于生产服务已经开放。
