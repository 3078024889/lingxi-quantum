const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
const { API_BASE } = require('../../utils/api')

Page({
  data: {
    loading: true, submitting: false, paying: false, lang: 'zh',
    item: null, product: null, engine: null, questionIndex: 0,
    responses: {}, selected: '', result: null, submissionId: '',
    name: '', partnerName: '', relationshipType: 'deep', error: '',
  },
  async onLoad(options) {
    this.productId = decodeURIComponent(options.product || '')
    try {
      const [catalog, config] = await Promise.all([
        publicRequest('/api/wechat/mini/catalog'),
        publicRequest(`/api/wechat/mini/dendrite/config?productId=${encodeURIComponent(this.productId)}`),
      ])
      const item = catalog.items.find((candidate) => candidate.productId === this.productId)
      if (!item) throw new Error('missing product')
      this.setData({ item, product: config.product, engine: config.engine })
    } catch (_) { this.setData({ error: '这片场域暂未完成连接' }) }
    finally { this.setData({ loading: false }) }
  },
  toggleLang() { this.setData({ lang: this.data.lang === 'zh' ? 'en' : 'zh' }) },
  inputName(event) { this.setData({ name: event.detail.value.slice(0, 40) }) },
  inputPartner(event) { this.setData({ partnerName: event.detail.value.slice(0, 40) }) },
  chooseRelationship(event) { this.setData({ relationshipType: event.currentTarget.dataset.value }) },
  choose(event) {
    const question = this.data.product.questions[this.data.questionIndex]
    const selected = event.currentTarget.dataset.value
    this.setData({ selected, [`responses.${question.id}`]: selected })
  },
  previous() {
    if (this.data.questionIndex <= 0) return
    const questionIndex = this.data.questionIndex - 1
    const question = this.data.product.questions[questionIndex]
    this.setData({ questionIndex, selected: this.data.responses[question.id] || '' })
  },
  next() {
    if (!this.data.selected) return wx.showToast({ title: '请选择最接近此刻的一项', icon: 'none' })
    const nextIndex = this.data.questionIndex + 1
    if (nextIndex >= this.data.product.questions.length) return this.submit()
    const nextQuestion = this.data.product.questions[nextIndex]
    this.setData({ questionIndex: nextIndex, selected: this.data.responses[nextQuestion.id] || '' })
  },
  async submit() {
    if (this.data.submitting) return
    if (this.productId === 'relationship-resonance' && (!this.data.name.trim() || !this.data.partnerName.trim())) {
      return wx.showToast({ title: '请填写双方称呼', icon: 'none' })
    }
    this.setData({ submitting: true, error: '' })
    try {
      const data = await request('/api/wechat/mini/dendrite/submit', { method: 'POST', data: {
        productId: this.productId, responses: this.data.responses,
        name: this.data.name, partnerName: this.data.partnerName, relationshipType: this.data.relationshipType,
      } })
      this.setData({ result: data.result, submissionId: data.submissionId })
    } catch (error) {
      this.setData({ error: (error.data && error.data.error) || '树突联锁暂未完成，请稍后重试' })
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
  copyWebLink() {
    const pathByProduct = {
      'life-map-report':'life-map','relationship-resonance':'relationship','resilience-report':'resilience',
      'romance-report':'romance','wealth-report':'wealth','daily-tide-report':'daily','tarot-reading':'mirror',
      'qian-reading':'qian','life-archetype':'archetype',
    }
    const path = pathByProduct[this.productId] || ''
    wx.setClipboardData({ data: `${API_BASE.replace('.cn', '.com')}/${path}` })
  },
  restart() { this.setData({ questionIndex: 0, responses: {}, selected: '', result: null, submissionId: '', error: '' }) },
  onShareAppMessage() {
    return { title: this.data.item ? `${this.data.item.name} · 灵犀场` : '灵犀场 · 场域精测', path: `/pages/assessment/index?product=${encodeURIComponent(this.productId)}`, imageUrl: '/images/share-cover.jpg' }
  },
  onShareTimeline() { return { title: this.data.item ? `${this.data.item.name} · 灵犀场` : '灵犀场 · 场域精测', imageUrl: '/images/share-cover.jpg' } },
})
