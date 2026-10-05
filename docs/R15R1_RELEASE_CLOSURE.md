# 下一次 BUILD=PASS 后的提交部署闭环

本轮不自动 git commit/push，因为用户本地 repo 尚未验证 R15R1 build。

R15R1 一旦真实输出：
- `SASI_DETACHED_WORKER_FOUNDATION_R15R1=PASS`
- `BUILD=PASS`
- `READY_FOR_GIT_REVIEW=YES`

下一步必须先做 Release Closure，而不是继续叠 R16：

1. `git status --short`
2. 审计所有未提交文件，确认没有 `_local`、backup、secret、临时包混入
3. `git diff --check`
4. 最终 `pnpm exec tsc --noEmit` / production build（若安装器已覆盖则核对日志）
5. 一次性 commit 当前 R8→R15R1 累积正式代码
6. push main（或当前正式分支）
7. Vercel production deploy
8. 验证 lingxifield.com / .cn alias 与关键 SASI route
9. 再开始 R16 Simple Detached UX

这样避免未提交变化继续堆积。
