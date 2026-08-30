const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
const { getReportWebPath } = require('../../utils/report-routes')

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

Page({
  data: {
    item: null, loading: true, loadError: '', paying: false, opening: false, owned: false, agreed: false, riskAcknowledged: false, deliveryLabel: '', validityLabel: '', from: 'explore',
    relationshipOptions: ['本人', '家人', '伴侣', '朋友', '同事', '其他'], relationshipValues: ['self', 'family', 'partner', 'friend', 'colleague', 'other'], relationshipIndex: 1,
    stellarDraft: { name: '', relationship: 'family', birthDate: '', birthTime: '', birthPlace: '', lastContactAt: '', lastKnownPlace: '', lastKnownLat: '', lastKnownLon: '', movementDirection: '', context: '' },
    stellarCompleteness: 0, stellarEssentialComplete: false,
  },
  async onLoad(options) {
    this.options = options
    if (options.product === 'stellar-trace') {
      const saved = wx.getStorageSync('lingxifield_stellar_trace_draft_v1')
      if (saved && typeof saved === 'object') {
        const relationshipIndex = Math.max(0, this.data.relationshipValues.indexOf(saved.relationship))
        this.setData({ stellarDraft: { ...this.data.stellarDraft, ...saved }, relationshipIndex })
      }
      this.refreshStellarCompleteness()
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
    const key = event.currentTarget.dataset.key
    if (!key) return
    this.setData({ [`stellarDraft.${key}`]: event.detail.value }, () => {
      wx.setStorageSync('lingxifield_stellar_trace_draft_v1', this.data.stellarDraft)
      this.refreshStellarCompleteness()
    })
  },
  onRelationshipChange(event) {
    const relationshipIndex = Number(event.detail.value) || 0
    this.setData({ relationshipIndex, 'stellarDraft.relationship': this.data.relationshipValues[relationshipIndex] }, () => {
      wx.setStorageSync('lingxifield_stellar_trace_draft_v1', this.data.stellarDraft)
      this.refreshStellarCompleteness()
    })
  },
  refreshStellarCompleteness() {
    const d = this.data.stellarDraft
    const completeness = [d.name, d.birthDate, d.birthTime, d.birthPlace, d.lastContactAt, d.lastKnownPlace && d.lastKnownLat && d.lastKnownLon, d.movementDirection, d.context].filter(Boolean).length
    const lat = Number(d.lastKnownLat), lon = Number(d.lastKnownLon)
    const essential = !!d.name && /^\d{4}-\d{2}-\d{2}$/.test(d.birthDate) && !!d.lastContactAt && !!d.lastKnownPlace && !!d.lastKnownLat && !!d.lastKnownLon && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180
    this.setData({ stellarCompleteness: completeness, stellarEssentialComplete: essential })
  },
  openPolicy(event) {
    const path = event.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },
  async pay() {
    if (!this.data.item || this.data.paying) return
    if (!this.data.agreed) return wx.showToast({ title: '请先阅读并确认规则', icon: 'none' })
    if (this.data.item.productId === 'stellar-trace' && !this.data.riskAcknowledged) return wx.showToast({ title: '请先确认结果边界', icon: 'none' })
    if (this.data.item.productId === 'stellar-trace' && !this.data.stellarEssentialComplete) return wx.showToast({ title: '请先完成寻踪档案必填项', icon: 'none' })
    if (!(await confirmPurchase(this.data.item, this.data.validityLabel))) return
    this.setData({ paying: true }); wx.showLoading({ title: '正在连接支付' })
    try {
      await payForSku(this.data.item.skuId, this.data.item.productId)
      wx.hideLoading()
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
    this.setData({ opening: true })
    try {
      if (this.data.item.category === 'report' && this.data.item.productId !== 'stellar-trace') {
        const me = await request('/api/wechat/mini/me')
        const order = (me.orders || []).find(item => item.product_id === this.data.item.productId && item.submission_id)
        if (!order) throw { data: { error: '未找到可打开的完整档案，请从“我的场域”刷新后重试' } }
        const result = await request('/api/wechat/mini/report-link', { method: 'POST', data: { orderId: order.id } })
        return wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
      }
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: this.data.item.productId, ...(this.data.item.productId === 'stellar-trace' ? { stellarDraft: this.data.stellarDraft } : {}) } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后重试', showCancel: false })
    } finally { this.setData({ opening: false }) }
  },
})
