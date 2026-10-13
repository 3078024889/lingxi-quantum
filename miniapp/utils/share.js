const SITE = 'https://lingxifield.cn'
const SHARE_IMAGE = "/assets/share-lingxifield-20260928.png"

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
  return pathname === '/' || pathname === '/sasi' || pathname === '/tools' || /^\/tools\/[a-z0-9-]+$/.test(pathname) || ['/ai-knowledge', '/ai-learning', '/ai-research'].includes(pathname) ? pathname : '/'
}

function publicWebPath(input) {
  const pathname = cleanPath(input)
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return '/'
  }
  if (pathname === '/sasi' && typeof input === 'string') {
    // Share the creation mode, never personal thread, project, or credential parameters.
    const query = input.split('?')[1]?.split('#')[0] || ''
    const match = query.match(/(?:^|&)mode=(chat|image|drama|website|book|learning|research)(?:&|$)/)
    if (match) return '/sasi?mode=' + match[1]
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

