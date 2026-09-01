Page({
  data: { choosing: false, error: '' },
  onReady() {
    setTimeout(() => this.choose(), 120)
  },
  choose() {
    if (this.data.choosing) return
    this.setData({ choosing: true, error: '' })
    wx.chooseLocation({
      success: ({ latitude, longitude, name, address }) => {
        const label = [name, address].filter(Boolean).join(' · ').slice(0, 120)
        const webPath = `/stellar-trace?pickedLat=${encodeURIComponent(latitude)}&pickedLon=${encodeURIComponent(longitude)}&pickedLabel=${encodeURIComponent(label)}`
        wx.redirectTo({
          url: `/pages/web/index?path=${encodeURIComponent(webPath)}`,
          fail: () => this.setData({ choosing: false, error: '位置已选中，但返回星迹失败。请返回后重试。' }),
        })
      },
      fail: (reason) => {
        const cancelled = String(reason && reason.errMsg || '').includes('cancel')
        this.setData({ choosing: false, error: cancelled ? '' : '微信地图未能打开，请检查定位权限后重试。' })
      },
    })
  },
  back() { wx.navigateBack() },
})
