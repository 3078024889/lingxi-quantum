const { initPage } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

const AGENTS = [
  {
    title: '资料 → Agent',
    note: '上传书本、论文、教材或私人资料，建立可检索、可追溯的知识空间。',
    path: '/ai-knowledge',
  },
  {
    title: '学习 SASI',
    note: '围绕资料学习、理解、复习与任务推进，把知识变成可以继续使用的能力。',
    path: '/ai-learning',
  },
  {
    title: '科研 SASI',
    note: '为论文、研究资料与问题链建立来源可追溯的研究工作区。',
    path: '/ai-research',
  },
]

const SHARE_TITLE = '灵犀场 · 把资料变成活的 Agent'

Page({
  data: { lang: 'zh', agents: AGENTS },

  onLoad() {
    initPage(this)
    enableShareMenu()
  },

  onShow() {
    initPage(this)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.agents[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  copyLink() {
    copyWebLink('/ai-knowledge')
  },

  onShareAppMessage() {
    return appMessage(SHARE_TITLE, '/pages/agents/index')
  },

  onShareTimeline() {
    return timeline(SHARE_TITLE)
  },
})
