# SASI Ask 检索 V1（金库 grounding）

**目的**：聊天回答必须锚定 `cangxuan_knowledge_items` / `cangxuan_characters`，禁止空库装已学。  
**边界**：`trainingEnabled` 保持关闭；Ask 只读检索 + 生成，不写入训练集。

## 调用

### 就绪探测
```http
GET /api/sasi/ask
```
返回：`{ "ok": true, "capability": "ask+foundry-retrieve" }`

### 提问（需登录 + same-origin）
```http
POST /api/sasi/ask
Content-Type: application/json

{ "question": "洛云小尾巴第一集连续性要注意什么？" }
```

成功示例字段：
- `answer` 中文回答
- `citations` `[{ id, title, tier? }]`
- `retrievedCount` 知识+角色命中合计
- `grounded` 是否有知识条目命中
- `generation` `llm` | `deterministic`
- `model?` 如 `xai:grok-3-mini`

错误码：`ORIGIN_REJECTED` / `AUTH_REQUIRED` / `QUESTION_INVALID` / `QUESTION_LENGTH` / `ASK_FAILED` / `ADMIN_CONFIG_MISSING`

## 诚实规则
1. 金库无匹配：必须披露「尚未入库 / 金库暂无匹配」，可给通用方法，但不得声称已从用户库学会。
2. 有匹配：优先依据「金库摘录」作答，可引用标题；不确定处标明边界。
3. 禁止编造通识、法规、片场事实、角色设定。
4. 不做恐吓式稀缺营销；仅当摘录涉及价值交换时，沿「价值先行」。

## 与双轨饲喂关系
- **轨 A（用户/导演金库）**：Foundry 导入 → `cangxuan_*` → **Ask 检索** 直接消费。
- **轨 B（OpenData 通识增产）**：`tongshi-global` / opendata ingest 产出公开可引用青铜条；经审核进入可检索层后，Ask 同样只读消费。
- Ask **不是**训练开关；双轨增产 ≠ 自动 fine-tune。

## 本地自测
1. 浏览器已登录同一 origin。
2. `GET /api/sasi/ask` 应 `ok:true`。
3. 先 `POST /api/sasi/foundry` import 若干导演规则，再 Ask 相关问题，应见 `citations` 非空且答案点名摘录。
4. 清空/无关问题路径：`grounded:false` 且答案含暂无匹配披露。

## LLM 环境（复用既有 key，不新建供应商栈）
优先 `XAI_API_KEY` → `https://api.x.ai/v1/chat/completions`；否则 `OPENAI_API_KEY`。  
可选：`SASI_ASK_MODEL` / `SASI_ASK_LIGHT_MODEL`。无可用 key 时回退确定性「依据金库：…」摘录直出。
