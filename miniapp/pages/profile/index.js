const { login, request, switchAccount } = require('../../utils/api')
const { SUPPORTED, initPage, copyFor, getLanguage, setLanguage } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

Page({
  data: {
    lang: 'zh-CN',
    copy: {},
    languages: SUPPORTED,
    languageIndex: 0,
    checking: true,
    connected: false,
    linking: false,
  },

  refreshLanguage(lang) {
    const index = Math.max(0, SUPPORTED.findIndex((item) => item.id === lang))
    this.setData({ lang, copy: copyFor('profile', lang), languageIndex: index })
  },

  onLoad() {
    const lang = initPage(this, 'profile')
    this.refreshLanguage(lang)
    enableShareMenu()
    this.refreshIdentity()
  },

  onShow() {
    const lang = getLanguage()
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  changeLanguage(event) {
    const index = Number(event.detail.value)
    const item = SUPPORTED[index]
    if (!item) return
    setLanguage(item.id)
    this.refreshLanguage(item.id)
  },

  async refreshIdentity() {
    this.setData({ checking: true })
    try {
      await login()
      this.setData({ connected: true })
    } catch (error) {
      this.setData({ connected: false })
      console.warn('[mini identity unavailable]', { statusCode: error && error.statusCode })
    } finally {
      this.setData({ checking: false })
    }
  },

  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },

  openWeb(event) {
    const path = event.currentTarget.dataset.path
    if (!path) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },

  async connectExistingAccount() {
    if (this.data.linking) return
    this.setData({ linking: true })
    wx.showLoading({ title: this.data.copy.preparing })
    try {
      const result = await request('/api/wechat/mini/account-link/start', { method: 'POST' })
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: this.data.copy.unavailable,
        content: this.data.copy.retry,
        showCancel: false,
      })
    } finally {
      this.setData({ linking: false })
    }
  },

  async relogin() {
    wx.showLoading({ title: this.data.copy.reconnecting })
    try {
      await switchAccount()
      this.setData({ connected: true })
      wx.showToast({ title: this.data.copy.reconnected, icon: 'success' })
    } catch (error) {
      this.setData({ connected: false })
      wx.showToast({ title: this.data.copy.notConnected, icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  copyLink() { copyWebLink('/') },
  onShareAppMessage() { return appMessage('灵犀场 LINGXIFIELD', '/pages/create/index') },
  onShareTimeline() { return timeline('灵犀场 LINGXIFIELD') },
})
