const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
const { getReportWebPath } = require('../../utils/report-routes')
const { CACHE_KEY: STELLAR_CACHE_KEY, LEGACY_CACHE_KEYS: STELLAR_LEGACY_CACHE_KEYS, EMPTY_DRAFT: EMPTY_STELLAR_DRAFT, sanitizeDraft: sanitizeStellarDraft, evaluateDraft: evaluateStellarDraft } = require('../../utils/stellar-trace-intake')

function describeDelivery(item) {
  if (item.productId === 'stellar-trace') return '建档完成并确认支付后，开启 7 天星迹推演权益'
  if (item.category === 'narrative') return '支付确认后自动加入“我的场域”，可进入完整叙事'
  if (item.category === 'practice') return '支付确认后自动加入“我的场域”，可进入完整修炼路径'
  if (item.category === 'membership') return '支付确认后自动开启对应场域权益'
  return '支付确认后自动生成并绑定至“我的场域”'
}

function describeValidity(item) {
  if (item.accessType === 'permanent') return '长期有效'
  if (item.days === 1) return '自开启之日起 1 天有效'
  if (item.days === 30) return '自开启之日起 30 天有效'
  if (item.days === 365) return '自开启之日起 365 天有效'
  return item.days ? `自开启之日起 ${item.days} 天有效` : '以本页展示的产品权益为准'
}

function confirmPurchase(item, validityLabel) {
  return new Promise((resolve) => {
    wx.showModal({
      title: '确认开启场域权益',
      content: item.productId === 'stellar-trace'
        ? `${item.name}\n实付 ¥${item.priceFen / 100}\n${validityLabel}\n本次购买交付推演与证据档案，不保证形成唯一候选坐标；证不足时结果可能为“尚未成域”。`
        : `${item.name}\n实付 ¥${item.priceFen / 100}\n${validityLabel}\n支付成功后自动交付，不会自动续费。`,
      confirmText: '确认支付',
      cancelText: '再看一下',
      success: (result) => resolve(result.confirm),
      fail: () => resolve(false),
    })
  })
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

Page({
  data: {
    item: null, loading: true, loadError: '', paying: false, opening: false, owned: false, agreed: false, riskAcknowledged: false, deliveryLabel: '', validityLabel: '', from: 'explore',
    relationshipOptions: ['本人', '家人', '伴侣', '朋友', '同事', '其他'], relationshipValues: ['self', 'family', 'partner', 'friend', 'colleague', 'other'], relationshipIndex: 1,
    directionOptions: ['不详', '向北', '东北', '向东', '东南', '向南', '西南', '向西', '西北'], directionIndex: 0,
    stellarName: '', stellarBirthDate: '', stellarBirthTime: '', stellarBirthPlace: '', stellarLastKnownPlace: '', stellarLastKnownMapLabel: '', stellarLastKnownLat: '', stellarLastKnownLon: '', stellarContext: '',
    today: '', lastContactDate: '', lastContactTime: '', stellarCompleteness: 0, stellarCoreComplete: 0, stellarMissingHint: '', stellarEssentialComplete: false,
  },
  async onLoad(options) {
    this.options = options
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ today })
    if (options.product === 'stellar-trace') {
      STELLAR_LEGACY_CACHE_KEYS.forEach(key => wx.removeStorageSync(key))
      const saved = sanitizeStellarDraft(wx.getStorageSync(STELLAR_CACHE_KEY) || EMPTY_STELLAR_DRAFT)
      const [lastContactDate = '', lastContactTime = ''] = saved.lastContactAt.split(/[T ]/)
      this.setData({
        stellarName: saved.name, relationshipIndex: Math.max(0, this.data.relationshipValues.indexOf(saved.relationship)),
        stellarBirthDate: saved.birthDate, stellarBirthTime: saved.birthTime, stellarBirthPlace: saved.birthPlace,
        lastContactDate, lastContactTime, stellarLastKnownPlace: saved.lastKnownPlace,
        stellarLastKnownMapLabel: saved.lastKnownMapLabel, stellarLastKnownLat: saved.lastKnownLat, stellarLastKnownLon: saved.lastKnownLon,
        directionIndex: Math.max(0, this.data.directionOptions.indexOf(saved.movementDirection || '不详')), stellarContext: saved.context,
      }, () => this.persistStellarDraft())
    }
    this.setData({ from: options.from === 'narratives' ? 'narratives' : 'explore' })
    await this.loadItem()
  },
  async loadItem() {
    this.setData({ loading: true, loadError: '' })
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      const item = data.items.find(candidate => candidate.productId === this.options.product && candidate.skuId === this.options.sku)
      const me = await request('/api/wechat/mini/me').catch(() => null)
      const activeUnlockOwned = !!(me && item && (me.unlocks || []).some(unlock => unlock.product_id === item.productId || unlock.product_id === 'everything' || (item.category === 'narrative' && unlock.product_id === 'narrative-all')))
      const owned = !!(me && item && (
        (me.manifestUntil && Date.parse(me.manifestUntil) > Date.now()) ||
        activeUnlockOwned ||
        (item.productId !== 'stellar-trace' && (me.orders || []).some(order => order.product_id === item.productId))
      ))
      if (item && item.category === 'report' && !owned && item.productId !== 'stellar-trace') {
        const path = getReportWebPath(item)
        if (!path) throw new Error('这份精测暂未开放')
        return wx.redirectTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
      }
      this.setData({
        item: item || null,
        owned,
        agreed: false,
        riskAcknowledged: false,
        deliveryLabel: item ? describeDelivery(item) : '',
        validityLabel: item ? describeValidity(item) : '',
        loadError: item ? '' : '这份内容暂未进入小程序目录',
      })
    } catch (_) {
      this.setData({ loadError: '场域连接暂时中断，请稍后重试' })
    } finally { this.setData({ loading: false }) }
  },
  back() {
    if (getCurrentPages().length > 1) return wx.navigateBack({ delta: 1 })
    wx.switchTab({ url: this.data.from === 'narratives' ? '/pages/narratives/index' : '/pages/explore/index' })
  },
  onAgreementChange(event) {
    this.setData({ agreed: (event.detail.value || []).includes('confirmed') })
  },
  onRiskAcknowledgementChange(event) {
    this.setData({ riskAcknowledged: (event.detail.value || []).includes('risk-confirmed') })
  },
  onStellarInput(event) {
    const flat = event.currentTarget.dataset.flat
    if (!flat) return
    const value = event.detail.value == null ? '' : String(event.detail.value)
    // Do not setData on every keystroke. Re-rendering a controlled native input
    // interrupts the Chinese IME composition buffer in some WeChat versions,
    // which made the name field appear unable to accept text.
    this.data[flat] = value
    clearTimeout(this.stellarDraftTimer)
    this.stellarDraftTimer = setTimeout(() => this.persistStellarDraft(), 280)
    return value
  },
  onStellarBlur(event) {
    const flat = event.currentTarget.dataset.flat
    if (!flat) return
    const value = event.detail.value == null ? '' : String(event.detail.value)
    this.setData({ [flat]: value }, () => this.persistStellarDraft())
  },
  onRelationshipChange(event) {
    const relationshipIndex = Number(event.detail.value) || 0
    this.setData({ relationshipIndex }, () => this.persistStellarDraft())
  },
  buildStellarDraft() {
    const movementDirection = this.data.directionIndex === 0 ? '' : this.data.directionOptions[this.data.directionIndex]
    return sanitizeStellarDraft({
      name: this.data.stellarName, relationship: this.data.relationshipValues[this.data.relationshipIndex],
      birthDate: this.data.stellarBirthDate, birthTime: this.data.stellarBirthTime, birthPlace: this.data.stellarBirthPlace,
      lastContactAt: this.data.lastContactDate && this.data.lastContactTime ? `${this.data.lastContactDate} ${this.data.lastContactTime}` : '',
      lastKnownPlace: this.data.stellarLastKnownPlace, lastKnownMapLabel: this.data.stellarLastKnownMapLabel,
      lastKnownLat: this.data.stellarLastKnownLat, lastKnownLon: this.data.stellarLastKnownLon,
      movementDirection, context: this.data.stellarContext,
    })
  },
  persistStellarDraft() {
    const draft = this.buildStellarDraft()
    wx.setStorageSync(STELLAR_CACHE_KEY, draft)
    this.refreshStellarCompleteness(draft)
  },
  onUnload() {
    clearTimeout(this.stellarDraftTimer)
    if (this.data.item && this.data.item.productId === 'stellar-trace') this.persistStellarDraft()
  },
  saveStellarFields(nextData = {}) { this.setData(nextData, () => this.persistStellarDraft()) },
  onBirthDateChange(event) { this.saveStellarFields({ stellarBirthDate: event.detail.value }) },
  onBirthTimeChange(event) { this.saveStellarFields({ stellarBirthTime: event.detail.value }) },
  onLastContactDateChange(event) {
    const lastContactDate = event.detail.value
    this.saveStellarFields({ lastContactDate })
  },
  onLastContactTimeChange(event) {
    const lastContactTime = event.detail.value
    this.saveStellarFields({ lastContactTime })
  },
  onDirectionChange(event) {
    const directionIndex = Number(event.detail.value) || 0
    this.saveStellarFields({ directionIndex })
  },
  chooseLastKnownLocation() {
    wx.chooseLocation({
      success: (location) => this.saveStellarFields({
        stellarLastKnownMapLabel: location.address || location.name || this.data.stellarLastKnownPlace,
        stellarLastKnownLat: String(location.latitude),
        stellarLastKnownLon: String(location.longitude),
      }),
      fail: (error) => {
        if (String(error && error.errMsg).includes('cancel')) return
        wx.showModal({ title: '地图暂未打开', content: '请在微信设置中允许位置信息权限后重试。这里选择的是最后可确认地点，不是你当前的位置。', showCancel: false })
      },
    })
  },
  refreshStellarCompleteness(draft = this.buildStellarDraft()) {
    const status = evaluateStellarDraft(draft)
    this.setData({ stellarCompleteness: status.completeness, stellarCoreComplete: status.coreComplete, stellarMissingHint: status.missing.join('、'), stellarEssentialComplete: status.essentialComplete })
  },
  openPolicy(event) {
    const path = event.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },
  async pay() {
    if (!this.data.item || this.data.paying) return
    const stellarDraft = this.data.item.productId === 'stellar-trace' ? this.buildStellarDraft() : null
    const stellarStatus = stellarDraft ? evaluateStellarDraft(stellarDraft) : null
    if (!this.data.agreed) return wx.showToast({ title: '请先阅读并确认规则', icon: 'none' })
    if (this.data.item.productId === 'stellar-trace' && !this.data.riskAcknowledged) return wx.showToast({ title: '请先确认结果边界', icon: 'none' })
    if (stellarStatus && !stellarStatus.essentialComplete) return wx.showModal({ title: '请补齐开启锚点', content: `尚缺：${stellarStatus.missing.join('、')}`, showCancel: false })
    if (!(await confirmPurchase(this.data.item, this.data.validityLabel))) return
    this.setData({ paying: true }); wx.showLoading({ title: '正在连接支付' })
    try {
      await payForSku(this.data.item.skuId, this.data.item.productId)
      wx.hideLoading()
      if (this.data.item.productId === 'stellar-trace') {
        wx.showLoading({ title: '正在形成星迹' })
        for (let attempt = 0; attempt < 8; attempt += 1) {
          try {
            const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: 'stellar-trace', stellarDraft } })
            wx.hideLoading()
            return wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
          } catch (_) { await wait(1000 + attempt * 250) }
        }
        wx.hideLoading()
        await wx.showModal({ title: '权益正在确认', content: '支付已完成，7 天权益正在由微信同步。请稍后从“我的场域”打开星迹，即可用本档案推演，无需再次付费。', showCancel: false })
        return wx.switchTab({ url: '/pages/profile/index' })
      }
      await wx.showModal({ title: '开启已完成', content: '服务端正在确认并交付权益。若暂未显示，请稍后在“我的场域”下拉刷新。', showCancel: false })
      wx.switchTab({ url: '/pages/profile/index' })
    } catch (error) {
      wx.hideLoading()
      if (!error.cancelled) await wx.showModal({ title: '未完成支付', content: error.message || '请稍后再试', showCancel: false, confirmText: '返回' })
    }
    finally { this.setData({ paying: false }) }
  },
  async openOwned() {
    if (!this.data.item || this.data.opening) return
    const stellarDraft = this.data.item.productId === 'stellar-trace' ? this.buildStellarDraft() : null
    const stellarStatus = stellarDraft ? evaluateStellarDraft(stellarDraft) : null
    if (stellarStatus && !stellarStatus.essentialComplete) return wx.showModal({ title: '请补齐开启锚点', content: `尚缺：${stellarStatus.missing.join('、')}`, showCancel: false })
    this.setData({ opening: true })
    try {
      if (this.data.item.category === 'report' && this.data.item.productId !== 'stellar-trace') {
        const me = await request('/api/wechat/mini/me')
        const order = (me.orders || []).find(item => item.product_id === this.data.item.productId && item.submission_id)
        if (!order) throw { data: { error: '未找到可打开的完整档案，请从“我的场域”刷新后重试' } }
        const result = await request('/api/wechat/mini/report-link', { method: 'POST', data: { orderId: order.id } })
        return wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
      }
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: this.data.item.productId, ...(stellarDraft ? { stellarDraft } : {}) } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后重试', showCancel: false })
    } finally { this.setData({ opening: false }) }
  },
})
