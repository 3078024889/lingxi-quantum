const { request } = require('../../utils/api')

function displayDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function confirmOpenWebArchive() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '前往网页档案',
      content: '这项历史档案保存在已连接的网页灵犀账户中。确认后将安全登录并带你前往，无需再次购买。',
      confirmText: '打开网页',
      cancelText: '暂不打开',
      success: (result) => resolve(result.confirm),
      fail: () => resolve(false),
    })
  })
}

Page({
  data: { loading: true, opening: '', query: '', orders: [], unlocks: [], filteredOrders: [], filteredUnlocks: [], manifestUntil: null, archetype: { ready: false, completed: 0, missing: [] } },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const me = await request('/api/wechat/mini/me')
      const allArchives = [...(me.archives || []), ...(me.orders || [])]
      const seen = new Set()
      const orders = allArchives.filter((item) => {
        const key = `${item.product_id}:${item.submission_id || item.id}`
        if (seen.has(key)) return false
        seen.add(key); return true
      }).map((item) => ({ ...item, paidLabel: displayDate(item.paid_at || item.created_at) }))
      const orderedIds = new Set(orders.map((item) => item.product_id))
      const unlocks = (me.unlocks || [])
        .filter((item) => !orderedIds.has(item.product_id))
        .map((item) => ({ ...item, expiryLabel: item.expires_at ? `有效至 ${displayDate(item.expires_at)}` : '长期有效' }))
      this.setData({ orders, unlocks, manifestUntil: me.manifestUntil, archetype: me.archetype, query: '' })
      this.applyFilter('')
    } catch (error) {
      this.setData({ archetype: { ready: false, completed: 0, missing: [] } })
      wx.showToast({ title: (error.data && error.data.error) || '登录状态未就绪', icon: 'none' })
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
  openPolicy(event) {
    const path = event.currentTarget.dataset.path
    if (path) wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },
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
      if (order.webOnly && !(await confirmOpenWebArchive())) return
      const result = order.assessment
        ? await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: order.product_id, submissionId: order.submission_id } })
        : order.submission_id
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
      if (unlock.webOnly && !(await confirmOpenWebArchive())) return
      const result = await request('/api/wechat/mini/content-link', { method: 'POST', data: { productId: unlock.product_id } })
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.showModal({ title: '内容暂未打开', content: (error.data && error.data.error) || '权益正在同步，请稍后再试', showCancel: false })
    } finally {
      this.setData({ opening: '' })
    }
  },
  onShareAppMessage() {
    return {
      title: '灵犀场 · 步入你的意识场域',
      path: '/pages/field/index',
      imageUrl: '/images/share-cover.jpg',
    }
  },
})
