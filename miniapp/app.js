const profile=require('./utils/app-profile')
App({
  globalData: {
    apiBase: profile.sessionMode==='website'?'':require('./utils/api').API_BASE,
    ready: false,
    loginError: '',
    lang: 'zh',
  },

  onLaunch() {
    if (typeof wx.getUpdateManager === 'function') {
      const update = wx.getUpdateManager()
      update.onUpdateReady(() => {
        // Do not interrupt an active native payment. Its recovery record is kept.
        if (wx.getStorageSync('lx_mini_topup_pending')) return
        wx.showModal({title:'新版已准备好',content:'重新打开即可使用新版灵犀场，是否现在更新？',success:result=>{if(result.confirm)update.applyUpdate()}})
      })
    }
    const { getLanguage } = require('./utils/i18n')
    this.globalData.lang = getLanguage()
    if(profile.sessionMode==='website'){this.globalData.ready=true;return}
    const { login } = require('./utils/api')

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


})
