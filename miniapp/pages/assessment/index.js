const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
const { API_BASE } = require('../../utils/api')

Page({
  data: {
    loading: true, submitting: false, paying: false, lang: 'zh',
    item: null, product: null, engine: null, relationshipVariants: null, questionIndex: 0,
    responses: {}, customResponses: {}, selected: '', customAnswer: '', result: null, submissionId: '', unlocked: false,
    name: '', partnerName: '', relationshipType: 'deep', error: '',
  },
  async onLoad(options) {
    this.productId = decodeURIComponent(options.product || '')
    try {
      const [catalog, config] = await Promise.all([
        publicRequest('/api/wechat/mini/catalog'),
        publicRequest(`/api/wechat/mini/dendrite/config?productId=${encodeURIComponent(this.productId)}&bank=V330-OFFICIAL-960`),
      ])
      const item = catalog.items.find((candidate) => candidate.productId === this.productId)
      if (!item) throw new Error('missing product')
      this.setData({ item, product: config.product, engine: config.engine, relationshipVariants: config.relationshipVariants || null })
    } catch (_) { this.setData({ error: '这片场域暂未完成连接' }) }
    finally { this.setData({ loading: false }) }
  },
  toggleLang() { this.setData({ lang: this.data.lang === 'zh' ? 'en' : 'zh' }) },
  inputName(event) { this.setData({ name: event.detail.value.slice(0, 40) }) },
  inputPartner(event) { this.setData({ partnerName: event.detail.value.slice(0, 40) }) },
  chooseRelationship(event) {
    const relationshipType = event.currentTarget.dataset.value
    const product = this.data.relationshipVariants && this.data.relationshipVariants[relationshipType]
    this.setData({ relationshipType, ...(product ? { product, questionIndex: 0, responses: {}, customResponses: {}, selected: '', customAnswer: '' } : {}) })
  },
  choose(event) {
    const question = this.data.product.questions[this.data.questionIndex]
    const selected = event.currentTarget.dataset.value
    this.setData({ selected, [`responses.${question.id}`]: selected, ...(selected === '__custom__' ? {} : { customAnswer: '' }) })
  },
  inputCustom(event) {
    const question = this.data.product.questions[this.data.questionIndex]
    const value = event.detail.value.slice(0, 240)
    this.setData({ selected: '__custom__', customAnswer: value, [`responses.${question.id}`]: '__custom__', [`customResponses.${question.id}`]: value })
  },
  previous() {
    if (this.data.questionIndex <= 0) return
    const questionIndex = this.data.questionIndex - 1
    const question = this.data.product.questions[questionIndex]
    this.setData({ questionIndex, selected: this.data.responses[question.id] || '', customAnswer: this.data.customResponses[question.id] || '' })
  },
  next() {
    if (!this.data.selected) return wx.showToast({ title: '请选择最接近此刻的一项', icon: 'none' })
    if (this.data.selected === '__custom__' && this.data.customAnswer.trim().length < 2) return wx.showToast({ title: '请写下你的真实答案', icon: 'none' })
    const nextIndex = this.data.questionIndex + 1
    if (nextIndex >= this.data.product.questions.length) return this.submit()
    const nextQuestion = this.data.product.questions[nextIndex]
    this.setData({ questionIndex: nextIndex, selected: this.data.responses[nextQuestion.id] || '', customAnswer: this.data.customResponses[nextQuestion.id] || '' })
  },
  async submit() {
    if (this.data.submitting) return
    if (!this.data.name.trim()) return wx.showToast({ title: '请填写档案称呼', icon: 'none' })
    if (this.productId === 'relationship-resonance' && !this.data.partnerName.trim()) return wx.showToast({ title: '请填写双方称呼', icon: 'none' })
    this.setData({ submitting: true, error: '' })
    try {
      const data = await request('/api/wechat/mini/dendrite/submit', { method: 'POST', data: {
        productId: this.productId, responses: this.data.responses, customResponses: this.data.customResponses,
        name: this.data.name, partnerName: this.data.partnerName, relationshipType: this.data.relationshipType,
      } })
      this.setData({ result: data.result, submissionId: data.submissionId, unlocked: !!data.unlocked })
    } catch (error) {
      this.setData({ error: (error.data && error.data.error) || '树突结构连接暂未完成，请稍后重试' })
    } finally { this.setData({ submitting: false }) }
  },
  async pay() {
    if (!this.data.item || !this.data.submissionId || this.data.paying) return
    const confirm = await new Promise((resolve) => wx.showModal({
      title: '开启完整场域档案',
      content: `${this.data.item.name}\n¥${this.data.item.priceFen / 100}\n一次开启，长期保存；不会自动续费。`,
      confirmText: '确认支付', success: (res) => resolve(res.confirm), fail: () => resolve(false),
    }))
    if (!confirm) return
    this.setData({ paying: true })
    try {
      await payForSku(this.data.item.skuId, this.data.item.productId, this.data.submissionId)
      await wx.showModal({ title: '场域已开启', content: '完整档案正在生成并保存到“我的场域”。', showCancel: false })
      wx.switchTab({ url: '/pages/profile/index' })
    } catch (error) {
      if (!error.cancelled) wx.showModal({ title: '未完成支付', content: error.message || '请稍后再试', showCancel: false })
    } finally { this.setData({ paying: false }) }
  },
  async openUnlockedReport() {
    if (!this.data.submissionId || !this.productId) return
    try {
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: this.productId, submissionId: this.data.submissionId } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '档案暂未打开', content: (error.data && error.data.error) || '请确认微信身份已连接到拥有权益的灵犀账户', showCancel: false })
    }
  },
  copyWebLink() {
    const pathByProduct = {
      'life-map-report':'life-map','relationship-resonance':'relationship','resilience-report':'resilience',
      'romance-report':'romance','wealth-report':'wealth','daily-tide-report':'daily','tarot-reading':'mirror',
      'qian-reading':'qian','life-archetype':'archetype',
    }
    const path = pathByProduct[this.productId] || ''
    wx.setClipboardData({ data: `${API_BASE.replace('.cn', '.com')}/${path}` })
  },
  restart() { this.setData({ questionIndex: 0, responses: {}, customResponses: {}, selected: '', customAnswer: '', result: null, submissionId: '', unlocked: false, error: '' }) },
  onShareAppMessage() {
    return { title: this.data.item ? `${this.data.item.name} · 灵犀场` : '灵犀场 · 场域精测', path: `/pages/assessment/index?product=${encodeURIComponent(this.productId)}`, imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831' }
  },
  onShareTimeline() { return { title: this.data.item ? `${this.data.item.name} · 灵犀场` : '灵犀场 · 场域精测', imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831' } },
})
