const { initPage, copyFor, listFor } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

Page({
  data: { lang: 'zh-CN', copy: {}, entries: [] },

  refreshLanguage(lang) {
    this.setData({ lang, copy: copyFor('create', lang), entries: listFor('create', lang) })
  },

  onLoad() {
    const lang = initPage(this, 'create')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  onShow() {
    const lang = initPage(this, 'create')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.entries[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  openConnections() {
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/sasi/connections')}` })
  },

  copyLink() { copyWebLink('/sasi') },

  onShareAppMessage() {
    return appMessage('灵犀场 LINGXIFIELD', '/pages/create/index')
  },

  onShareTimeline() { return timeline('灵犀场 LINGXIFIELD') },
})
