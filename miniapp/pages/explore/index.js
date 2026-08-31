const { publicRequest } = require('../../utils/api')
Page({
  data: { loading: true, items: [] },
  async onLoad() {
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      this.setData({ items: data.items.filter(item => item.category === 'report').sort((a, b) => Number(a.field) - Number(b.field)) })
    } catch (_) { wx.showToast({ title: '场域暂未响应', icon: 'none' }) }
    finally { this.setData({ loading: false }) }
  },
  async open(event) {
    const item = this.data.items[event.currentTarget.dataset.index]
    if (!item || !item.productId) return wx.showToast({ title: '该场域暂未开放', icon: 'none' })
    if (item.productId === 'life-archetype') {
      wx.navigateTo({ url: '/pages/archetype-progress/index' })
      return
    }
    if (item.productId === 'stellar-trace') {
      wx.navigateTo({ url: `/pages/product/index?product=${encodeURIComponent(item.productId)}&sku=${encodeURIComponent(item.skuId)}&from=explore` })
      return
    }
    wx.navigateTo({ url: `/pages/assessment/index?product=${encodeURIComponent(item.productId)}` })
  },
  onShareAppMessage() {
    return {
      title: '灵犀场 · 场域精测',
      path: '/pages/explore/index',
      imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831',
    }
  },
  onShareTimeline() {
    return {
      title: '灵犀场 · 场域精测',
      imageUrl: 'https://lingxifield.cn/mini-share-v337.jpg?v=20260831',
    }
  },
})
