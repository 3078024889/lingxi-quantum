# 日跑 / 离线工作 — 工程硬规矩（2026-09-19）

## 教训
`engine/refresh_seat.py` **只刷新座位 HTML 时间戳**，读的是已有 `last_arena.json` / `last_mother.json`。
没有跑日循环时：日期会对，路数/名单/准度仍是旧的（例如停在 9-17 的 33 路全 100%）。

**有脚本 ≠ 会自动跑。必须挂 Windows 计划任务。**

## 正确日链（离线可跑）
1. `engine/daily_sense_cycle.py` — 感官 → 世界模型 → mother_search → membrane/qnet
2. `engine/run_copernicus.py arena` — 更新 `last_arena.json`
3. `engine/refresh_seat.py` — 再刷座位（此时才有新结果）

入口：`daily-offline-cycle.bat`  
日志：`engine/_daily_offline_cycle.log`

## 计划任务
- `CopernicusTwentyWatts-DailyOfflineCycle` — 每天 **08:10** 跑全日链（本机开机即可；不必登录交互）
- `CopernicusTwentyWatts-DailyRefreshSeat` — 仅座位戳（保留作兜底，**不能替代**日链）

## 诚实口径
- 座位「今日戳」≠ 今日实验已完成
- 页数/采集量 ≠ 学成
- 对外只报「日链是否跑通 + last_* 时间」
