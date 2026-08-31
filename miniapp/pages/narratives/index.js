const { publicRequest, request } = require('../../utils/api')
Page({
  data: { items: [], loading: true },
  onLoad() { this.load() },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const [data, me] = await Promise.all([publicRequest('/api/wechat/mini/catalog'), request('/api/wechat/mini/me').catch(() => null)])
      const ordered = new Set((me && me.orders || []).map(item => item.product_id))
      const unlocked = new Set((me && me.unlocks || []).map(item => item.product_id))
      const manifestActive = !!(me && me.manifestUntil && Date.parse(me.manifestUntil) > Date.now())
      this.setData({ items: data.items
        .filter(item => item.category === 'narrative' || item.skuId === 'sub_narrative_365')
        .map(item => ({ ...item, owned: manifestActive || ordered.has(item.productId) || unlocked.has(item.productId) || unlocked.has('everything') || (item.category === 'narrative' && unlocked.has('narrative-all')) })) })
    } finally { this.setData({ loading: false }) }
  },
  open(event) {
    const { sku, product } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/index?sku=${encodeURIComponent(sku)}&product=${encodeURIComponent(product)}&from=narratives` })
  },
  onShareAppMessage() {
    return {
      title: '灵犀场 · 多维叙事',
      path: '/pages/narratives/index',
      imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831',
    }
  },
  onShareTimeline() {
    return {
      title: '灵犀场 · 多维叙事',
      imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831',
    }
  },
})
