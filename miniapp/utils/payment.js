const { request, wxLogin } = require('./api')

const ERROR_MESSAGES = {
  '-4': '本次交易触发安全保护，请稍后再试',
  '-15001': '微信提示缺少支付参数。请记录本页错误码并联系客服',
  '-15002': '微信提示支付参数无效，请重新进入后再试',
  '-15003': '支付系统繁忙，请稍后再试',
  '-15005': '微信登录态失效，请重新进入',
  '-15006': '支付签名校验失败，请联系客服',
  '-15007': '微信登录态过期，请重新发起',
  '-15010': '该内容的微信虚拟支付道具尚未发布。不是你的付款问题，请等待商家发布后再试',
  '-15013': '商品价格配置不一致，请联系客服',
  '-15014': '商品配置正在生效，请十分钟后再试',
  '-15020': '操作过快，请稍后再试',
}

function supportsVirtualPay() {
  return typeof wx.requestVirtualPayment === 'function' || wx.canIUse('requestVirtualPayment')
}

async function payForSku(skuId, productId, submissionId) {
  if (!supportsVirtualPay()) throw new Error('当前微信版本过低，请升级微信后再试')
  const { code } = await wxLogin()
  const result = await request('/api/wechat/mini/pay/create', {
    method: 'POST', data: { skuId, productId, code, submissionId },
  })
  return new Promise((resolve, reject) => wx.requestVirtualPayment({
    ...result.payment,
    success: () => resolve({ orderId: result.orderId }),
    fail: (error) => {
      if (Number(error.errCode) === -2) return reject(Object.assign(new Error('cancelled'), { cancelled: true }))
      const platform = (wx.getDeviceInfo ? wx.getDeviceInfo().platform : wx.getSystemInfoSync().platform || '').toLowerCase()
      const code = String(error.errCode == null ? 'unknown' : error.errCode)
      console.error('[virtual payment failed]', { code, message: error.errMsg, platform, skuId, productId })
      if (platform === 'ios' && (code === '-15001' || code === '-15002')) {
        return reject(new Error(`iPhone 虚拟支付通道尚未正确启用（错误码 ${code}）。请先用安卓真机验证普通虚拟支付；iPhone 正式支付需在微信后台启用并配置苹果 IAP。`))
      }
      reject(new Error(`${ERROR_MESSAGES[code] || error.errMsg || '支付未完成'}（错误码 ${code}）`))
    },
  }))
}

module.exports = { payForSku }
