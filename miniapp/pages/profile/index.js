const { request } = require('../../utils/api')

Page({
  data: { loading: true, opening: '', orders: [], unlocks: [], manifestUntil: null },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const me = await request('/api/wechat/mini/me')
      this.setData({ orders: me.orders, unlocks: me.unlocks, manifestUntil: me.manifestUntil })
    } catch (_) {
      wx.showToast({ title: '登录状态未就绪', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  async openOrder(event) {
    const order = event.currentTarget.dataset.order
    if (!order || !order.submission_id) {
      wx.showToast({ title: '这项权益已开启，可从对应场域进入', icon: 'none' })
      return
    }
    this.setData({ opening: order.id })
    try {
      const result = await request('/api/wechat/mini/report-link', {
        method: 'POST', data: { orderId: order.id },
      })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '档案暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后再试', showCancel: false })
    } finally {
      this.setData({ opening: '' })
    }
  },
})
