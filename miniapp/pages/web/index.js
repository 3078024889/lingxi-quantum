const { API_BASE } = require('../../utils/api')

function withMiniContext(path) {
  const hashAt = path.indexOf('#')
  const route = hashAt >= 0 ? path.slice(0, hashAt) : path
  const hash = hashAt >= 0 ? path.slice(hashAt) : ''
  const separator = route.includes('?') ? '&' : '?'
  return `${API_BASE}${route}${separator}mini=1${hash}`
}

Page({
  data: { src: '' },
  onLoad(options) {
    const path = decodeURIComponent(options.path || '/')
    if (!path.startsWith('/') || path.startsWith('//')) return
    this.setData({ src: withMiniContext(path) })
  },
})
