Component({
  properties: {
    title: { type: String, value: '灵犀场' },
    showBack: { type: Boolean, value: false },
  },
  methods: {
    back() {
      const pages = getCurrentPages()
      if (pages.length > 1) return wx.navigateBack({ delta: 1 })
      wx.switchTab({ url: '/pages/explore/index' })
    },
  },
})
