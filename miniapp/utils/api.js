const API_BASE = 'https://lingxifield.cn'

function wxLogin() {
  return new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }))
}

function rawRequest(options) {
  return new Promise((resolve, reject) => wx.request({
    ...options,
    success(res) {
      if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
      else reject({ statusCode: res.statusCode, data: res.data })
    },
    fail: reject,
  }))
}

async function login(force = false) {
  const token = wx.getStorageSync('lx_mini_token')
  const expiresAt = wx.getStorageSync('lx_mini_expires')
  if (!force && token && expiresAt && Date.parse(expiresAt) > Date.now() + 60000) return token
  const { code } = await wxLogin()
  const result = await rawRequest({ url: `${API_BASE}/api/wechat/mini/login`, method: 'POST', data: { code } })
  wx.setStorageSync('lx_mini_token', result.token)
  wx.setStorageSync('lx_mini_expires', result.expiresAt)
  return result.token
}

async function request(path, options = {}, retried = false) {
  const token = await login()
  try {
    return await rawRequest({
      url: `${API_BASE}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    })
  } catch (error) {
    if (!retried && error.statusCode === 401) {
      await login(true)
      return request(path, options, true)
    }
    throw error
  }
}

async function publicRequest(path) {
  return rawRequest({ url: `${API_BASE}${path}`, method: 'GET' })
}

module.exports = { API_BASE, login, request, publicRequest, wxLogin }
