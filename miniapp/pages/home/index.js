// Compatibility entry for existing shared links; the website owns navigation.
Page({onLoad(){wx.redirectTo({url:'/pages/web/index?path='+encodeURIComponent('/')})}})
