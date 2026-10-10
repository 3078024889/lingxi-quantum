const { request } = require('../../utils/api')
const history = require('../../utils/order-history')
Page({
 data: { loading: true, orders: [], message: '', showHistory: false, historyCount: 0 },
 async onLoad() { await this.load() },
 async onShow() { if (!this.data.loading) await this.load() },
 renderOrders() {
  const hidden = new Set(history.archivedIds())
  const rows = this._orders || []
  this.setData({ orders: rows.filter(row => this.data.showHistory ? hidden.has(row.id) : !hidden.has(row.id)).map(history.present), historyCount: rows.filter(row => hidden.has(row.id)).length })
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
