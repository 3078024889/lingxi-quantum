const { publicRequest, request } = require('../../utils/api')
const { payForSku } = require('../../utils/payment')
const { getReportWebPath } = require('../../utils/report-routes')
Page({
  data: { item: null, loading: true, loadError: '', paying: false, opening: false, owned: false, from: 'explore' },
  async onLoad(options) {
    this.options = options
    this.setData({ from: options.from === 'narratives' ? 'narratives' : 'explore' })
    await this.loadItem()
  },
  async loadItem() {
    this.setData({ loading: true, loadError: '' })
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      const item = data.items.find(candidate => candidate.productId === this.options.product && candidate.skuId === this.options.sku)
      const me = await request('/api/wechat/mini/me').catch(() => null)
      const owned = !!(me && item && (
        (me.manifestUntil && Date.parse(me.manifestUntil) > Date.now()) ||
        (me.orders || []).some(order => order.product_id === item.productId) ||
        (me.unlocks || []).some(unlock => unlock.product_id === item.productId || unlock.product_id === 'everything' || (item.category === 'narrative' && unlock.product_id === 'narrative-all'))
      ))
      if (item && item.category === 'report' && !owned) {
        const path = getReportWebPath(item)
        if (!path) throw new Error('这份精测暂未开放')
        return wx.redirectTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
      }
      this.setData({ item: item || null, owned, loadError: item ? '' : '这份内容暂未进入小程序目录' })
    } catch (_) {
      this.setData({ loadError: '场域连接暂时中断，请稍后重试' })
    } finally { this.setData({ loading: false }) }
  },
  back() {
    if (getCurrentPages().length > 1) return wx.navigateBack({ delta: 1 })
    wx.switchTab({ url: this.data.from === 'narratives' ? '/pages/narratives/index' : '/pages/explore/index' })
  },
  async pay() {
    if (!this.data.item || this.data.paying) return
    this.setData({ paying: true }); wx.showLoading({ title: '正在连接支付' })
    try {
      await payForSku(this.data.item.skuId, this.data.item.productId)
      wx.hideLoading()
      await wx.showModal({ title: '交换已完成', content: '服务端正在确认并开启权益。若暂未显示，请稍后在“我的场域”下拉刷新。', showCancel: false })
      wx.switchTab({ url: '/pages/profile/index' })
    } catch (error) {
      wx.hideLoading()
      if (!error.cancelled) await wx.showModal({ title: '未完成支付', content: error.message || '请稍后再试', showCancel: false, confirmText: '返回' })
    }
    finally { this.setData({ paying: false }) }
  },
  async openOwned() {
    if (!this.data.item || this.data.opening) return
    this.setData({ opening: true })
    try {
      if (this.data.item.category === 'report') {
        const me = await request('/api/wechat/mini/me')
        const order = (me.orders || []).find(item => item.product_id === this.data.item.productId && item.submission_id)
        if (!order) throw { data: { error: '未找到可打开的完整档案，请从“我的场域”刷新后重试' } }
        const result = await request('/api/wechat/mini/report-link', { method: 'POST', data: { orderId: order.id } })
        return wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
      }
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: this.data.item.productId } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后重试', showCancel: false })
    } finally { this.setData({ opening: false }) }
  },
})
