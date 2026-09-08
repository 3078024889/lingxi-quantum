const { publicRequest } = require('../../utils/api')
const { initPage } = require('../../utils/i18n')

Page({
  data: {
    entries: [
      { title: '场域精测', titleEn: 'Field Insight', note: '探索生命底层结构。不是为了被定义，而是看见自身已有的模式。', noteEn: 'See the patterns already shaping your life without reducing yourself to a label.', path: '/pages/explore/index' },
      { title: '意识显化', titleEn: 'Living Manifestation', note: '让愿望与现实重新连接。看见你的意识，如何塑造真实的路径。', noteEn: 'Reconnect intention with the reality you are actively shaping.', web: '/live-as' },
      { title: '灵犀场 SASI', titleEn: 'Lingxi SASI', note: '编程构建部署与 AI 短剧全流程工作台。', noteEn: 'A complete workspace for software delivery and AI drama production.', web: '/' },
      { title: '修炼技术', titleEn: 'Practice Systems', note: '把觉察带入呼吸、身体与日常节律，在可重复的练习中建立真实改变。', noteEn: 'Bring awareness into breath, body and repeatable daily practice.', web: '/practice' },
      { title: '潜意识重塑', titleEn: 'Subconscious Repatterning', note: '看见隐藏的惯性。改变并非否定过去，而是让新的可能进入生命。', noteEn: 'See hidden inertia and make room for a different response.', web: '/#gates' },
    ],
    exchanges: [],
    expandedProductId: '',
    practiceKicker: 'PRACTICE & ACCESS',
  },
  async onLoad() {
    initPage(this)
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      const priority = ['day', 'month', 'year']
      const exchanges = priority.map(id => data.items.find(item => item.productId === id)).filter(Boolean).map(item => ({
        ...item,
        priceLabel: `¥${item.priceFen / 100}${item.accessType === 'permanent' ? ' 永久' : item.days === 30 ? ' / 月' : ' / 年'}`,
      }))
      this.setData({ exchanges })
    } catch (_) {}
  },
  onShow() { initPage(this) },
  toggleExchange(event) {
    const productId = event.currentTarget.dataset.product
    this.setData({ expandedProductId: this.data.expandedProductId === productId ? '' : productId })
  },
  enter(event) {
    const item = this.data.entries[event.currentTarget.dataset.index]
    if (item.path) return wx.switchTab({ url: item.path })
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.web)}` })
  },
  openExchange(event) {
    const item = this.data.exchanges[event.currentTarget.dataset.index]
    wx.navigateTo({ url: `/pages/product/index?sku=${encodeURIComponent(item.skuId)}&product=${encodeURIComponent(item.productId)}&from=field` })
  },
  openWebsite() { wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/')}` }) },
  onShareAppMessage() {
    return {
      title: '灵犀场 · 步入你的意识场域',
      path: '/pages/field/index',
      imageUrl: 'https://lingxifield.cn/og-sasi-20260908.png',
    }
  },
  onShareTimeline() {
    return {
      title: '灵犀场 · 观测 · 觉察 · 连接',
      imageUrl: 'https://lingxifield.cn/og-sasi-20260908.png',
    }
  },
})
