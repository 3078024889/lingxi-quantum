const { publicRequest } = require('../../utils/api')
const { getReportWebPath } = require('../../utils/report-routes')
Page({
  data: { loading: true, items: [] },
  async onLoad() {
    try {
      const data = await publicRequest('/api/wechat/mini/catalog')
      this.setData({ items: data.items.filter(item => item.category === 'report') })
    } catch (_) { wx.showToast({ title: '场域暂未响应', icon: 'none' }) }
    finally { this.setData({ loading: false }) }
  },
  open(event) {
    const item = this.data.items[event.currentTarget.dataset.index]
    const path = getReportWebPath(item)
    if (!path) return wx.showToast({ title: '该场域暂未开放', icon: 'none' })
    // 八份精测以网页产品为唯一内容与交互真源，避免原生副本在网页升级后
    // 再次发生内容降级、字段缺失和流程漂移。
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(path)}` })
  },
})
