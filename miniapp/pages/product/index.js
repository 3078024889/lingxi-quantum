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

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

Page({
  data: {
    item: null, loading: true, loadError: '', paying: false, opening: false, owned: false, agreed: false, riskAcknowledged: false, deliveryLabel: '', validityLabel: '', from: 'explore',
    relationshipOptions: ['本人', '家人', '伴侣', '朋友', '同事', '其他'], relationshipValues: ['self', 'family', 'partner', 'friend', 'colleague', 'other'], relationshipIndex: 1,
    directionOptions: ['不详', '向北', '东北', '向东', '东南', '向南', '西南', '向西', '西北'], directionIndex: 0,
    stellarDraft: { name: '', relationship: 'family', birthDate: '', birthTime: '', birthPlace: '', lastContactAt: '', lastKnownPlace: '', lastKnownMapLabel: '', lastKnownLat: '', lastKnownLon: '', movementDirection: '', context: '' },
    stellarName: '', stellarBirthPlace: '', stellarLastKnownPlace: '', stellarContext: '',
    today: '', lastContactDate: '', lastContactTime: '', stellarCompleteness: 0, stellarCoreComplete: 0, stellarMissingHint: '', stellarEssentialComplete: false,
  },
  async onLoad(options) {
    this.options = options
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ today })
    if (options.product === 'stellar-trace') {
      const saved = wx.getStorageSync('lingxifield_stellar_trace_draft_v1')
      if (saved && typeof saved === 'object') {
        const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && new Date(`${value}T00:00:00`).getTime() <= Date.now() && Number(value.slice(0, 4)) >= 1900
        const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')
        const relationshipIndex = Math.max(0, this.data.relationshipValues.indexOf(saved.relationship))
        const directionIndex = Math.max(0, this.data.directionOptions.indexOf(saved.movementDirection || '不详'))
        const contactParts = String(saved.lastContactAt || '').split(/[T ]/)
        const contactDate = validDate(contactParts[0]) ? contactParts[0] : ''
        const contactTime = validTime(contactParts[1]) ? contactParts[1] : ''
        const lat = Number(saved.lastKnownLat), lon = Number(saved.lastKnownLon)
        const coordinatesValid = saved.lastKnownLat !== '' && saved.lastKnownLon !== '' && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180
        const merged = { ...this.data.stellarDraft, ...saved, birthDate: validDate(saved.birthDate) ? saved.birthDate : '', birthTime: validTime(saved.birthTime) ? saved.birthTime : '', lastContactAt: contactDate && contactTime ? `${contactDate} ${contactTime}` : '', lastKnownMapLabel: saved.lastKnownMapLabel || saved.lastKnownPlace || '', lastKnownLat: coordinatesValid ? String(saved.lastKnownLat) : '', lastKnownLon: coordinatesValid ? String(saved.lastKnownLon) : '' }
        this.setData({ stellarDraft: merged, stellarName: merged.name || '', stellarBirthPlace: merged.birthPlace || '', stellarLastKnownPlace: merged.lastKnownPlace || '', stellarContext: merged.context || '', relationshipIndex, directionIndex, lastContactDate: contactDate, lastContactTime: contactTime })
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
    const flat = event.currentTarget.dataset.flat
    if (!key) return
    this.setData({ [`stellarDraft.${key}`]: event.detail.value, ...(flat ? { [flat]: event.detail.value } : {}) }, () => {
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
  saveStellarDraft(nextData = {}) {
    this.setData(nextData, () => {
      wx.setStorageSync('lingxifield_stellar_trace_draft_v1', this.data.stellarDraft)
      this.refreshStellarCompleteness()
    })
  },
  onBirthDateChange(event) { this.saveStellarDraft({ 'stellarDraft.birthDate': event.detail.value }) },
  onBirthTimeChange(event) { this.saveStellarDraft({ 'stellarDraft.birthTime': event.detail.value }) },
  onLastContactDateChange(event) {
    const lastContactDate = event.detail.value
    const lastContactAt = this.data.lastContactTime ? `${lastContactDate} ${this.data.lastContactTime}` : lastContactDate
    this.saveStellarDraft({ lastContactDate, 'stellarDraft.lastContactAt': lastContactAt })
  },
  onLastContactTimeChange(event) {
    const lastContactTime = event.detail.value
    const lastContactAt = this.data.lastContactDate ? `${this.data.lastContactDate} ${lastContactTime}` : ''
    this.saveStellarDraft({ lastContactTime, 'stellarDraft.lastContactAt': lastContactAt })
  },
  onDirectionChange(event) {
    const directionIndex = Number(event.detail.value) || 0
    const movementDirection = directionIndex === 0 ? '' : this.data.directionOptions[directionIndex]
    this.saveStellarDraft({ directionIndex, 'stellarDraft.movementDirection': movementDirection })
  },
  chooseLastKnownLocation() {
    wx.chooseLocation({
      success: (location) => this.saveStellarDraft({
        'stellarDraft.lastKnownMapLabel': location.address || location.name || this.data.stellarDraft.lastKnownPlace,
        'stellarDraft.lastKnownLat': String(location.latitude),
        'stellarDraft.lastKnownLon': String(location.longitude),
      }),
      fail: (error) => {
        if (String(error && error.errMsg).includes('cancel')) return
        wx.showModal({ title: '地图暂未打开', content: '请在微信设置中允许位置信息权限后重试。这里选择的是最后可确认地点，不是你当前的位置。', showCancel: false })
      },
    })
  },
  refreshStellarCompleteness() {
    const d = this.data.stellarDraft
    const validDate = (value) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00`); return !Number.isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getTime() <= Date.now() }
    const validContact = /^\d{4}-\d{2}-\d{2}[ T]([01]\d|2[0-3]):[0-5]\d$/.test(d.lastContactAt) && new Date(d.lastContactAt.replace(' ', 'T')).getTime() <= Date.now()
    const locationResolved = !!d.lastKnownLat && !!d.lastKnownLon
    const coreChecks = [!!d.name, validDate(d.birthDate), validContact, !!d.lastKnownPlace, locationResolved]
    const visibleChecks = [!!d.name, !!d.relationship, validDate(d.birthDate), !!d.birthTime, !!d.birthPlace, !!this.data.lastContactDate, !!this.data.lastContactTime, !!d.lastKnownPlace, locationResolved, !!d.movementDirection, !!d.context]
    const coreComplete = coreChecks.filter(Boolean).length
    const completeness = visibleChecks.filter(Boolean).length
    const lat = Number(d.lastKnownLat), lon = Number(d.lastKnownLon)
    const essential = coreComplete === 5 && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180
    const missing = []
    if (!coreChecks[0]) missing.push('姓名')
    if (!coreChecks[1]) missing.push('出生日期')
    if (!coreChecks[2]) missing.push('最后有效联系日期与时间')
    if (!coreChecks[3]) missing.push('最后已知位置说明')
    if (!coreChecks[4]) missing.push('精准地图选点')
    this.setData({ stellarCompleteness: completeness, stellarCoreComplete: coreComplete, stellarMissingHint: missing.join('、'), stellarEssentialComplete: essential })
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
      if (this.data.item.productId === 'stellar-trace') {
        wx.showLoading({ title: '正在形成星迹' })
        for (let attempt = 0; attempt < 8; attempt += 1) {
          try {
            const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: 'stellar-trace', stellarDraft: this.data.stellarDraft } })
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
    if (this.data.item.productId === 'stellar-trace' && !this.data.stellarEssentialComplete) return wx.showToast({ title: '请先补齐五项开启锚点', icon: 'none' })
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
