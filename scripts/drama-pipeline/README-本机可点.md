# 本机可点 · SASI 八步短剧管线

## 最快点法（不启网站）
```
cd C:\Users\30780\Desktop\lingxi-drama-eight-step
node eight-step-automaton.mjs
```
输出精分镜 + Seedance/即梦风格可执行词（同构 demo）。

## 焊进 lingxi-quantum（站点可点）
把下列文件拷进仓对应位置后 `npm run dev`：
- `drama-eight-step.ts` → `lib/sasi/drama-eight-step.ts`
- `route.ts` → `app/api/sasi/drama/eight-step/route.ts`
- `eight-step-automaton.mjs` → `scripts/drama-pipeline/eight-step-automaton.mjs`

可点：
- GET/POST `http://localhost:3000/api/sasi/drama/eight-step`
- 或 `npm run drama:eight-step`（需 package.json 已加 script）

7–8 成片：`createAssemblyHook` 已留装配接口（generateClips/stitchTimeline/exportMaster），待接 submitSasiVideo。
