function compareVersion(a, b) {
 const left = String(a || '').split('.').map(Number), right = b.split('.').map(Number)
 for (let i = 0; i < Math.max(left.length, right.length); i++) {
  if ((left[i] || 0) !== (right[i] || 0)) return (left[i] || 0) > (right[i] || 0) ? 1 : -1
 }
 return 0
}
function deviceInfo() {
 try { return wx.getSystemInfoSync() } catch (_) { return {} }
}
const IOS_CONDITIONS = '苹果支付仅支持中国大陆 App Store 账户、iOS 15及以上、微信8.0.68及以上，单笔金额至少1元。香港或其他地区 App Store 账户暂不支持此支付。'
function preflight(minor) {
 const info = deviceInfo()
 if (info.platform !== 'ios') return ''
 if (minor < 100) return `苹果支付单笔至少1元。${IOS_CONDITIONS}`
 const os = /(?:iOS|iPadOS)\s*(\d+(?:\.\d+)*)/i.exec(info.system || '')
 if ((os && compareVersion(os[1], '15') < 0) || (info.version && compareVersion(info.version, '8.0.68') < 0)) return IOS_CONDITIONS
 return ''
}
function failureMessage(error) {
 const rawCode = error && (error.errCode ?? error.errcode)
 const code = rawCode === undefined ? null : Number(rawCode)
 const errors = { '-2': '已取消付款。', '-4': '支付被风控拒绝，请稍后再试。', '-15002': '该支付单号已使用，请开始新充值。', '-15005': '支付身份签名校验失败。', '-15006': '商家支付签名校验失败。', '-15007': '微信支付登录已过期，请重新进入小程序。', '-15008': '商家虚拟支付进件尚未完成。', '-15010': '充值道具尚未发布。', '-15013': '充值道具价格与微信配置不一致。', '-15014': '充值道具发布尚未生效，请稍后再试。', '-15017': '微信限制了商家收款，暂时无法付款。', '-15018': '充值道具未通过审核。', '-15019': '微信限制了商家收款，暂时无法付款。', '-15020': '操作过快，请稍后再试。', '-15021': '微信暂时限制交易频率。' }
 const text = errors[String(code)] || (error && error.data && error.data.error) || '支付未完成。'
 const suffix = Number.isFinite(code) ? `（错误码${code}）` : ''
 return `${text}${suffix}${deviceInfo().platform === 'ios' && !errors[String(code)] ? IOS_CONDITIONS : ''}`
}
function iosNotice() { return deviceInfo().platform === 'ios' ? IOS_CONDITIONS : '' }
module.exports = { compareVersion, preflight, failureMessage, iosNotice, IOS_CONDITIONS }
