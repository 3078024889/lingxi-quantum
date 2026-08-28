const { request } = require('../../utils/api')

function dateLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

Page({
  data: { loading: true, progress: { ready: false, completed: 0, tributaries: [] } },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const me = await request('/api/wechat/mini/me')
      const progress = me.archetype || { ready: false, completed: 0, tributaries: [] }
      progress.tributaries = (progress.tributaries || []).map((item) => ({
        ...item,
        statusLabel: item.completed ? '已汇入' : item.assessmentCompleted ? '待解锁' : '未完成',
        dateLabel: dateLabel(item.completedAt),
      }))
      progress.windowLabel = progress.windowEndsAt ? `汇流窗口至 ${dateLabel(progress.windowEndsAt)}` : '第一条支流完成后开始计算 365 天'
      this.setData({ progress })
    } catch (error) {
      wx.showModal({ title: '进度暂未同步', content: (error.data && error.data.error) || '请重新登录后再试', showCancel: false })
    } finally { this.setData({ loading: false }) }
  },
  openReport() {
    const progress = this.data.progress
    if (!progress.ready || !progress.submissionId) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(`/mini-report?id=${progress.submissionId}`)}` })
  },
  continueAssessment() { wx.switchTab({ url: '/pages/explore/index' }) },
})
