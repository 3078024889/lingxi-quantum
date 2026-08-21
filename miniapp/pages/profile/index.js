const { request } = require('../../utils/api')

function displayDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

Page({
  data: { loading: true, opening: '', query: '', orders: [], unlocks: [], filteredOrders: [], filteredUnlocks: [], manifestUntil: null },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const me = await request('/api/wechat/mini/me')
      const orderedIds = new Set((me.orders || []).map((item) => item.product_id))
      const orders = (me.orders || []).map((item) => ({ ...item, paidLabel: displayDate(item.paid_at) }))
      const unlocks = (me.unlocks || [])
        .filter((item) => !orderedIds.has(item.product_id))
        .map((item) => ({ ...item, expiryLabel: item.expires_at ? `有效至 ${displayDate(item.expires_at)}` : '长期有效' }))
      this.setData({ orders, unlocks, manifestUntil: me.manifestUntil, query: '' })
      this.applyFilter('')
    } catch (_) {
      wx.showToast({ title: '登录状态未就绪', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  applyFilter(query) {
    const needle = (query || '').trim().toLowerCase()
    const matches = (item) => !needle || `${item.productName || ''} ${item.submission_name || ''} ${item.product_id || ''}`.toLowerCase().includes(needle)
    this.setData({ query, filteredOrders: this.data.orders.filter(matches), filteredUnlocks: this.data.unlocks.filter(matches) })
  },
  onSearch(event) { this.applyFilter(event.detail.value) },
  clearSearch() { this.applyFilter('') },
  manifestation() { wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/live-as')}` }) },
  explore() { wx.switchTab({ url: '/pages/explore/index' }) },
  narratives() { wx.switchTab({ url: '/pages/narratives/index' }) },
  website() { wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/')}` }) },
  async connectExistingAccount() {
    try {
      wx.showLoading({ title: '正在准备安全连接' })
      const result = await request('/api/wechat/mini/account-link/start', { method: 'POST' })
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.hideLoading()
      wx.showModal({ title: '暂时无法连接账户', content: (error.data && error.data.error) || '请稍后重试', showCancel: false })
    }
  },
  async openOrder(event) {
    const order = event.currentTarget.dataset.order
    if (!order) return
    this.setData({ opening: order.id })
    try {
      const result = order.submission_id
        ? await request('/api/wechat/mini/report-link', { method: 'POST', data: { orderId: order.id } })
        : await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: order.product_id } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后再试', showCancel: false })
    } finally {
      this.setData({ opening: '' })
    }
  },
  async openUnlock(event) {
    const unlock = event.currentTarget.dataset.unlock
    if (!unlock) return
    this.setData({ opening: unlock.product_id })
    try {
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: unlock.product_id } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后再试', showCancel: false })
    } finally {
      this.setData({ opening: '' })
    }
  },
})
