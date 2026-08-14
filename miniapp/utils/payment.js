const { request, wxLogin } = require('./api')

const ERROR_MESSAGES = {
  '-4': '本次交易触发安全保护，请稍后再试',
  '-15001': '支付参数异常，请联系客服',
  '-15002': '订单号已使用，请重新发起',
  '-15003': '支付系统繁忙，请稍后再试',
  '-15005': '微信登录态失效，请重新进入',
  '-15006': '支付签名校验失败，请联系客服',
  '-15007': '微信登录态过期，请重新发起',
  '-15010': '该内容尚未发布，请稍后再试',
  '-15013': '商品价格配置不一致，请联系客服',
  '-15014': '商品配置正在生效，请十分钟后再试',
  '-15020': '操作过快，请稍后再试',
}

function supportsVirtualPay() {
  return typeof wx.requestVirtualPayment === 'function' || wx.canIUse('requestVirtualPayment')
}

async function payForSku(skuId, submissionId) {
  if (!supportsVirtualPay()) throw new Error('当前微信版本过低，请升级微信后再试')
  const { code } = await wxLogin()
  const result = await request('/api/wechat/mini/pay/create', {
    method: 'POST', data: { skuId, code, submissionId },
  })
  return new Promise((resolve, reject) => wx.requestVirtualPayment({
    ...result.payment,
    success: () => resolve({ orderId: result.orderId }),
    fail: (error) => {
      if (Number(error.errCode) === -2) return reject(Object.assign(new Error('cancelled'), { cancelled: true }))
      reject(new Error(ERROR_MESSAGES[String(error.errCode)] || error.errMsg || '支付未完成'))
    },
  }))
}

module.exports = { payForSku }
