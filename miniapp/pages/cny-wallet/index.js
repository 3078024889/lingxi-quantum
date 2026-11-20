const { login, request, publicRequest, wxLogin } = require('../../utils/api')

const PENDING_KEY = 'lx_mini_cny_jsapi_pending_v1'
const PRESETS = ['10', '88', '666', '888']

function makeRequestId() {
  const time = Date.now().toString(16).padStart(12, '0').slice(-12)
  const random = (Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).padEnd(20, '0')
  return (time + random).slice(0, 32)
}
function parseAmount(raw) {
  if (!/^(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$/.test(raw)) return null
  const [whole, fraction = ''] = raw.split('.')
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(minor) || minor < 1 || minor > 1000000) return null
  return { minor, text: (minor / 100).toFixed(2) }
}
function paymentError(error) {
  const message = String(error && error.errMsg || '')
  if (/requestPayment:fail\s*cancel/i.test(message) || /cancel/i.test(message)) return '已取消付款，原订单仍保留。可继续支付或核验，不会重复创建订单。'
  if (/jsapi has no permission|支付权限/i.test(message)) return '小程序尚未取得微信商户支付权限，请在微信公众平台核验支付开通状态。'
  if (/appid|openid|身份不一致/i.test(message)) return '微信支付身份校验未通过，请重新登录后核验原订单。'
  return '微信支付暂未完成。系统正在核验原订单，请勿重复充值。'
}

Page({
  data: {
    amounts: [10, 88, 666, 888],
    selected: '10',
    custom: '',
    amountText: '10.00',
    enabled: false,
    loading: true,
    busy: false,
    accountLoaded: false,
    linked: false,
    accountLabel: '',
    balanceText: '0.00',
    refundableText: '0.00',
    orderId: '',
    requestId: '',
    canResumePayment: false,
    topups: [],
    message: '正在检查人民币充值服务…',
  },

  onLoad(options = {}) {
    this.restorePending()
    const amount = String(options.amount || '')
    if (amount) this.applyAmount(amount)
    void this.refreshAll()
  },

  onShow() {
    if (this.data.orderId && !this.data.busy) void this.confirmPayment()
  },

  restorePending() {
    const pending = wx.getStorageSync(PENDING_KEY)
    if (!pending) return
    this.setData({
      orderId: pending.orderId || '',
      requestId: pending.requestId || '',
      selected: pending.selected || '10',
      custom: pending.custom || '',
      amountText: pending.amountText || (pending.selected === 'custom' ? pending.custom : pending.selected) || '10',
    })
  },

  applyAmount(raw) {
    if (PRESETS.includes(raw)) {
      this.setData({ selected: raw, custom: '', amountText: Number(raw).toFixed(2) })
      return
    }
    const parsed = parseAmount(raw)
    if (parsed) this.setData({ selected: 'custom', custom: parsed.text, amountText: parsed.text })
  },

  async refreshAll() {
    await Promise.all([this.refreshAvailability(), this.refreshAccount()])
    if (this.data.orderId) await this.confirmPayment()
    else if (this.data.requestId) this.setData({ message: '发现一笔尚未恢复的充值请求。点击“恢复上次充值”，系统将沿用原请求编号，不会新建重复订单。' })
  },

  async refreshAvailability() {
    this.setData({ loading: true })
    try {
      const result = await publicRequest('/api/wechat/mini/cny-topup/availability')
      const disabledMessages = {
        TOPUPS_DISABLED: '小程序人民币商户支付尚未开放。',
        PRODUCTION_ENV_REQUIRED: '当前环境未开放真实人民币支付。',
        APP_ID_MISMATCH: '小程序 AppID 与微信支付商户绑定配置不一致，已阻止下单。',
        PROVIDER_CONFIG_MISSING: '微信商户 JSAPI 配置不完整，暂不能发起充值。',
      }
      this.setData({
        enabled: result.enabled === true,
        message: result.enabled === true
          ? '微信商户支付已就绪。使用小程序原生支付，到账以服务端回调和查单为准。'
          : (disabledMessages[result.reason] || '小程序人民币商户支付暂未开放，请稍后重新检查。'),
      })
    } catch (_) {
      this.setData({ enabled: false, message: '暂时无法连接人民币充值服务，请检查网络后重试。' })
    } finally { this.setData({ loading: false }) }
  },

  async refreshAccount() {
    try {
      const result = await request('/api/wechat/mini/account-summary')
      this.setData({
        accountLoaded: true,
        linked: result.linked === true,
        accountLabel: result.accountLabel || '',
        balanceText: (Number(result.balanceFen || 0) / 100).toFixed(2),
        refundableText: (Number(result.refundableFen || 0) / 100).toFixed(2),
        topups: (result.topups || []).slice(0, 4).map(row => ({
          id: row.id,
          amountText: Number(row.amount_rmb).toFixed(2),
          statusText: row.status === 'paid' ? '已到账' : row.status === 'pending' ? '核验中' : row.status === 'refunded' ? '已退款' : '已关闭',
        })),
      })
      return result
    } catch (_) {
      this.setData({ accountLoaded: false, linked: false, accountLabel: '', message: '账户余额暂未加载，请重新加载账户信息。' })
      return null
    }
  },

  async connectAccount() {
    if (this.data.busy) return
    try {
      const result = await request('/api/wechat/mini/account-link/start', { method: 'POST' })
      wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent(result.path) })
    } catch (_) {
      this.setData({ message: '账户连接暂未完成，请重试。' })
    }
  },

  choose(event) {
    if (this.data.busy || this.data.orderId || this.data.requestId) return
    const value = String(event.currentTarget.dataset.amount || '')
    this.setData({ selected: value, custom: '', amountText: Number(value).toFixed(2) })
  },

  chooseCustom() {
    if (this.data.busy || this.data.orderId || this.data.requestId) return
    this.setData({ selected: 'custom', custom: '', amountText: '' })
  },

  input(event) {
    if (this.data.busy || this.data.orderId || this.data.requestId) return
    const custom = String(event.detail.value || '')
    const parsed = parseAmount(custom)
    this.setData({ custom, amountText: parsed ? parsed.text : '' })
  },

  currentAmount() {
    const raw = this.data.selected === 'custom' ? String(this.data.custom || '').trim() : this.data.selected
    return parseAmount(raw)
  },

  savePending(pending) {
    wx.setStorageSync(PENDING_KEY, pending)
    this.setData({
      requestId: pending.requestId || '',
      orderId: pending.orderId || '',
      selected: pending.selected || this.data.selected,
      custom: pending.custom || '',
    })
  },

  clearPending(message) {
    wx.removeStorageSync(PENDING_KEY)
    this.setData({ orderId: '', requestId: '', canResumePayment: false, message })
  },

  async confirmPayment() {
    if (!this.data.orderId || this._checkingOrder) return null
    this._checkingOrder = true
    try {
      const result = await request('/api/wechat/mini/cny-topup/status?orderId=' + encodeURIComponent(this.data.orderId))
      if (result.paid === true || result.status === 'paid') {
        this.clearPending('微信订单已核验，人民币余额已到账。')
        await this.refreshAccount()
        return { paid: true }
      }
      if (result.closed === true) {
        this.clearPending('微信已确认上一笔订单未付款并关闭，可以重新选择金额。')
        return { closed: true }
      }
      if (result.providerConfirmedUnpaid === true && result.payment) {
        this.setData({ canResumePayment: true, message: '微信已确认原订单尚未付款，可继续完成同一笔支付，不会创建新订单。' })
        return { paid: false, payment: result.payment }
      }
      this.setData({
        canResumePayment: false,
        message: '付款结果仍在核验。若已扣款，余额会在服务端确认后入账；请勿重复付款。',
      })
      return { paid: false }
    } catch (_) {
      this.setData({ canResumePayment: false, message: '暂时无法核验上一笔订单。订单已保留，请稍后重试，不要再次充值。' })
      return null
    } finally { this._checkingOrder = false }
  },

  async pay() {
    if (this.data.busy) return
    if (this.data.orderId) {
      const result = await this.confirmPayment()
      if (result && result.payment) await this.invokePayment(result.payment)
      return
    }
    if (this.data.requestId) { await this.recoverPending(); return }
    if (!this.data.enabled) {
      this.setData({ message: this.data.loading ? '正在连接充值服务，请稍候。' : '人民币商户支付通道尚未开放，请重新检查服务。' })
      return
    }
    const amount = this.currentAmount()
    if (!amount) { this.setData({ message: '请输入有效金额，最多两位小数。' }); return }
    if (!this.data.accountLoaded) { this.setData({ message: '请先重新加载账户余额，确认到账账户。' }); return }
    if (!this.data.linked) { this.setData({ message: '请先连接灵犀场账户，确认充值到账账户。' }); return }
    if (typeof wx.requestPayment !== 'function') {
      this.setData({ message: '当前微信版本不支持小程序商户支付，请更新微信后重试。' })
      return
    }
    await this.submitPayment(makeRequestId(), amount)
  },

  async recoverPending() {
    if (this.data.busy || !this.data.requestId) return
    const amount = this.currentAmount()
    if (!amount) { this.setData({ message: '上次充值金额信息不完整，请联系支持处理。' }); return }
    await this.submitPayment(this.data.requestId, amount)
  },

  async invokePayment(payment) {
    if (!payment || this._paymentInFlight) return
    this._paymentInFlight = true
    this.setData({ busy: true, canResumePayment: false })
    try {
      await new Promise((resolve, reject) => wx.requestPayment({
        timeStamp: payment.timeStamp,
        nonceStr: payment.nonceStr,
        package: payment.package,
        signType: payment.signType || 'RSA',
        paySign: payment.paySign,
        success: resolve,
        fail: reject,
      }))
      this.setData({ message: '微信收银台已返回，正在向服务端核验订单与余额。' })
    } catch (error) {
      this.setData({ message: paymentError(error) })
    } finally {
      this._paymentInFlight = false
      this.setData({ busy: false })
    }
    await this.confirmPayment()
  },

  async submitPayment(requestId, amount) {
    if (this.data.busy) return
    this.setData({ busy: true })
    const existing = wx.getStorageSync(PENDING_KEY) || {}
    const pending = {
      ...existing,
      requestId,
      selected: this.data.selected,
      custom: this.data.custom,
      amountText: amount.text,
      createdAt: existing.createdAt || Date.now(),
    }
    this.savePending(pending)
    try {
      await login()
      const account = await this.refreshAccount()
      if (!account || account.linked !== true) {
        this.setData({ message: '到账账户未连接。请先完成账户连接，不会创建充值订单。' })
        return
      }
      const { code } = await wxLogin()
      const productId = this.data.selected === 'custom'
        ? 'sasi-balance-custom-' + amount.text
        : 'sasi-balance-' + this.data.selected
      const created = await request('/api/wechat/mini/cny-topup/create', {
        method: 'POST',
        data: { productId, code, requestId },
      })
      if (created.orderId) {
        pending.orderId = created.orderId
        this.savePending(pending)
      }
      if (created.paid === true) {
        this.clearPending('上一笔充值已核验到账。')
        await this.refreshAccount()
        return
      }
      if (created.closed === true) {
        this.clearPending('上一笔未付款订单已关闭，可以重新充值。')
        return
      }
      if (created.payment) {
        this.setData({ busy: false })
        await this.invokePayment(created.payment)
        return
      }
      await this.confirmPayment()
    } catch (error) {
      const orderId = error && error.data && error.data.orderId
      if (orderId) {
        pending.orderId = orderId
        this.savePending(pending)
        await this.confirmPayment()
      } else {
        this.setData({ message: (error && error.data && error.data.error) || '充值订单准备未完成。请重试；系统会沿用原请求编号。' })
      }
    } finally { this.setData({ busy: false }) }
  },

  openUsdWallet() {
    wx.redirectTo({
      url: '/pages/web/index?usdWallet=1',
      fail() { wx.showToast({ title: '暂时无法打开官网充值入口', icon: 'none' }) },
    })
  },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openRefunds() { wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent('/refunds#mini') }) },
  openAccount() { wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent('/account') }) },
  back() { wx.navigateBack() },
})
