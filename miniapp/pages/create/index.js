const { initPage } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

const ENTRIES = [
  {
    title: 'SASI AI 创作',
    note: '把想法变成可继续制作的项目，从理解目标到生成、审校与交付。',
    path: '/sasi',
  },
  {
    title: 'AI 短剧',
    note: '从故事、人物、分镜到画面、视频、配音与字幕，进入完整制作工作流。',
    path: '/sasi/drama',
  },
  {
    title: 'AI 网站构建',
    note: '从一个想法开始，整理结构、生成实现并持续迭代。',
    path: '/sasi',
  },
  {
    title: '资料变成活的 Agent',
    note: '把书本、论文与资料变成可检索、可追溯、能继续工作的知识空间。',
    path: '/ai-knowledge',
  },
]

const SHARE_TITLE = '灵犀场 · 一键创造，一念即达'

Page({
  data: { lang: 'zh', entries: ENTRIES },

  onLoad() {
    initPage(this)
    enableShareMenu()
  },

  onShow() {
    initPage(this)
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

  copyLink() {
    copyWebLink('/sasi')
  },

  onShareAppMessage() {
    return appMessage(SHARE_TITLE, '/pages/create/index')
  },

  onShareTimeline() {
    return timeline(SHARE_TITLE)
  },
})
