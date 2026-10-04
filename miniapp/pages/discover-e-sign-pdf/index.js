const { enableShareMenu, appMessage, timeline } = require('../../utils/share')

Page({
  onLoad(){ enableShareMenu() },
  onShow(){ enableShareMenu() },
  openTool(){
    wx.navigateTo({url:'/pages/web/index?path=%2Ftools%2Fe-sign-pdf'})
  },
  onShareAppMessage(){
    return appMessage('PDF电子签名｜灵犀场','/pages/discover-e-sign-pdf/index')
  },
  onShareTimeline(){
    return timeline('PDF电子签名｜灵犀场')
  },
})
