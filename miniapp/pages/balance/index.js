const MESSAGE = '小程序内充值暂未开放。已有余额和订单仍保留，可在账户中查看。'
const { login, request, publicRequest, wxLogin, connectionMessage } = require('../../utils/api')
const expiry = require('../../utils/topup-expiry')
const paymentErrors = require('../../utils/virtual-payment-errors')

Page({
  data: { message: '正在检查充值服务…', paymentNotice: '', loading: true, enabled: false, amounts: [10, 88, 666, 888], selected: '10', custom: '', busy: false, orderId: '', requestId: '', linked: false, accountLoaded: false, balanceText: '', topups: [] },
  async onLoad() {
    this.setData({ paymentNotice: paymentErrors.iosNotice() })
    expiry.expireCheckout()
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (pending) this.setData({ orderId: pending.orderId || '', requestId: pending.requestId || '', selected: pending.selected || '10', custom: pending.custom || '' })
    await this.refreshAvailability()
    await this.refreshAccount()
  },
  async onShow() {
    if (this.data.busy) return
    this.expirePending()
    clearInterval(this._expiryTimer)
    this._expiryTimer = setInterval(() => this.expirePending(), 1000)
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    this.setData({ orderId: pending && pending.orderId || '', requestId: pending && pending.requestId || '' })
    await this.refreshAvailability()
    await this.refreshAccount()
  },
  onHide() { clearInterval(this._expiryTimer) },
  onUnload() { clearInterval(this._expiryTimer) },
  async refreshAccount() {
    try {
      const result = await request('/api/wechat/mini/account-summary')
      this.setData({ accountLoaded: true, linked: result.linked === true, balanceText: (Number(result.balanceFen || 0) / 100).toFixed(2),
        topups: (result.topups || []).map(row => ({ ...row, amountText: Number(row.amount_rmb).toFixed(2), statusText: row.status === 'paid' ? '已到账' : row.status === 'pending' ? '付款确认中' : row.status === 'refunded' ? '已退款' : '已关闭' })) })
    } catch (_) { this.setData({ accountLoaded: false, message: '账户余额暂未加载，请重试。已付款订单仍会核实到账。' }) }
  },
  async connectAccount() {
    if (this.data.busy) return
    try {
      const result = await request('/api/wechat/mini/account-link/start', { method: 'POST' })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (_) { this.setData({ message: '账户连接暂未完成，请重试。' }) }
  },
  expirePending() {
    const pending = wx.getStorageSync('lx_mini_topup_pending')
    if (!this.data.busy && expiry.expireCheckout()) {
      this.setData({ orderId: '', requestId: '', message: '未付款充值已超过5分钟，已从订单列表删除。可以开始新充值；实际付款仍会核实到账。' })
      if (pending && pending.orderId) request('/api/wechat/mini/orders', { method: 'DELETE', data: { orderIds: [pending.orderId] } }).catch(() => {})
    }
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
    if (!result.paid) { this.setData({ message: '付款结果正在核验，订单已保留。若已扣款，请勿重复付款，可查看下方充值进度。' }); return false }
    this.clearPending('充值已到账，可在账户中查看余额。')
    await this.refreshAccount()
    return true
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
  async deletePending() {
    if (this.data.busy || !this.data.orderId) return
    const id = this.data.orderId
    const confirmed = await new Promise(resolve => wx.showModal({ title: '删除充值订单', content: '从当前订单和历史记录中删除。不取消正在进行的付款；实际扣款仍会核实到账。', confirmText: '删除', success: result => resolve(result.confirm), fail: () => resolve(false) }))
    if (!confirmed || this.data.busy || this.data.orderId !== id) return
    this.setData({ busy: true })
    try {
      const result = await request('/api/wechat/mini/orders', { method: 'DELETE', data: { orderIds: [id] } })
      if (!Array.isArray(result.deletedIds) || !result.deletedIds.includes(id)) throw new Error('Deletion not confirmed')
      this.clearPending('旧充值订单已删除，请确认金额后开始新充值。')
    } catch (_) { this.setData({ message: '删除未完成，请重试。' }) }
    finally { this.setData({ busy: false }) }
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
    const paymentCondition = paymentErrors.preflight(minor)
    if (paymentCondition) { this.setData({ message: paymentCondition }); wx.showModal({ title: '苹果支付条件', content: paymentCondition, showCancel: false }); return }
    const value = String(minor / 100)
    this.setData({ busy: true })
    try {
      if (this.data.orderId) { await this.confirmPayment(); return }
      if (typeof wx.requestVirtualPayment !== 'function') { this.setData({ message: '请更新微信后再试。' }); return }
      const requestId = this.data.requestId || (Date.now().toString(16) + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).padEnd(32, '0').slice(0, 32)
      await login()
      await this.refreshAccount()
      if (!this.data.accountLoaded || !this.data.linked) { this.setData({ message: '请先登录并连接灵犀场账户，确认充值到账的账户。' }); return }
      this.setData({ requestId })
      const { code } = await wxLogin()
      const productId = `sasi-balance-${this.data.selected === 'custom' ? 'custom-' : ''}${value}`
      const previous = wx.getStorageSync('lx_mini_topup_pending')
      const createdAt = expiry.timestamp(previous) || Date.now()
      wx.setStorageSync('lx_mini_topup_pending', { requestId, createdAt, selected: this.data.selected, custom: this.data.custom })
      const created = await request('/api/wechat/mini/balance-pay/create', { method: 'POST', data: { productId, code, requestId } })
      this.setData({ orderId: created.orderId })
        wx.setStorageSync('lx_mini_topup_pending', { orderId: created.orderId, requestId, createdAt, selected: this.data.selected, custom: this.data.custom, paymentAttempted: false })
      if (!created.pending && !created.paid) {
        wx.setStorageSync('lx_mini_topup_pending', { ...wx.getStorageSync('lx_mini_topup_pending'), paymentAttempted: true })
        await new Promise((resolve, reject) => wx.requestVirtualPayment({ ...created.payment, success: resolve, fail: reject }))
      }
      this.setData({ message: '购买操作已完成，正在确认余额到账，请勿重复付款。' })
      // Read-only recovery: no second purchase, even if the first status request fails.
      for (let attempt = 0; attempt < 3 && this.data.orderId; attempt++) {
        try { if (await this.confirmPayment()) break }
        catch (_) { this.setData({ message: '购买结果正在核验。请勿重复付款，稍后可检查到账进度。' }) }
        if (attempt < 2 && this.data.orderId) await new Promise(resolve => setTimeout(resolve, 1500))
      }
      await this.refreshAccount()
    } catch (error) {
      const message = paymentErrors.failureMessage(error) + (this.data.orderId ? '若已扣款，请查付款结果，勿重复付款。未付款订单5分钟后自动删除。' : '')
      wx.setStorageSync('lx_mini_last_payment_error', { orderId: this.data.orderId, errCode: error && (error.errCode ?? error.errcode), errMsg: String(error && error.errMsg || '').slice(0, 300), at: Date.now() })
      this.setData({ message })
      if (typeof wx.showModal === 'function') wx.showModal({ title: '充值未完成', content: message, showCancel: false })
    }
    finally { this.setData({ busy: false }) }
  },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openAccount() { wx.switchTab({ url: '/pages/profile/index' }) },
})
