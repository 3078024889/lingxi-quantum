const { enableShareMenu, appMessage, timeline } = require('../../utils/share')

Page({
  onLoad(){ enableShareMenu() },
  onShow(){ enableShareMenu() },
  openTool(){
    wx.navigateTo({url:'/pages/web/index?path=%2Ftools%2Fburn-after-read'})
  },
  onShareAppMessage(){
    return appMessage('阅后即焚｜灵犀场','/pages/discover-burn-after-read/index')
  },
  onShareTimeline(){
    return timeline('阅后即焚｜灵犀场')
  },
})
