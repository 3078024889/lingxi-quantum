const { request } = require('../../utils/api')
const history = require('../../utils/order-history')
const expiry = require('../../utils/topup-expiry')
Page({
 data: { loading: true, orders: [], message: '', showHistory: false, historyCount: 0 },
 async onLoad() { await this.load() },
 async onShow() { clearInterval(this._expiryTimer); this._expiryTimer = setInterval(() => this.renderOrders(), 1000); if (!this.data.loading) await this.load() },
 onHide() { clearInterval(this._expiryTimer) },
 onUnload() { clearInterval(this._expiryTimer) },
 renderOrders() {
  expiry.expireCheckout()
  const hidden = new Set(history.archivedIds())
  const rows = (this._orders || []).filter(row => !expiry.expiredOrder(row))
  this.setData({ orders: rows.filter(row => this.data.showHistory ? hidden.has(row.id) : !hidden.has(row.id)).map(history.present), historyCount: rows.filter(row => hidden.has(row.id)).length })
  const expired = (this._orders || []).filter(row => expiry.expiredOrder(row))
  if (expired.length && !this._syncingExpiry && Date.now() >= (this._nextExpirySync || 0)) {
   this._syncingExpiry = true
   this._nextExpirySync = Date.now() + 30000
   request('/api/wechat/mini/orders', { method: 'DELETE', data: { orderIds: expired.slice(0, 100).map(row => row.id) } })
    .then(result => { const removed = new Set(result.deletedIds || []); this._orders = (this._orders || []).filter(row => !removed.has(row.id)) })
    .catch(() => {}).finally(() => { this._syncingExpiry = false })
  }
 },
 toggleHistory() { this.setData({ showHistory: !this.data.showHistory }); this.renderOrders() },
 async load() {
  this.setData({ loading: true })
  try { const d = await request('/api/wechat/mini/orders'); this._orders = Array.isArray(d.orders) ? d.orders : []; this.renderOrders() }
  catch (_) { this.setData({ message: '订单暂时没有加载出来，请稍后再试。' }) }
  finally { this.setData({ loading: false }) }
 },
 archiveOrder(e) {
  if (this.data.loading) return
  const id = String(e.currentTarget.dataset.id || '')
  if (!(this._orders || []).some(row => row.id === id)) return
  history.archive(id, !this.data.showHistory)
  const pending = wx.getStorageSync('lx_mini_topup_pending')
  if (!this.data.showHistory && pending && pending.orderId === id) wx.removeStorageSync('lx_mini_topup_pending')
  this.renderOrders()
  this.setData({ message: this.data.showHistory ? '订单已恢复显示。' : '已移入历史记录。此操作不取消付款，已付款订单仍会核实到账。' })
 },
 async deleteOrder(e) { await this.deleteOrders([String(e.currentTarget.dataset.id || '')]) },
 async clearHistory() { await this.deleteOrders(this.data.orders.map(row => row.id)) },
 async deleteOrders(ids) {
  if (this.data.loading || !ids.length || ids.some(id => !(this._orders || []).some(row => row.id === id))) return
  const confirmed = await new Promise(resolve => wx.showModal({ title: ids.length > 1 ? '清空历史订单' : '删除订单', content: '删除后，当前列表和历史记录均不再显示。不影响已付款到账、退款处理；此操作不会取消正在进行的付款。', confirmText: '删除', success: result => resolve(result.confirm), fail: () => resolve(false) }))
  if (!confirmed || this.data.loading) return
  this.setData({ loading: true })
  try {
   const result = await request('/api/wechat/mini/orders', { method: 'DELETE', data: { orderIds: ids } })
   if (!Array.isArray(result.deletedIds) || ids.some(id => !result.deletedIds.includes(id))) throw new Error('Deletion not confirmed')
   const deleted = new Set(result.deletedIds)
   this._orders = (this._orders || []).filter(row => !deleted.has(row.id))
   const pending = wx.getStorageSync('lx_mini_topup_pending')
   if (pending && deleted.has(pending.orderId)) wx.removeStorageSync('lx_mini_topup_pending')
   this.renderOrders(); this.setData({ message: '订单已删除，历史记录也不再显示。' })
  } catch (_) { this.setData({ message: '删除未完成，请重试。' }) }
  finally { this.setData({ loading: false }) }
 },
 async confirmVirtual(e) {
  if (this.data.loading) return
  const id = String(e.currentTarget.dataset.id || '')
  this.setData({ loading: true, message: '' })
  try {
   const result = await request(`/api/wechat/mini/tool-pay/status?orderId=${encodeURIComponent(id)}`)
   this.setData({ message: result.paid ? '付款已确认。' : result.closed === true ? '微信已确认订单关闭且未付款，订单已取消。' : '付款尚未确认。可以保留记录，开始一笔新的充值。' })
   if (result.paid || result.closed === true) {
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (pending && pending.orderId === id) wx.removeStorageSync('lx_mini_topup_pending')
   }
  } catch (_) { this.setData({ message: '暂时无法查单。订单保留，可稍后重试；移入历史不会取消付款。' }) }
  finally { this.setData({ loading: false }) }
  await this.load()
 },
 openBalance() { wx.navigateTo({ url: '/pages/balance/index' }) },
})
