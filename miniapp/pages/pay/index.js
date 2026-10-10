const { request, wxLogin } = require('../../utils/api')
Page({
  data: { quoteId: '', quote: null, orderId: '', busy: false, paid: false, message: '' },
  async onLoad(options) {
    const quoteId = String(options.quoteId || '')
    this.setData({ quoteId })
    if (!quoteId) { this.setData({ message: '请返回工具重新确认价格。' }); return }
    try { this.setData({ quote: await request(`/api/wechat/mini/tool-pay/quote?quoteId=${encodeURIComponent(quoteId)}`) }) }
    catch (_) { this.setData({ message: '价格信息未能加载，请返回工具重新确认。' }) }
  },
  async confirmPayment() {
    const result = await request(`/api/wechat/mini/tool-pay/status?orderId=${encodeURIComponent(this.data.orderId)}`)
    if (!result.paid) { this.setData({ message: '付款结果正在确认，请稍后再次查看，不要重复付款。' }); return false }
    this.setData({ paid: true, message: '付款已确认，可以返回工具继续使用。' })
    wx.showToast({ title: '付款已确认', icon: 'success' })
    return true
  },
  async pay() {
    if (this.data.busy || this.data.paid || !this.data.quoteId || !this.data.quote) return
    this.setData({ busy: true, message: '' })
    try {
      if (this.data.orderId) { await this.confirmPayment(); return }
      if (typeof wx.requestVirtualPayment !== 'function') { this.setData({ message: '请更新微信后使用虚拟支付。' }); return }
      const { code } = await wxLogin()
      const created = await request('/api/wechat/mini/tool-pay/create', { method: 'POST', data: { quoteId: this.data.quoteId, code } })
      if (created.paid) { this.setData({ paid: true, message: '付款已确认，请返回工具继续使用。' }); return }
      this.setData({ orderId: created.orderId })
      await new Promise((resolve, reject) => wx.requestVirtualPayment({ ...created.payment, success: resolve, fail: reject }))
      await this.confirmPayment()
    } catch (error) {
      this.setData({ message: this.data.orderId ? '支付结果尚未确认，请点击确认结果或查看订单，不要重复付款。' :
        (error && error.data && error.data.error) || '支付未能开始，请稍后重试。' })
    } finally { this.setData({ busy: false }) }
  },
  async payBalance() {
    if (this.data.busy || this.data.paid || this.data.orderId || !this.data.quoteId || !this.data.quote) return
    this.setData({ busy: true, message: '' })
    try {
      const result = await request('/api/wechat/mini/tool-pay/balance', { method: 'POST', data: { quoteId: this.data.quoteId } })
      if (result.ok && result.paid) {
        this.setData({ paid: true, message: '余额付款已确认，可以返回工具继续使用。' })
        wx.showToast({ title: '付款已确认', icon: 'success' })
      } else { this.setData({ message: '付款结果尚未确认，请查看订单后重试。' }) }
    } catch (error) {
      this.setData({ message: (error && error.data && error.data.error) || '余额支付结果尚未确认，请查看订单后重试。' })
    } finally { this.setData({ busy: false }) }
  },
  recharge() { wx.navigateTo({ url: '/pages/balance/index' }) },
  back() { wx.navigateBack() },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
})
