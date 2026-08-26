const { API_BASE } = require('../../utils/api')

function withMiniContext(path) {
  const hashAt = path.indexOf('#')
  const route = hashAt >= 0 ? path.slice(0, hashAt) : path
  const hash = hashAt >= 0 ? path.slice(hashAt) : ''
  const separator = route.includes('?') ? '&' : '?'
  return `${API_BASE}${route}${separator}mini=1${hash}`
}

// 常见入口的分享文案，命中就用更贴切的标题；其余路径兜底成通用文案。
// —— 这里是修复"无法转发/无法分享/无法复制链接"的关键 ——
// <web-view> 内嵌的网页自己决定不了分享内容，分享参数只能由承载它的
// 这个原生页面提供。微信的规则是：只要一个页面含有 <web-view> 组件，
// 就必须由该原生页面显式实现 onShareAppMessage（转发给好友/群）和
// onShareTimeline（分享到朋友圈），否则微信会判定"这个页面不可分享"，
// 转发、朋友圈、复制链接三个入口会被系统整体置灰——这正是截图里的现象，
// 和页面里加载的具体网页内容无关，之前这个文件里完全没有这两个方法。
const SHARE_TITLES = {
  '/': '灵犀场 · 步入你的意识场域',
  '/live-as': '灵犀场 · 意识显化',
  '/dream': '灵犀场 · 探索梦境',
  '/#gates': '灵犀场 · 重塑潜意识',
  '/life-map': '生命图谱 · 照见你的生命结构',
  '/relationship': '关系共振 · 照见两个生命的交汇',
  '/resilience': '生命韧性指数 · 看见生命如何接住自己',
  '/romance': '桃花磁场指数 · 连接真实的吸引频率',
  '/wealth': '财富创造地图 · 照见你与丰盛对齐的方式',
  '/daily': '灵犀场 · 今日潮汐',
  '/mirror': '灵犀量子生命镜像 · 三重镜像',
  '/qian': '灵犀生命灵签 · 意识坐标读取',
}

function shareTitleFor(path) {
  return SHARE_TITLES[path] || '灵犀场 · 观测 · 觉察 · 连接'
}

Page({
  data: { src: '', path: '/' },
  onLoad(options) {
    const path = decodeURIComponent(options.path || '/')
    if (!path.startsWith('/') || path.startsWith('//')) return
    this.setData({ src: withMiniContext(path), path })
  },
  onShareAppMessage() {
    return {
      title: shareTitleFor(this.data.path),
      path: `/pages/web/index?path=${encodeURIComponent(this.data.path)}`,
      imageUrl: '/images/share-cover.jpg',
    }
  },
  onShareTimeline() {
    return {
      title: shareTitleFor(this.data.path),
      imageUrl: '/images/share-cover.jpg',
    }
  },
})
