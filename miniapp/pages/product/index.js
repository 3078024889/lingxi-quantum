const { publicRequest } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
Page({
  data: { item: null, paying: false },
  async onLoad(options) { const data = await publicRequest('/api/wechat/mini/catalog'); this.setData({ item: data.items.find(item => item.skuId === options.sku) || null }) },
  async pay() {
    if (!this.data.item || this.data.paying) return
    this.setData({ paying: true }); wx.showLoading({ title: '正在连接支付' })
    try { await payForSku(this.data.item.skuId); wx.hideLoading(); await wx.showModal({ title: '交换已完成', content: '服务端正在确认并开启权益。若暂未显示，请稍后在“我的场域”下拉刷新。', showCancel: false }); wx.switchTab({ url: '/pages/profile/index' }) }
    catch (error) { wx.hideLoading(); if (!error.cancelled) wx.showModal({ title: '未完成支付', content: error.message || '请稍后再试', showCancel: false }) }
    finally { this.setData({ paying: false }) }
  },
})
