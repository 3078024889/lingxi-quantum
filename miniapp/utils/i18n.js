const KEY = 'lx_language'

function getLanguage() {
  return wx.getStorageSync(KEY) === 'en' ? 'en' : 'zh'
}

function applyTabBar(lang = getLanguage()) {
  const labels = lang === 'en' ? ['Field', 'Insights', 'Free', 'My Field'] : ['灵犀场', '场域精测', '免费探索', '我的']
  labels.forEach((text, index) => {
    try { wx.setTabBarItem({ index, text }) } catch (_) {}
  })
}

function setLanguage(lang) {
  const next = lang === 'en' ? 'en' : 'zh'
  wx.setStorageSync(KEY, next)
  const app = getApp({ allowDefault: true })
  if (app && app.globalData) app.globalData.lang = next
  getCurrentPages().forEach((page) => page.setData({ lang: next }))
  applyTabBar(next)
  return next
}

function initPage(page) {
  const lang = getLanguage()
  page.setData({ lang })
  applyTabBar(lang)
  return lang
}

module.exports = { getLanguage, setLanguage, initPage, applyTabBar }
