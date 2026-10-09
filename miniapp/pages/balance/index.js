const MESSAGE = '小程序内充值暂未开放。已有余额和订单仍保留，可在账户中查看。'

Page({
  data: { message: MESSAGE },
  pay() { this.setData({ message: MESSAGE }) },
  openOrders() { wx.navigateTo({ url: '/pages/orders/index' }) },
  openAccount() { wx.switchTab({ url: '/pages/profile/index' }) },
})
