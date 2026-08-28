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
      wx.showModal({ title: '生命原型 · 八流归一', content: '生命原型并非一次测定，也不单独售卖。自第一条支流完成之日起，365 天内完成并解锁八项场域精测；八流全部抵达后，灵犀场将读取八份独立档案之间的增强、桥接与张力，自动生成完整报告并保存到“我的场域”。八流汇聚，原型自现。', confirmText: '查看汇流进度', success: (res) => { if (res.confirm) wx.switchTab({ url: '/pages/profile/index' }) } })
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
