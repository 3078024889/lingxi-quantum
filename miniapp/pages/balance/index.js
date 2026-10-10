const MESSAGE = '小程序内充值暂未开放。已有余额和订单仍保留，可在账户中查看。'
const { request, publicRequest, wxLogin } = require('../../utils/api')

Page({
  data: { message: MESSAGE, enabled: false, amounts: [10, 88, 666, 888], selected: '10', custom: '', busy: false, orderId: '', requestId: '' },
  async onLoad() {
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (pending) this.setData({ orderId: pending.orderId || '', requestId: pending.requestId || '', selected: pending.selected || '10', custom: pending.custom || '' })
    try { const result = await publicRequest('/api/wechat/mini/balance-pay/availability'); this.setData({ enabled: result.enabled === true, message: result.enabled ? '充值人民币余额，可用于支持余额支付的工具。' : MESSAGE }) } catch (_) {}
  },
  choose(e) { if (!this.data.busy && !this.data.orderId) this.setData({ selected: String(e.currentTarget.dataset.amount), requestId: '' }) },
  input(e) { if (!this.data.busy && !this.data.orderId) this.setData({ custom: e.detail.value, requestId: '' }) },
  async confirmPayment() {
    const result = await request(`/api/wechat/mini/tool-pay/status?orderId=${encodeURIComponent(this.data.orderId)}`)
    if (!result.paid) { this.setData({ message: '付款结果仍在确认，请稍后查看订单，不要重复付款。' }); return }
    wx.removeStorageSync('lx_mini_topup_pending')
    this.setData({ message: '充值已到账，可在账户中查看余额。', orderId: '', requestId: '' })
  },
  async pay() {
    if (!this.data.enabled) { this.setData({ message: MESSAGE }); return }
    if (this.data.busy) return
    const value = this.data.selected === 'custom' ? this.data.custom : this.data.selected
    if (!/^[1-9][0-9]{1,4}$/.test(value) || Number(value) > 10000 || Number(value) < 10) { this.setData({ message: '请输入10至10000的整数金额。' }); return }
    this.setData({ busy: true })
    try {
      if (this.data.orderId) { await this.confirmPayment(); return }
      if (typeof wx.requestVirtualPayment !== 'function') { this.setData({ message: '请更新微信后再试。' }); return }
      const requestId = this.data.requestId || (Date.now().toString(16) + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).padEnd(32, '0').slice(0, 32)
      this.setData({ requestId })
      const { code } = await wxLogin()
      const productId = `sasi-balance-${this.data.selected === 'custom' ? 'custom-' : ''}${value}`
      wx.setStorageSync('lx_mini_topup_pending', { requestId, selected: this.data.selected, custom: this.data.custom })
      const created = await request('/api/wechat/mini/balance-pay/create', { method: 'POST', data: { productId, code, requestId } })
      this.setData({ orderId: created.orderId })
      wx.setStorageSync('lx_mini_topup_pending', { orderId: created.orderId, requestId, selected: this.data.selected, custom: this.data.custom })
      if (!created.pending && !created.paid) await new Promise((resolve, reject) => wx.requestVirtualPayment({ ...created.payment, success: resolve, fail: reject }))
      await this.confirmPayment()
    } catch (error) { this.setData({ message: this.data.orderId ? '请在订单中确认结果，不要重复付款。' : (error && error.data && error.data.error) || '充值未能开始，请稍后再试。' }) }
    finally { this.setData({ busy: false }) }
  },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openAccount() { wx.switchTab({ url: '/pages/profile/index' }) },
})
