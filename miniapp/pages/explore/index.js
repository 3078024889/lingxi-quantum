const { publicRequest } = require('../../utils/api')
Page({
  data: { loading: true, items: [] },
  async onLoad() {
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      this.setData({ items: data.items.filter(item => item.category === 'report') })
    } catch (_) { wx.showToast({ title: '场域暂未响应', icon: 'none' }) }
    finally { this.setData({ loading: false }) }
  },
  open(event) {
    const item = this.data.items[event.currentTarget.dataset.index]
    if (!item || !item.productId) return wx.showToast({ title: '该场域暂未开放', icon: 'none' })
    wx.navigateTo({ url: `/pages/assessment/index?product=${encodeURIComponent(item.productId)}` })
  },
  onShareAppMessage() {
    return {
      title: '灵犀场 · 场域精测',
      path: '/pages/explore/index',
      imageUrl: '/images/share-cover.jpg',
    }
  },
  onShareTimeline() {
    return {
      title: '灵犀场 · 场域精测',
      imageUrl: '/images/share-cover.jpg',
    }
  },
})
