const { enableShareMenu, appMessage, timeline } = require('../../utils/share')

Page({
  onLoad(){ enableShareMenu() },
  onShow(){ enableShareMenu() },
  openTool(){
    wx.navigateTo({url:'/pages/web/index?path=%2Ftools%2Fimage-watermark-remover'})
  },
  onShareAppMessage(){
    return appMessage('图片去水印｜灵犀场','/pages/discover-image-watermark-remover/index')
  },
  onShareTimeline(){
    return timeline('图片去水印｜灵犀场')
  },
})
