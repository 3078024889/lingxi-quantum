# LINGXIFIELD · 灵犀场

> **Open-source AI platform for practical tools, source-grounded knowledge agents, and production-oriented creative workflows.**

🌐 **Live:** [lingxifield.com](https://lingxifield.com) · [lingxifield.cn](https://lingxifield.cn)
🧭 **Repository:** https://github.com/3078024889/lingxi-quantum

LINGXIFIELD is an actively maintained, production-deployed AI platform. It brings together practical digital tools, source-grounded knowledge agents, multi-model AI orchestration, and production workflows for creative applications.

This repository is not a static showcase. It is continuously maintained across product architecture, frontend, backend, database migrations, security hardening, payment flows, model integrations, deployment, debugging, and release validation.

---

## Why LINGXIFIELD exists

Most AI products either solve one narrow task or become a generic assistant.

LINGXIFIELD takes a different approach:

> **Turn a concrete problem, file, idea, or knowledge source into a direct next action.**

A user may arrive with:

- a PDF that needs editing
- an image that needs repair or conversion
- a video that needs transcription
- a book that should become an interactive knowledge agent
- an idea that should become a short drama
- a concept that should become a website
- a document that needs analysis
- a practical digital task that should be solved in one step

The project is built as a modular system so these workflows can share infrastructure instead of becoming isolated one-off products.

---

## Current product areas

### 1. Practical Tool Center

LINGXIFIELD includes a growing set of tools for common digital tasks.

**Live / actively maintained areas include:**

- image compression and conversion
- image resizing and metadata cleanup
- file type detection and hash verification
- PDF processing workbenches
- OCR and transcription
- subtitle workflows
- privacy-oriented file handling
- QR inspection
- local-first browser processing where practical
- drag-and-drop upload support across major workbenches

**In active rollout:**

- advanced PDF editing / stamping / comparison
- broader table extraction
- more image / video processing
- temporary privacy tools
- web extraction / reading workflows
- additional export and recovery paths

The principle is simple:

> **Solve one annoying step as directly as possible.**

---

### 2. Book SASI / Knowledge-to-Agent

LINGXIFIELD is building source-grounded workflows that turn books, papers, study materials, PDFs, text, Markdown, and page images into searchable private knowledge spaces.

The goal is:

```text
book / document / source material
→ structured retrieval
→ source-grounded understanding
→ persistent knowledge context
→ interactive agent
```

Current implementation includes:

- file ingestion
- source retrieval
- contextual Q&A
- evidence-aware answers
- multiple intelligence levels
- private knowledge workflows
- AI usage billing through a real balance ledger

The design goal is not to treat documents as static uploads, but as reusable knowledge interfaces that can be queried and explored over time.

---

### 3. SASI AI Creative Production

SASI is the production-oriented creative layer of LINGXIFIELD.

The repository already contains foundations for:

- project creation
- asset handling
- production memory
- task quotation
- balance reservation
- job dispatch
- provider routing
- usage settlement
- delivery tracking
- failure release
- AI-generated-content labeling
- production readiness checks

#### AI Short Drama

The short-drama workflow is designed around:

```text
project intake
→ story structure
→ characters
→ identity boards
→ scene bible
→ storyboard
→ detailed shots & voice
→ video clips
→ timeline
→ subtitles
→ master
```

The public workspace is being connected to the existing production APIs and readiness checks. Paid execution is not presented as fully ready unless provider, billing, settlement, refund, labeling, and job-execution conditions have passed verification.

#### CangXuan AI Director

CangXuan is the directing layer for:

- story continuity
- character identity
- shot orchestration
- production context
- project memory
- director / foundry data

This area is under active rollout.

#### Website / Application Building

LINGXIFIELD is also developing workflows for:

```text
idea
→ product structure
→ implementation plan
→ code generation
→ component creation
→ deployment preparation
→ iteration
```

This remains an active development area and is not represented as fully production-complete until the execution path is verified end to end.

---

## Product architecture

LINGXIFIELD is designed around shared infrastructure rather than isolated tools.

```text
Tool Registry
File Processing
Image Processing
PDF Processing
Video / Audio Processing
OCR
Web Fetching
AI Gateway
Model Routing
Authentication
Billing
Usage Ledger
Task Queue
Storage
Analytics
```

This lets new tools and agent workflows reuse the same processing, security, billing, and recovery systems.

---

## Multi-model AI

The platform is designed for multi-provider AI routing and user-supplied credentials where appropriate.

Integration directions include:

- OpenAI
- xAI
- Anthropic / Claude
- Google Gemini
- Alibaba / Qwen
- Volcano Engine
- Tencent
- compatible external providers

The repository also includes BYOK-oriented infrastructure for supported providers.

---

## Local-first processing

Where practical, LINGXIFIELD prefers browser-local processing instead of unnecessary server uploads.

Examples include:

- image conversion
- image compression
- hashing
- metadata cleanup
- subtitle timing
- file inspection
- selected PDF operations

Benefits:

- stronger privacy
- lower infrastructure cost
- faster interaction
- reduced unnecessary upload exposure

Heavier AI and production workflows use server-side processing only when required.

---

## Payment, balance, and job correctness

Paid features are treated as transaction systems, not just buttons.

The intended lifecycle is:

```text
order
→ provider confirmation
→ fulfillment
→ balance / entitlement / task
→ execution
→ result
→ recovery path
```

The codebase includes flows for:

- payment creation
- callback / active-query recovery
- account balance crediting
- idempotent fulfillment
- production balance reservation
- actual usage settlement
- failed-job release
- refund-related state
- persistent job records

A successful payment must not depend only on frontend state.

---

## Security focus

LINGXIFIELD has a broad and realistic attack surface:

- authentication and authorization
- file uploads
- PDF / image / video parsing
- server-side URL access
- payment callbacks
- database RPCs
- BYOK secrets
- external AI providers
- task queues
- downloadable outputs
- user-owned assets

Security work includes attention to:

- SSRF
- IDOR / cross-user access
- unsafe file parsing
- authorization flaws
- secret leakage
- dependency risk
- injection paths
- insecure URL fetching
- metadata exposure
- payment verification
- billing consistency
- storage lifecycle
- production regressions

Security auditing and regression prevention are active maintenance concerns.

See [SECURITY.md](SECURITY.md).

---

## Tech stack

- Next.js / React
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Vercel
- browser-local processing where practical
- external AI / media providers where required

---

## Repository structure

```text
app/                 Next.js routes and APIs
components/          shared UI and product components
lib/                 business logic, tools, AI routing, SASI
supabase/            schema and migrations
knowledge/           structured knowledge assets
miniapp/             WeChat mini-program work
docs/                architecture, audits and release notes
scripts/             maintenance and audit scripts
public/              static assets
```

---

## Local development

### Requirements

```text
Node.js 18+
npm or pnpm
```

### Setup

```bash
git clone https://github.com/3078024889/lingxi-quantum.git
cd lingxi-quantum

pnpm install
# or:
# npm install

cp .env.example .env.local

pnpm dev
# or:
# npm run dev
```

Open:

```text
http://localhost:3000
```

Never commit production secrets, `.env.local`, `node_modules`, or local package-store directories.

---

## Common maintenance commands

Check `package.json` for the scripts available in the current branch.

Common commands include:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm audit:security
pnpm audit:sasi
```

The repository also contains validation and audit utilities under `scripts/` and `docs/`.

---

## Production

| Domain | Role |
|---|---|
| [lingxifield.com](https://lingxifield.com) | primary / international site |
| [lingxifield.cn](https://lingxifield.cn) | China-facing domain and WeChat-related flows |

The main web application is deployed through Vercel, with additional infrastructure where required.

---

## Active development

Current maintenance priorities include:

- completing real capability coverage across the tools hub
- consolidating upload and file-processing infrastructure
- strengthening security and regression checks
- expanding Book SASI / source-grounded workflows
- completing SASI production readiness
- strengthening task recovery and billing correctness
- expanding multilingual product coverage
- improving contributor documentation
- improving release and validation automation

---

## Maintenance model

LINGXIFIELD is actively maintained by its primary maintainer across:

- architecture
- frontend
- backend
- database migrations
- AI integration
- payment integration
- deployment
- security review
- debugging
- release validation
- documentation

The repository intentionally keeps operational and maintenance work visible so changes can be reviewed and reproduced.

---

## Contributing

Contributions that improve real capability, reliability, security, testing, documentation, or maintainability are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md).

Good contributions should:

- keep secrets out of the repository
- preserve authorization boundaries
- include failure-path handling
- keep launch-state claims accurate
- reuse shared infrastructure instead of duplicating entire stacks
- explain how the change can be tested

---

## Third-party software, models, and datasets

Before reusing third-party code, models, binaries, or datasets, verify:

- software license
- model license
- dataset license
- commercial-use terms
- attribution requirements
- redistribution requirements

See [docs/THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md).

---

## Open-source status

This repository is intended to be maintained as an open-source project, but the root license file must accurately reflect the maintainer's chosen legal terms.

**A root `LICENSE` file should be added before treating the repository as fully licensed for third-party reuse.**

The project does not silently assume that dependencies, model weights, datasets, or external APIs share the same license as the application code.

---

## Maintainer

Primary maintainer:

**3078024889**

GitHub: https://github.com/3078024889
Repository: https://github.com/3078024889/lingxi-quantum

---

## Project philosophy

> **Reduce the number of steps between an intention and a usable result.**

From a file, image, video, book, research source, website idea, or creative concept, the goal is to move the task forward through a system that is understandable, inspectable, and recoverable.

---

## 中文简介

灵犀场（LINGXIFIELD）是一个持续部署、持续维护的 AI 与数字工具平台。

主要方向包括：

- **实用工具**：PDF、图片、视频、OCR、转录、隐私处理、格式转换等
- **书本 SASI**：把书籍、论文、教材与私人资料变成可检索、可追溯、基于原文回答的知识智能体
- **SASI 创作生产**：AI 短剧、导演工作流、项目资产、任务报价、模型路由、制作结算与交付
- **多模型接入**：按任务连接不同模型与外部能力

项目强调：

**真实能力、真实输入、真实结果、真实支付闭环、真实失败恢复。**

公开页面不会把只有 UI 的功能冒充成已经完成的生产能力。

---

## Links

- Website: https://lingxifield.com
- China site: https://lingxifield.cn
- Repository: https://github.com/3078024889/lingxi-quantum
- Release notes: `CHANGELOG.md` and `docs/`
