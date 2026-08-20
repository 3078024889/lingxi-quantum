const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')

const TODAY = new Date()
const defaults = () => ({ name: '', year: '', month: '', day: '', hour: '12', minute: '00', hasTime: false, phone: '', plate: '' })
const ZODIACS = [
  ['aries', '白羊座'], ['taurus', '金牛座'], ['gemini', '双子座'], ['cancer', '巨蟹座'],
  ['leo', '狮子座'], ['virgo', '处女座'], ['libra', '天秤座'], ['scorpio', '天蝎座'],
  ['sagittarius', '射手座'], ['capricorn', '摩羯座'], ['aquarius', '水瓶座'], ['pisces', '双鱼座'],
]
const profileDefaults = () => ({
  gender: '', city: '', profession: '', relationshipStatus: '', practiceStatus: '',
  focus: 'all', currentState: 'exploring', energyLevel: 3, clarityLevel: 3, alignmentLevel: 3,
  relationshipStage: 'understanding',
})

Page({
  data: {
    loading: true, calculating: false, paying: false, item: null, preview: null, submissionId: '',
    person: defaults(), personB: defaults(), relationshipType: 'romantic', profile: profileDefaults(),
    isRelationship: false, assessmentKind: 'birth', zodiac: 'aries', zodiacs: ZODIACS,
    currentYear: TODAY.getFullYear(), error: '',
  },
  async onLoad(options) {
    this.options = options
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      const item = data.items.find(candidate => candidate.productId === options.product && candidate.skuId === options.sku)
      if (!item || item.category !== 'report') throw new Error('这份精测暂未开放')
      this.setData({
        item,
        isRelationship: item.assessmentKind === 'relationship',
        assessmentKind: item.assessmentKind || 'birth',
      })
    } catch (error) { this.setData({ error: error.message || '场域连接中断' }) }
    finally { this.setData({ loading: false }) }
  },
  back() { wx.navigateBack({ delta: 1 }) },
  inputPerson(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`person.${key}`]: event.detail.value, preview: null })
  },
  inputPersonB(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`personB.${key}`]: event.detail.value, preview: null })
  },
  toggleTime(event) { this.setData({ 'person.hasTime': event.detail.value, preview: null }) },
  toggleTimeB(event) { this.setData({ 'personB.hasTime': event.detail.value, preview: null }) },
  inputProfile(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`profile.${key}`]: event.detail.value, preview: null })
  },
  chooseProfile(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`profile.${key}`]: event.detail.value, preview: null })
  },
  chooseLevel(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`profile.${key}`]: Number(event.currentTarget.dataset.value), preview: null })
  },
  chooseRelation(event) { this.setData({ relationshipType: event.detail.value }) },
  chooseZodiac(event) { this.setData({ zodiac: event.detail.value, preview: null }) },
  openDailyTide() {
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(`/daily/${this.data.zodiac}`)}` })
  },
  payloadPerson(person) {
    return { ...person, year: Number(person.year), month: Number(person.month), day: Number(person.day), hour: Number(person.hour), minute: Number(person.minute) }
  },
  async calculate() {
    if (!this.data.item || this.data.calculating) return
    this.setData({ calculating: true, error: '', preview: null })
    wx.showLoading({ title: '正在读取结构' })
    try {
      const result = await request('/api/wechat/mini/assessment', { method: 'POST', data: {
        productId: this.data.item.productId,
        person: this.payloadPerson(this.data.person),
        personB: this.data.isRelationship ? this.payloadPerson(this.data.personB) : undefined,
        relationshipType: this.data.relationshipType,
        sign: this.data.zodiac,
        profile: this.data.profile,
      }})
      this.setData({ preview: result.preview, submissionId: result.submissionId })
      setTimeout(() => wx.pageScrollTo({ selector: '#preview', duration: 360 }), 80)
    } catch (error) { this.setData({ error: error.message || '资料读取失败' }) }
    finally { wx.hideLoading(); this.setData({ calculating: false }) }
  },
  async pay() {
    if (!this.data.submissionId || this.data.paying) return
    this.setData({ paying: true }); wx.showLoading({ title: '正在连接支付' })
    try {
      await payForSku(this.data.item.skuId, this.data.item.productId, this.data.submissionId)
      wx.hideLoading()
      await wx.showModal({ title: '完整档案已开启', content: '支付通知确认后，完整报告会进入“我的”。生成需要一点时间，无需重复付款。', showCancel: false })
      wx.switchTab({ url: '/pages/profile/index' })
    } catch (error) {
      wx.hideLoading()
      if (!error.cancelled) await wx.showModal({ title: '未完成支付', content: error.message || '请稍后再试', showCancel: false, confirmText: '返回' })
    } finally { this.setData({ paying: false }) }
  },
})
