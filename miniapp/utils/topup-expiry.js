const TTL = 5 * 60 * 1000
const KEY = 'lx_mini_topup_pending'
function timestamp(pending) {
  if (!pending) return 0
  const explicit = Number(pending.createdAt)
  if (Number.isFinite(explicit) && explicit > 0) return explicit
  // Older clients started their request ID with Date.now().toString(16).
  const legacy = /^[0-9a-f]{32}$/.test(pending.requestId || '') ? parseInt(pending.requestId.slice(0, 11), 16) : 0
  return legacy >= Date.UTC(2020, 0, 1) && legacy <= Date.now() ? legacy : 0
}
function expireCheckout(now = Date.now()) {
  const pending = wx.getStorageSync(KEY)
  if (pending && (pending.paymentAttempted || (pending.orderId && pending.paymentAttempted !== false))) return false
  const started = timestamp(pending)
  if (!started || now - started < TTL) return false
  // Preserve a recovery reference; never delete a financial record on a timer.
  const stored = wx.getStorageSync('lx_mini_expired_checkouts')
  const previous = Array.isArray(stored) ? stored : []
  wx.setStorageSync('lx_mini_expired_checkouts', previous.concat([pending]).slice(-100))
  wx.removeStorageSync(KEY)
  return true
}
function expiredOrder(order, now = Date.now()) {
  const created = Date.parse(order.created_at)
  return order.providerConfirmedUnpaid === true && order.status === 'pending' && /^(sasi|ai)(-usd)?-balance-/.test(order.product_id || '') && Number.isFinite(created) && now - created >= TTL
}
module.exports = { TTL, timestamp, expireCheckout, expiredOrder }
