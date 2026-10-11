// Presentation preferences only; financial records remain on the server.
const KEY = 'lx_mini_order_history'
function archivedIds() {
  const value = wx.getStorageSync(KEY)
  return Array.isArray(value) ? value.filter(id => typeof id === 'string') : []
}
function archive(id, hidden = true) {
  const ids = archivedIds().filter(value => value !== id)
  if (hidden) ids.push(id)
  wx.setStorageSync(KEY, ids.slice(-500))
}
function present(order) {
  const id = order.product_id || ''
  const date = new Date(order.created_at)
  const pad = value => String(value).padStart(2, '0')
  return { ...order,
    title: /^(sasi|ai)(-usd)?-balance-/.test(id) ? '余额充值' : id.startsWith('toolquote:') ? '工具使用' : '历史服务订单',
    statusText: ({ paid: '已支付', pending: '待付款确认', refunded: '已退款', canceled: '已取消', failed: '未完成' })[order.status] || '处理中',
    amountText: `${order.currency === 'USD' ? '$' : '¥'}${Number(order.currency === 'USD' ? order.amount_usd : order.amount_rmb).toFixed(2)}`,
    dateText: Number.isFinite(date.getTime()) ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}` : '',
  }
}
module.exports = { archivedIds, archive, present }
