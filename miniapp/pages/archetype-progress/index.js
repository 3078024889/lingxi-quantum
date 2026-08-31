const { request } = require('../../utils/api')

function dateLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

Page({
  data: { loading: true, subjectIndex: -1, subjects: [], progress: { ready: false, completed: 0, tributaries: [] } },
  onShow() { this.load() },
  async load() {
    this.setData({ loading: true })
    try {
      const subject = this.data.subjects[this.data.subjectIndex]
      const suffix = subject ? `?subjectId=${encodeURIComponent(subject.subject.subjectId)}` : ''
      const me = await request(`/api/wechat/mini/me${suffix}`)
      const progress = me.archetype || { ready: false, completed: 0, tributaries: [] }
      progress.tributaries = (progress.tributaries || []).map((item) => ({
        ...item,
        statusLabel: item.needsRetest ? '旧版缺证据，请同名重测' : item.completed ? '已汇入' : item.assessmentCompleted ? '待解锁' : '未完成',
        dateLabel: dateLabel(item.completedAt),
      }))
      progress.windowLabel = progress.windowEndsAt ? `汇流窗口至 ${dateLabel(progress.windowEndsAt)}` : '第一条支流完成后开始计算 365 天'
      const subjects = (me.archetypeSubjects || this.data.subjects || []).map((item) => ({ ...item, displayName: `${item.subject.displayName} · ${item.completed}/8` }))
      const subjectIndex = progress.subject ? subjects.findIndex((item) => item.subject.subjectId === progress.subject.subjectId) : this.data.subjectIndex
      this.setData({ progress, subjects, subjectIndex })
    } catch (error) {
      wx.showModal({ title: '进度暂未同步', content: (error.data && error.data.error) || '请重新登录后再试', showCancel: false })
    } finally { this.setData({ loading: false }) }
  },
  selectSubject(event) {
    this.setData({ subjectIndex: Number(event.detail.value) }, () => this.load())
  },
  openReport() {
    const progress = this.data.progress
    if (!progress.ready || !progress.submissionId) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(`/mini-report?id=${progress.submissionId}`)}` })
  },
  continueAssessment() { wx.switchTab({ url: '/pages/explore/index' }) },
})
