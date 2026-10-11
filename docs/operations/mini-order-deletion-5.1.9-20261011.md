# 5.1.9 experience acceptance — 2026-10-11

Changes:
- Customer DELETE /api/wechat/mini/orders supports 1–100 owned order IDs, including paid/refunded/history orders. Returns success only after persisted deletion; no ownership bypass or local fake-success fallback.
- orders.user_deleted_at is durable across refresh/devices and both native list modes. The underlying order/payment identifiers are retained for fulfillment/refunds; this is deletion from customer order lists, not destruction of accounting evidence.
- Pending CNY/USD topups older than five minutes disappear from both lists. Active native pages synchronize deletion; on the next authenticated order request the server also cleans expired topups. Offline/no-request periods do not require a five-minute cron. Checkout intent is released without a new automatic charge.
- Delete current recharge and clear history controls; existing optional archive remains separate.
- Order dates use device local time, replacing UTC truncation.
- iOS: minimum total CNY1, iOS15, WeChat8.0.68 preflight; region requirements shown before payment; actual callback errCode preserved. No inferred App Store country from language and no region API exists here.

Confirmed blocker:
- User confirmed Hong Kong/other App Store account. WeChat's official current virtual-payment documentation requires mainland China App Store accounts, even when currency is CNY.
- MP basic settings: Apple IAP 已开通; offerId1450617775; lx_balance_custom at CNY1 present in published list dated2026-10-10.
- A mainland account still requires real-device payment/fulfillment validation; no successful agent payment claimed.
- Native retired purchase audit passes: legacy /pay/create returns410, old catalog removed. MP published legacy rpt_stellar_trace still exists; inspected UI offered only edit/view online, no delete/unpublish. Do not claim this platform record was removed.

Primary reference:
https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html
Saved official content: artifacts/wechat-search-recovery-20261009/virtual-payment-official.html

Acceptance (before review):
1. Open 5.1.9 experience, account connection, order refresh.
2. Delete one current order; delete refunded/history order; clear history; refresh/reopen verify absence.
3. Leave new unpaid recharge five minutes: absent from both lists, next recharge available.
4. Android custom0.01/1/12.34; iOS at least1 using mainland App Store account, iOS15+/WeChat8.0.68+.
5. Successful real payment credits exactly once; cancel/failure never credits; callbacks still work for customer-deleted order.

Do not submit review until the user confirms real-device acceptance.
