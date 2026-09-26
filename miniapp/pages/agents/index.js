const { initPage, copyFor, listFor } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

Page({
  data: { lang: 'zh-CN', copy: {}, agents: [] },

  refreshLanguage(lang) {
    this.setData({ lang, copy: copyFor('agents', lang), agents: listFor('agents', lang) })
  },

  onLoad() {
    const lang = initPage(this, 'agents')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  onShow() {
    const lang = initPage(this, 'agents')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.agents[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  copyLink() { copyWebLink('/ai-knowledge') },
  onShareAppMessage() { return appMessage('灵犀场 · 资料智库', '/pages/agents/index') },
  onShareTimeline() { return timeline('灵犀场 · 资料智库') },
})
