App({
  globalData: { apiBase: 'https://lingxifield.cn', ready: false },
  onLaunch() {
    const { login } = require('./utils/api')
    login().then(() => { this.globalData.ready = true }).catch(() => {})
  },
})
