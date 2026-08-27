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
  open(event) {
    const item = this.data.items[event.currentTarget.dataset.index]
    if (!item || !item.productId) return wx.showToast({ title: '该场域暂未开放', icon: 'none' })
    if (item.productId === 'life-archetype') {
      wx.showModal({ title: '生命原型 · 汇流层', content: '生命原型不单独测评或购买。一年内完成并开启前八个场域后，系统会自动生成并保存到“我的场域”。', confirmText: '查看我的场域', success: (res) => { if (res.confirm) wx.switchTab({ url: '/pages/profile/index' }) } })
      return
    }
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
