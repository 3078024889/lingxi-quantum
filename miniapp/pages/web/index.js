const { API_BASE } = require('../../utils/api')

const EXACT_ALLOWED = new Set([
  '/',
  '/sasi',
  '/sasi/drama',
  '/sasi/connections',
  '/tools',
  '/ai-knowledge',
  '/ai-learning',
  '/ai-research',
  '/account',
  '/account/orders',
  '/ai-wallet',
  '/privacy',
  '/terms',
  '/refunds',
])

const PREFIX_ALLOWED = [
  '/tools/',
  '/api/wechat/mini/account-link/',
  '/api/wechat/mini/content-open',
  '/api/wechat/mini/report-open',
  '/api/wechat/mini/pdf-download',
]

function normalizeMiniPath(input) {
  if (typeof input !== 'string' || !input.startsWith('/') || input.startsWith('//')) return ''
  let parsed
  try {
    parsed = new URL(input, API_BASE)
  } catch (_) {
    return ''
  }
  if (parsed.origin !== API_BASE) return ''
  const pathname = parsed.pathname
  if (!EXACT_ALLOWED.has(pathname) && !PREFIX_ALLOWED.some((prefix) => pathname.startsWith(prefix))) return ''
  return `${pathname}${parsed.search}${parsed.hash}`
}

function withMiniContext(path) {
  const hashAt = path.indexOf('#')
  const route = hashAt >= 0 ? path.slice(0, hashAt) : path
  const hash = hashAt >= 0 ? path.slice(hashAt) : ''
  const separator = route.includes('?') ? '&' : '?'
  return `${API_BASE}${route}${separator}mini=1${hash}`
}

const SHARE_TITLES = {
  '/': '灵犀场 · 一键创造，一念即达',
  '/sasi': '灵犀场 SASI · AI 创作',
  '/sasi/drama': '灵犀场 · AI 短剧',
  '/tools': '灵犀场 · 实用工具',
  '/ai-knowledge': '灵犀场 · 资料变成活的 Agent',
  '/ai-learning': '灵犀场 · 学习 SASI',
  '/ai-research': '灵犀场 · 科研 SASI',
}

function shareTitleFor(path) {
  return SHARE_TITLES[path] || '灵犀场 LINGXIFIELD'
}

Page({
  data: { src: '', path: '/' },

  onLoad(options) {
    const decoded = decodeURIComponent(options.path || '/')
    const path = normalizeMiniPath(decoded)
    if (!path) {
      wx.showToast({ title: '这个入口暂不支持在小程序打开', icon: 'none' })
      return
    }
    this.setData({ src: withMiniContext(path), path })
  },

  onShareAppMessage() {
    return {
      title: shareTitleFor(this.data.path),
      path: `/pages/web/index?path=${encodeURIComponent(this.data.path)}`,
      imageUrl: 'https://lingxifield.cn/og-sasi-20260920.png',
    }
  },

  onShareTimeline() {
    return {
      title: shareTitleFor(this.data.path),
      imageUrl: 'https://lingxifield.cn/og-sasi-20260920.png',
    }
  },
})
