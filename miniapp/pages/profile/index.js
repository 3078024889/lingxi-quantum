const { login, request, switchAccount } = require('../../utils/api')
const { initPage } = require('../../utils/i18n')

Page({
  data: {
    lang: 'zh',
    checking: true,
    connected: false,
    linking: false,
  },

  onLoad() {
    initPage(this)
    this.refreshIdentity()
  },

  onShow() {
    initPage(this)
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

  openWeb(event) {
    const path = event.currentTarget.dataset.path
    if (!path) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },

  async connectExistingAccount() {
    if (this.data.linking) return
    this.setData({ linking: true })
    wx.showLoading({ title: '正在准备连接' })
    try {
      const result = await request('/api/wechat/mini/account-link/start', { method: 'POST' })
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(result.path)}` })
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: '暂时无法连接',
        content: (error && error.data && error.data.error) || '请稍后再试',
        showCancel: false,
      })
    } finally {
      this.setData({ linking: false })
    }
  },

  async relogin() {
    wx.showLoading({ title: '正在重新连接' })
    try {
      await switchAccount()
      this.setData({ connected: true })
      wx.showToast({ title: '已重新连接', icon: 'success' })
    } catch (error) {
      this.setData({ connected: false })
      wx.showToast({ title: '暂未连接', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },
})
