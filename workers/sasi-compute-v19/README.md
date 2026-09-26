# SASI 自托管计算服务

这套服务负责本地权重推理，不调用火山、OpenAI 等模型 API。它不是从零训练的基础模型，也不承诺达到 GPT/Grok 的综合能力。网页仍使用既有 Supabase 账号和支付系统；完全自托管这些基础设施是另一项迁移。

## 能力与边界

- 文字推理：Qwen3-8B；图片理解：Qwen2.5-VL-7B-Instruct。
- 图片生成：FLUX.1-schnell；短镜头生成：Wan2.1-T2V-1.3B 的 Diffusers 权重。
- 只加载 `model-manifest.json` 中固定 revision 的本地 safetensors；推理期间不下载模型。
- SQLite 持久任务、单执行线程、请求签名与持久防重放、按用户隔离结果、带鉴权的本地文件下载。
- 每种能力完成一次真实推理后才通过基础执行门槛。基础执行验收不等于画质、正确率、人物一致性或商业质量验收。
- 当前不包含连续多轮聊天、语音模型、视频理解、整剧一致性、自主部署或无人审核的源码修复；不能把这些能力标记为已上线。

## 首次配置

使用独立 GPU 主机。硬件需求取决于精度、卸载与输出尺寸，必须实测；本次开发机 MX150 4GB 未做模型推理验收。不要为测试一次性下载全部模型。

1. 在此目录运行 `install.ps1`（Linux 为 `install.sh`），将 `.env.example` 复制为 `.env`，设置至少 32 字符的随机 `SASI_NATIVE_COMPUTE_SECRET`。不要提交密钥。
2. 显式准备所需模型，例如：`python download_models.py reasoning --model-dir ./models`。其他选项为 `vision image video`。首次安装依赖、准备权重需要网络；部分模型下载可能需要接受托管平台的许可条件。
3. 运行 `python run.py`。默认仅监听 `127.0.0.1:8787`。Docker 挂载本地 models 为只读；只运行一个 worker 进程，一个 SQLite 数据库，不能直接横向复制。
4. 测试终端设置与 worker 相同的 `SASI_NATIVE_COMPUTE_SECRET`，然后 `python smoke_test.py --kind reason`。看图测试另加 `--kind vision --image ./test.jpg`；视频使用 `--kind video`。
5. 测试脚本必须等到终态并检查非空结果；超时或失败退出非零。人工复核输出，再从登录网页提交和下载一项真实任务。付款、回调、权益绑定需要另行实测。

远程部署需 TLS 反向代理、防火墙与持久磁盘。网页服务端配置：

```ini
SASI_NATIVE_COMPUTE_URL=https://你的自有计算域名
SASI_NATIVE_COMPUTE_ALLOWED_HOSTS=你的自有计算域名
SASI_NATIVE_COMPUTE_SECRET=与计算服务相同的随机密钥
SASI_NATIVE_REASONING_MODEL=Qwen/Qwen3-8B
SASI_NATIVE_VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
SASI_NATIVE_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
SASI_NATIVE_VIDEO_MODEL=Wan-AI/Wan2.1-T2V-1.3B-Diffusers
```

Vercel 中的 localhost 是 Vercel 自身，不是你的电脑。托管网页连接自有 worker 需要可达的 HTTPS 地址。推理离线与网页通过私有计算接口通信并不冲突。服务器断网策略可进一步限制模型进程出站访问。

## 存储与恢复

默认把输入与状态存在 SQLite，生成物存本地 artifacts；不需要外部对象存储。可选 R2 配置会使用外部存储，不需要时保持为空。磁盘容量、备份、用户删除和保留周期应在正式开放前配置，当前没有自动清理策略。

同一支付报价作为请求 ID，重试复用同一任务；换输入会拒绝。运行中的任务遇到服务重启会标记失败，不会自动再生成并消耗算力。取消阻止结果发布，底层 GPU 算子可能仍需运行至结束。恢复失败任务需明确处理订单/重试，不可假称自动退款。

## 测试

`python -m unittest test_protocol -v` 使用临时数据库、模拟库存与测试文件，不需要模型权重；依赖 FastAPI、httpx 和 Pillow。协议测试通过不代表模型推理通过。

`/health` 分别返回每种能力的 `provisioned`、`verified`、`ready`。网页创建报价和执行任务都检查对应能力。安装回执只证明目录与版本声明存在，真实加载仍可能因文件不全、依赖不兼容、内存不足而失败。运行库依赖目前为兼容范围，部署验收后应保存该主机的完整依赖锁定清单。

模型升级流程：审查许可与新 revision → 独立环境下载 → 固定问答、图片、视频测试 → 质量与资源回归 → 修改配置 → 重新验收。不要为了“永远最新”自动替换生产权重或自动修改 main。
