const SITE = 'https://lingxifield.cn'
const SHARE_IMAGE = `${SITE}/og-lingxifield-20260925.jpg`

const PRIVATE_PREFIXES = [
  '/account',
  '/ai-wallet',
  '/api/wechat/mini/account-link/',
]

function cleanPath(input) {
  if (typeof input !== 'string') return '/'
  const value = input.trim()
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  const cut = value.search(/[?#]/)
  const pathname = cut === -1 ? value : value.slice(0, cut)
  if (!pathname || pathname.includes('//') || pathname.includes('\\')) return '/'
  return pathname
}

function publicWebPath(input) {
  const pathname = cleanPath(input)
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return '/'
  }
  return pathname
}

function enableShareMenu() {
  if (typeof wx.showShareMenu !== 'function') return
  wx.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline'],
  })
}

function copyWebLink(input, label = '链接已复制') {
  const pathname = publicWebPath(input)
  wx.setClipboardData({
    data: `${SITE}${pathname}`,
    success() {
      wx.showToast({ title: label, icon: 'success' })
    },
    fail() {
      wx.showToast({ title: '复制失败，请重试', icon: 'none' })
    },
  })
}

function appMessage(title, miniPath) {
  return {
    title,
    path: miniPath,
    imageUrl: SHARE_IMAGE,
  }
}

function timeline(title, query = '') {
  return {
    title,
    query,
    imageUrl: SHARE_IMAGE,
  }
}

module.exports = {
  SITE,
  SHARE_IMAGE,
  publicWebPath,
  enableShareMenu,
  copyWebLink,
  appMessage,
  timeline,
}
