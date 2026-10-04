const { enableShareMenu, appMessage, timeline } = require('../../utils/share')

Page({
  onLoad(){ enableShareMenu() },
  onShow(){ enableShareMenu() },
  openTool(){
    wx.navigateTo({url:'/pages/web/index?path=%2Ftools%2Ftemp-mail'})
  },
  onShareAppMessage(){
    return appMessage('临时邮箱｜灵犀场','/pages/discover-temp-mail/index')
  },
  onShareTimeline(){
    return timeline('临时邮箱｜灵犀场')
  },
})
