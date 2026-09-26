const { API_BASE } = require('../../utils/api')
const {
  enableShareMenu,
  copyWebLink,
  publicWebPath,
  appMessage,
  timeline,
} = require('../../utils/share')

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
]

const MAX_PATH_LENGTH = 2048

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch (_) {
    return ''
  }
}

function normalizeMiniPath(input) {
  if (typeof input !== 'string') return ''
  const value = input.trim()
  if (!value || value.length > MAX_PATH_LENGTH) return ''
  if (!value.startsWith('/') || value.startsWith('//')) return ''
  if (value.includes('\\') || value.includes('\u0000') || /[\r\n]/.test(value)) return ''
  if (value.includes('://')) return ''

  const cut = value.search(/[?#]/)
  const pathname = cut === -1 ? value : value.slice(0, cut)
  if (!pathname || pathname.includes('//')) return ''

  const segments = pathname.split('/')
  if (segments.some((segment) => segment === '.' || segment === '..')) return ''

  const allowed =
    EXACT_ALLOWED.has(pathname) ||
    PREFIX_ALLOWED.some((prefix) => pathname.startsWith(prefix))
  if (!allowed) return ''

  return value
}

function withMiniContext(path) {
  const hashAt = path.indexOf('#')
  const route = hashAt >= 0 ? path.slice(0, hashAt) : path
  const hash = hashAt >= 0 ? path.slice(hashAt) : ''
  const separator = route.includes('?') ? '&' : '?'
  return `${API_BASE}${route}${separator}mini=1&ads=0${hash}`
}

const SHARE_TITLES = {
  '/': '灵犀场 · 一键创造，一念即达',
  '/sasi': '灵犀场 SASI · 创作',
  '/sasi/drama': '灵犀场 · 短剧创作',
  '/sasi/connections': '灵犀场 · 扩展能力',
  '/tools': '灵犀场 · 实用工具',
  '/ai-knowledge': '灵犀场 · 资料变成可用知识',
  '/ai-learning': '灵犀场 · 学习 SASI',
  '/ai-research': '灵犀场 · 科研 SASI',
}

function shareTitleFor(path) {
  const pathname = publicWebPath(path)
  return SHARE_TITLES[pathname] || '灵犀场 LINGXIFIELD'
}

Page({
  data: {
    src: '',
    path: '/',
    loading: true,
    failed: false,
  },

  onLoad(options) {
    enableShareMenu()
    const decoded = safeDecode(options.path || '/')
    const path = normalizeMiniPath(decoded)
    if (!path) {
      this.setData({ loading: false, failed: true })
      wx.showModal({
        title: '暂时无法打开',
        content: '这个入口暂时没有连接到当前小程序。',
        showCancel: false,
      })
      return
    }

    this.setData({
      src: withMiniContext(path),
      path,
      loading: true,
      failed: false,
    })
  },

  onShow() {
    enableShareMenu()
  },

  handleLoad() {
    this.setData({ loading: false, failed: false })
  },

  handleError(event) {
    console.warn('[mini webview load failed]', event && event.detail)
    this.setData({ loading: false, failed: true })
    wx.showModal({
      title: '页面没有打开',
      content: '请确认网络正常后重试。',
      showCancel: false,
    })
  },

  retry() {
    const path = normalizeMiniPath(this.data.path)
    if (!path) return
    const next = withMiniContext(path)
    this.setData({ src: '', loading: true, failed: false })
    setTimeout(() => this.setData({ src: next }), 50)
  },

  copyCurrentLink() {
    copyWebLink(this.data.path, '当前页面链接已复制')
  },

  onShareAppMessage() {
    const sharePath = publicWebPath(this.data.path)
    return appMessage(
      shareTitleFor(sharePath),
      `/pages/web/index?path=${encodeURIComponent(sharePath)}`
    )
  },

  onShareTimeline() {
    const sharePath = publicWebPath(this.data.path)
    return timeline(
      shareTitleFor(sharePath),
      `path=${encodeURIComponent(sharePath)}`
    )
  },
})
