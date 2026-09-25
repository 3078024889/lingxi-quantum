App({
  globalData: {
    apiBase: 'https://lingxifield.cn',
    ready: false,
    loginError: '',
    lang: 'zh',
  },

  onLaunch() {
    const { getLanguage, applyTabBar } = require('./utils/i18n')
    const { login } = require('./utils/api')
    this.globalData.lang = getLanguage()
    applyTabBar(this.globalData.lang)

    login()
      .then(() => {
        this.globalData.ready = true
        this.globalData.loginError = ''
      })
      .catch((error) => {
        this.globalData.ready = false
        this.globalData.loginError = '微信身份暂未连接'
        console.warn('[mini login unavailable]', {
          statusCode: error && error.statusCode,
          message: error && error.errMsg,
        })
      })
  },

  onShow() {
    const { applyTabBar } = require('./utils/i18n')
    applyTabBar(this.globalData.lang)
  },
})
