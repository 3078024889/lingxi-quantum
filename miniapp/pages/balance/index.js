const MESSAGE = '小程序内充值暂未开放。已有余额和订单仍保留，可在账户中查看。'
const { login, request, publicRequest, wxLogin, connectionMessage } = require('../../utils/api')
const expiry = require('../../utils/topup-expiry')

Page({
  data: { message: '正在检查充值服务…', loading: true, enabled: false, amounts: [10, 88, 666, 888], selected: '10', custom: '', busy: false, orderId: '', requestId: '' },
  async onLoad() {
    expiry.expireCheckout()
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (pending) this.setData({ orderId: pending.orderId || '', requestId: pending.requestId || '', selected: pending.selected || '10', custom: pending.custom || '' })
    await this.refreshAvailability()
  },
  async onShow() {
    if (this.data.busy) return
    this.expirePending()
    clearInterval(this._expiryTimer)
    this._expiryTimer = setInterval(() => this.expirePending(), 1000)
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    this.setData({ orderId: pending && pending.orderId || '', requestId: pending && pending.requestId || '' })
    await this.refreshAvailability()
  },
  onHide() { clearInterval(this._expiryTimer) },
  onUnload() { clearInterval(this._expiryTimer) },
  expirePending() {
    if (!this.data.busy && expiry.expireCheckout()) this.setData({ orderId: '', requestId: '', message: '上一笔充值已超过5分钟，已移出当前付款流程。可以开始新充值，付款记录仍可核实。' })
  },
  async refreshAvailability() {
    if (this._checkingAvailability) return
    this._checkingAvailability = true
    this.setData({ loading: true })
    try {
      const result = await publicRequest('/api/wechat/mini/balance-pay/availability')
      if (typeof result.enabled !== 'boolean') throw new Error('Invalid availability')
      this.setData({ enabled: result.enabled, message: result.enabled ? (this.data.orderId ? '上一笔充值尚未确认。可以查单，或将它保留在订单中后开始一笔新的充值。' : '充值人民币余额，可用于支持余额支付的工具。') : MESSAGE })
    } catch (error) {
      this.setData({ enabled: false, message: connectionMessage(error) })
      console.warn('[mini recharge availability]', { statusCode: error && error.statusCode, code: error && error.code })
    }
    finally { this._checkingAvailability = false; this.setData({ loading: false }) }
  },
  choose(e) { if (!this.data.busy) this.setData({ selected: String(e.currentTarget.dataset.amount) }) },
  input(e) { if (!this.data.busy) this.setData({ custom: e.detail.value }) },
  clearPending(message) {
    wx.removeStorageSync('lx_mini_topup_pending')
    this.setData({ message, orderId: '', requestId: '' })
  },
  async confirmPayment() {
    const result = await request(`/api/wechat/mini/tool-pay/status?orderId=${encodeURIComponent(this.data.orderId)}`)
    if (result.closed === true && result.status === 'canceled' && result.paid === false) {
      this.clearPending('上一笔充值已关闭且未付款，可以按当前金额重新充值。'); return
    }
    if (!result.paid) { this.setData({ message: '上一笔付款尚未确认，记录已保留。可以继续查单，也可以选择开始新充值。' }); return }
    this.clearPending('充值已到账，可在账户中查看余额。')
  },
  async startNew() {
    if (this.data.busy || !this.data.orderId) return
    const previousId = this.data.orderId
    const confirmed = await new Promise(resolve => wx.showModal({
      title: '开始新充值',
      content: '上一笔订单会保留，不会被取消。如果它已付款，后续核实后仍会到账。新充值是另外一笔付款，请勿为补确认而重复充值。',
      confirmText: '开始新充值', success: result => resolve(result.confirm), fail: () => resolve(false),
    }))
    if (!confirmed || this.data.busy || this.data.orderId !== previousId) return
    // Release the checkout slot, retaining the server order and its settlement.
    this.clearPending('旧订单已保留在我的订单中，请确认金额后开始新的充值。')
  },
  async pay() {
    if (this.data.busy) return
    this.expirePending()
    // Check an existing order even when availability is temporarily unavailable,
    // and before validating a newly edited amount.
    if (this.data.orderId) {
      this.setData({ busy: true })
      try { await this.confirmPayment() }
      catch (_) { this.setData({ message: '暂时无法确认上一笔充值，请重试或查看已有订单。' }) }
      finally { this.setData({ busy: false }) }
      return
    }
    if (!this.data.enabled) { this.setData({ message: this.data.loading ? '正在连接充值服务，请稍候。' : '充值服务尚未连接，请点击重新检查充值服务。' }); return }
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (this.data.requestId && pending && !pending.orderId &&
        (pending.selected !== this.data.selected || pending.custom !== this.data.custom)) {
      this.setData({ selected: pending.selected, custom: pending.custom, message: '上一笔充值准备结果尚未确认，已恢复原金额。请先重试确认，避免重复下单。' }); return
    }
    const raw = this.data.selected === 'custom' ? this.data.custom : this.data.selected
    if (!/^(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$/.test(raw)) { this.setData({ message: '请输入有效金额，最多两位小数。' }); return }
    const [whole, fraction = ''] = raw.split('.')
    const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
    if (minor < 1 || minor > 1000000) { this.setData({ message: '金额须大于零，单笔最高10000元。' }); return }
    const value = String(minor / 100)
    this.setData({ busy: true })
    try {
      if (this.data.orderId) { await this.confirmPayment(); return }
      if (typeof wx.requestVirtualPayment !== 'function') { this.setData({ message: '请更新微信后再试。' }); return }
      const requestId = this.data.requestId || (Date.now().toString(16) + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).padEnd(32, '0').slice(0, 32)
      this.setData({ requestId })
      await login()
      const { code } = await wxLogin()
      const productId = `sasi-balance-${this.data.selected === 'custom' ? 'custom-' : ''}${value}`
      const previous = wx.getStorageSync('lx_mini_topup_pending')
      const createdAt = expiry.timestamp(previous) || Date.now()
      wx.setStorageSync('lx_mini_topup_pending', { requestId, createdAt, selected: this.data.selected, custom: this.data.custom })
      const created = await request('/api/wechat/mini/balance-pay/create', { method: 'POST', data: { productId, code, requestId } })
      this.setData({ orderId: created.orderId })
      wx.setStorageSync('lx_mini_topup_pending', { orderId: created.orderId, requestId, createdAt, selected: this.data.selected, custom: this.data.custom })
      if (!created.pending && !created.paid) await new Promise((resolve, reject) => wx.requestVirtualPayment({ ...created.payment, success: resolve, fail: reject }))
      await this.confirmPayment()
    } catch (error) {
      const code = Number(error && (error.errCode || error.errcode))
      const restricted = [-15017, -15019].includes(code)
      const message = restricted ? '微信暂时限制了商家收款，当前无法完成充值。已有余额和订单保留。' : this.data.orderId ? '付款尚未确认，请在订单中查看结果，不要重复付款。' : (error && error.data && error.data.error) || '充值未能开始，请检查网络或更新微信后重试。'
      this.setData({ message })
      if (typeof wx.showModal === 'function') wx.showModal({ title: '充值未完成', content: message, showCancel: false })
    }
    finally { this.setData({ busy: false }) }
  },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openAccount() { wx.switchTab({ url: '/pages/profile/index' }) },
})
