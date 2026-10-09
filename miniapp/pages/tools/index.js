const { initPage, copyFor, listFor } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

// Keep public native introductions reachable from the tool list, not only from search.
const DISCOVERY_PAGES = {
  '/tools/temp-mail': '/pages/discover-temp-mail/index',
  '/tools/burn-after-read': '/pages/discover-burn-after-read/index',
  '/tools/image-watermark-remover': '/pages/discover-image-watermark-remover/index',
  '/tools/e-sign-pdf': '/pages/discover-e-sign-pdf/index',
}
const SIGN_LABELS = {
  'zh-CN': 'PDF电子签名', en: 'Sign a PDF', ja: 'PDF電子署名',
  ko: 'PDF 전자서명', fr: 'Signer un PDF', de: 'PDF unterschreiben',
  es: 'Firmar un PDF', pt: 'Assinar um PDF', ar: 'توقيع PDF',
}

Page({
  data:{lang:'zh-CN',copy:{},tools:[]},
  refreshLanguage(lang){const tools=listFor('tools',lang);if(!tools.some(item=>item.path==='/tools/e-sign-pdf'))tools.push({title:SIGN_LABELS[lang]||SIGN_LABELS['zh-CN'],note:'',path:'/tools/e-sign-pdf'});this.setData({lang,copy:copyFor('tools',lang),tools})},
  onLoad(){const lang=initPage(this,'tools');this.refreshLanguage(lang);enableShareMenu()},
  onShow(){const lang=initPage(this,'tools');this.refreshLanguage(lang);enableShareMenu()},
  open(event){const item=this.data.tools[event.currentTarget.dataset.index];if(!item)return;wx.navigateTo({url:DISCOVERY_PAGES[item.path] || `/pages/web/index?path=${encodeURIComponent(item.path)}`})},
  allTools(){wx.navigateTo({url:`/pages/web/index?path=${encodeURIComponent('/tools')}`})},
  copyLink(){copyWebLink('/tools')},
  onShareAppMessage(){return appMessage('灵犀场 · 实用工具','/pages/tools/index')},
  onShareTimeline(){return timeline('灵犀场 · 实用工具')},
})
