const { publicRequest } = require('../../utils/api')
Page({
  data: { items: [], loading: true },
  async onLoad() {
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      this.setData({ items: data.items.filter(item => item.category === 'narrative' || item.skuId === 'sub_narrative_365') })
    } finally { this.setData({ loading: false }) }
  },
  open(event) {
    const { sku, product } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/index?sku=${encodeURIComponent(sku)}&product=${encodeURIComponent(product)}&from=narratives` })
  },
})
