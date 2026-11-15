// Compatibility entry for old links; the retired knowledge workspace now resolves to the active SIAI directory.
Page({onLoad(){wx.redirectTo({url:'/pages/web/index?path='+encodeURIComponent('/siai')})}})
