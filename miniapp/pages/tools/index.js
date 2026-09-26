const { initPage, copyFor, listFor } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

Page({
  data: { lang: 'zh-CN', copy: {}, tools: [] },

  refreshLanguage(lang) {
    this.setData({ lang, copy: copyFor('tools', lang), tools: listFor('tools', lang) })
  },

  onLoad() {
    const lang = initPage(this, 'tools')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  onShow() {
    const lang = initPage(this, 'tools')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.tools[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  allTools() { wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/tools')}` }) },
  copyLink() { copyWebLink('/tools') },
  onShareAppMessage() { return appMessage('灵犀场 · 实用工具', '/pages/tools/index') },
  onShareTimeline() { return timeline('灵犀场 · 实用工具') },
})
