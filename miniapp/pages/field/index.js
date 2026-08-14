Page({
  data: {
    entries: [
      { title: '场域精测', note: '十种生命档案体验，从结构中看见自己', path: '/pages/explore/index' },
      { title: '意识显化', note: '把愿景带回现实证据与每日行动', web: '/live-as' },
      { title: '梦境探索', note: '记录梦的回声，辨认潜意识的线索', web: '/dream' },
      { title: '潜意识重塑', note: '看见反复出现的生命模式，重新选择内在路径', web: '/#gates' },
      { title: '多维叙事', note: '进入为灵魂准备的付费阅读空间', path: '/pages/narratives/index' },
    ],
  },
  enter(event) {
    const item = this.data.entries[event.currentTarget.dataset.index]
    if (item.path) return wx.switchTab({ url: item.path })
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.web)}` })
  },
})
