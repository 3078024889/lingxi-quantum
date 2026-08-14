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
    const { sku, product } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/index?sku=${encodeURIComponent(sku)}&product=${encodeURIComponent(product)}&from=explore` })
  },
})
