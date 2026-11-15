// Legacy route kept only for old deep links. All wallet activity is handled by the official website.
Page({
  onLoad(options = {}) {
    const currency = options.currency === "USD" ? "USD" : options.currency === "CNY" ? "CNY" : "";
    const path = currency ? "/ai-wallet?currency=" + currency : "/ai-wallet";
    wx.redirectTo({
      url: "/pages/web/index?path=" + encodeURIComponent(path),
      fail() {
        wx.showModal({ title: "官网钱包暂未打开", content: "请返回小程序首页，重新进入灵犀场官网钱包。", showCancel: false });
      },
    });
  },
});
