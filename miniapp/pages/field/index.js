const { publicRequest } = require('../../utils/api')

Page({
  data: {
    entries: [
      { title: '场域精测', note: '探索生命底层结构。不是为了被定义，而是看见自身已有的模式。', path: '/pages/explore/index' },
      { title: '意识显化', note: '让愿望与现实重新连接。看见你的意识，如何塑造真实的路径。', web: '/live-as' },
      { title: '梦境探索', note: '梦境，是未被语言表达的信息。从潜意识的线索中，重新理解自己。', web: '/dream' },
      { title: '潜意识重塑', note: '看见隐藏的惯性。改变并非否定过去，而是让新的可能进入生命。', web: '/#gates' },
      { title: '多维叙事', note: '探索不同视角的生命故事。每一次阅读，都是与自身经验的重新连接。', path: '/pages/narratives/index' },
    ],
    exchanges: [],
    expandedProductId: '',
  },
  async onLoad() {
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      const priority = ['everything', 'narrative-all', 'breath', 'intuition', 'heart-reset', 'ascending-heart', 'year', 'month']
      const exchanges = priority.map(id => data.items.find(item => item.productId === id)).filter(Boolean).map(item => ({
        ...item,
        priceLabel: `¥${item.priceFen / 100}${item.accessType === 'permanent' ? ' 永久' : item.days === 30 ? ' / 月' : ' / 年'}`,
      }))
      this.setData({ exchanges })
    } catch (_) {}
  },
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
})
