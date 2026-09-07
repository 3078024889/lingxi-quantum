Component({
  properties: {
    title: { type: String, value: '灵犀场' },
    showBack: { type: Boolean, value: false },
  },
  data: { lang: 'zh' },
  lifetimes: {
    attached() { this.setData({ lang: require('../../utils/i18n').getLanguage() }) },
  },
  methods: {
    back() {
      const pages = getCurrentPages()
      if (pages.length > 1) return wx.navigateBack({ delta: 1 })
      wx.switchTab({ url: '/pages/explore/index' })
    },
    toggleLanguage() {
      const { setLanguage } = require('../../utils/i18n')
      this.setData({ lang: setLanguage(this.data.lang === 'en' ? 'zh' : 'en') })
    },
  },
})
