const { login, request, publicRequest, wxLogin } = require('../../utils/api')

const PENDING_KEY = 'lx_mini_cny_topup_pending_v2'
const LEGACY_PENDING_KEY = 'lx_mini_cny_topup_pending_v1'
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
  if (minor % 100 !== 0 && minor > 10000) return null
  return { minor, text: (minor / 100).toFixed(2) }
}
function compareVersion(a, b) {
  const left = String(a || '').split('.').map(Number), right = b.split('.').map(Number)
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if ((left[i] || 0) !== (right[i] || 0)) return (left[i] || 0) > (right[i] || 0) ? 1 : -1
  }
  return 0
}
function iosGuard(minor) {
  try {
    const info = wx.getSystemInfoSync()
    if (info.platform !== 'ios') return ''
    const os = /(?:iOS|iPadOS)\s*(\d+(?:\.\d+)*)/i.exec(info.system || '')
    const notice = '苹果端支付需使用中国大陆 App Store 账户、iOS 15及以上及微信 8.0.68及以上。'
    if (minor < 100) return '苹果端单笔充值至少 ¥1。' + notice
    if ((os && compareVersion(os[1], '15') < 0) || (info.version && compareVersion(info.version, '8.0.68') < 0)) return notice
  } catch (_) {}
  return ''
}
function paymentError(error) {
  const code = Number(error && (error.errCode ?? error.errcode))
  const map = {
    '-2': '已取消付款。',
    '-4': '微信风控暂时拒绝本次付款。',
    '-15002': '该支付单号已提交，请先核验原订单。',
    '-15005': '支付身份签名校验失败。',
    '-15006': '商家支付签名校验失败。',
    '-15007': '微信登录状态已过期，请重新进入小程序。',
    '-15008': '商家虚拟支付进件尚未完成。',
    '-15010': '充值商品尚未发布。',
    '-15013': '充值商品价格与微信配置不一致。',
    '-15014': '充值商品发布尚未生效。',
    '-15017': '微信暂时限制商家收款。',
    '-15018': '充值商品尚未通过审核。',
    '-15020': '操作过快，请稍后再试。',
    '-15021': '微信暂时限制交易频率。',
  }
  return map[String(code)] || (error && error.data && error.data.error) || '微信支付暂未完成。'
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
    paymentAttempted: false,
    topups: [],
    message: '正在检查人民币充值服务…',
  },

  onLoad(options = {}) {
    this.migratePending()
    const amount = String(options.amount || '')
    if (amount) this.applyAmount(amount)
    void this.refreshAll()
  },

  onShow() {
    if (this.data.orderId && !this.data.busy) void this.confirmPayment()
  },

  migratePending() {
    let pending = wx.getStorageSync(PENDING_KEY)
    if (!pending) {
      pending = wx.getStorageSync(LEGACY_PENDING_KEY)
      if (pending) {
        wx.setStorageSync(PENDING_KEY, { ...pending, migratedFrom: 'v1' })
        wx.removeStorageSync(LEGACY_PENDING_KEY)
      }
    }
    if (pending) {
      this.setData({
        orderId: pending.orderId || '',
        requestId: pending.requestId || '',
        paymentAttempted: pending.paymentAttempted === true,
        selected: pending.selected || '10',
        custom: pending.custom || '',
        amountText: pending.amountText || pending.selected || '10',
      })
    }
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
    else if (this.data.requestId) this.setData({ message: '发现一笔尚未恢复的充值请求。请点击“恢复上次充值”，系统会沿用原请求编号，不会新建重复订单。' })
  },

  async refreshAvailability() {
    this.setData({ loading: true })
    try {
      const result = await publicRequest('/api/wechat/mini/cny-topup/availability')
      this.setData({
        enabled: result.enabled === true,
        message: result.enabled === true
          ? '选择金额后使用微信原生支付。到账以服务端核验为准。'
          : '小程序人民币充值通道暂未开放，请稍后重新检查。',
      })
    } catch (error) {
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
      paymentAttempted: pending.paymentAttempted === true,
      selected: pending.selected || this.data.selected,
      custom: pending.custom || '',
    })
  },

  clearPending(message) {
    wx.removeStorageSync(PENDING_KEY)
    this.setData({ orderId: '', requestId: '', paymentAttempted: false, message })
  },

  async confirmPayment() {
    if (!this.data.orderId || this._checkingOrder) return false
    this._checkingOrder = true
    try {
      const result = await request('/api/wechat/mini/tool-pay/status?orderId=' + encodeURIComponent(this.data.orderId))
      if (result.paid === true || result.status === 'paid') {
        this.clearPending('微信订单已核验，人民币余额已到账。')
        await this.refreshAccount()
        return true
      }
      if (result.closed === true && result.status === 'canceled' && result.paid === false) {
        this.clearPending('微信已确认上一笔订单未付款并关闭，可以重新选择金额。')
        return false
      }
      this.setData({
        message: result.providerConfirmedUnpaid === true
          ? '微信确认当前尚未付款，但原订单仍在处理中。请继续核验，不要重复充值。'
          : '付款结果仍在核验。若已扣款，余额会在服务端确认后入账；请勿重复付款。',
      })
      return false
    } catch (_) {
      this.setData({ message: '暂时无法核验上一笔订单。订单已保留，请稍后重试，不要再次充值。' })
      return false
    } finally { this._checkingOrder = false }
  },

  async pay() {
    if (this.data.busy) return
    if (this.data.orderId) { await this.confirmPayment(); return }
    if (this.data.requestId) { await this.recoverPending(); return }
    if (!this.data.enabled) {
      this.setData({ message: this.data.loading ? '正在连接充值服务，请稍候。' : '人民币充值通道尚未开放，请重新检查服务。' })
      return
    }
    const amount = this.currentAmount()
    if (!amount) { this.setData({ message: '请输入有效金额，最多两位小数。' }); return }
    const guard = iosGuard(amount.minor)
    if (guard) { this.setData({ message: guard }); wx.showModal({ title: '苹果支付条件', content: guard, showCancel: false }); return }
    if (!this.data.accountLoaded) { this.setData({ message: '请先重新加载账户余额，确认到账账户。' }); return }
    if (!this.data.linked) { this.setData({ message: '请先连接灵犀场账户，确认充值到账账户。' }); return }
    if (typeof wx.requestVirtualPayment !== 'function') { this.setData({ message: '当前微信版本不支持虚拟支付，请更新微信后重试。' }); return }
    await this.submitPayment(makeRequestId(), amount)
  },

  async recoverPending() {
    if (this.data.busy || !this.data.requestId) return
    const amount = this.currentAmount()
    if (!amount) { this.setData({ message: '上次充值金额信息不完整，请联系支持处理。' }); return }
    await this.submitPayment(this.data.requestId, amount)
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
      paymentAttempted: existing.paymentAttempted === true,
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
      if (created.payment && pending.paymentAttempted !== true) {
        pending.paymentAttempted = true
        this.savePending(pending)
        try {
          await new Promise((resolve, reject) => wx.requestVirtualPayment({
            ...created.payment, success: resolve, fail: reject,
          }))
          this.setData({ message: '微信支付操作已返回，正在核验订单与余额。' })
        } catch (error) {
          this.setData({ message: paymentError(error) + '正在核验原订单，请勿重复充值。' })
        }
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
    wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent('/ai-wallet?currency=USD') })
  },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openRefunds() { wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent('/refunds#mini') }) },
  openAccount() { wx.navigateTo({ url: '/pages/web/index?path=' + encodeURIComponent('/account') }) },
  back() { wx.navigateBack() },
})
