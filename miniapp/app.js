App({
  globalData: { apiBase: 'https://lingxifield.cn', ready: false, lang: 'zh' },
  onLaunch() {
    const { getLanguage, applyTabBar } = require('./utils/i18n')
    this.globalData.lang = getLanguage()
    applyTabBar(this.globalData.lang)
    const { login } = require('./utils/api')
    login().then(() => { this.globalData.ready = true }).catch(() => {})
  },
  onShow() {
    const { applyTabBar } = require('./utils/i18n')
    applyTabBar(this.globalData.lang)
  },
})
