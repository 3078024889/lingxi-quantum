const { API_BASE } = require('../../utils/api')
const { initPage, copyFor, listFor } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

Page({
  data: { lang: 'zh-CN', copy: {}, tools: [], priceBySlug: {} },

  decorateTools(lang) {
    const prices=this.data.priceBySlug||{}
    return listFor('tools', lang).map(item=>{
      const slug=String(item.path||'').replace(/^\/tools\//,'').split(/[?#]/)[0]
      return {...item,price:prices[slug]||''}
    })
  },

  refreshLanguage(lang) {
    this.setData({ lang, copy: copyFor('tools', lang), tools: this.decorateTools(lang) })
  },

  loadPrices() {
    wx.request({
      url: `${API_BASE}/api/tools/pricing?currency=CNY`,
      method: 'GET',
      success: (res) => {
        const items=Array.isArray(res.data&&res.data.items)?res.data.items:[]
        const unit=(name)=>{
          if(name==='calculation')return '次'
          if(name==='image')return '张'
          if(name==='minute')return '分钟'
          if(name==='page')return '页'
          if(name==='file')return '个文件'
          if(name==='email')return '个邮箱'
          if(name==='mb')return 'MB'
          return '次'
        }
        const map={}
        for(const x of items){
          if(!x||!x.tool_id)continue
          map[x.tool_id]=`¥${Number(x.amount_rmb||0).toFixed(2)} / ${unit(x.unit_name)}`
        }
        this.setData({priceBySlug:map,tools:this.decorateTools(this.data.lang)})
      },
      fail:()=>{}
    })
  },

  onLoad() {
    const lang = initPage(this, 'tools')
    this.refreshLanguage(lang)
    this.loadPrices()
    enableShareMenu()
  },

  onShow() {
    const lang = initPage(this, 'tools')
    this.refreshLanguage(lang)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.tools[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  allTools() { wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/tools')}` }) },
  copyLink() { copyWebLink('/tools') },
  onShareAppMessage() { return appMessage('灵犀场 · 实用工具', '/pages/tools/index') },
  onShareTimeline() { return timeline('灵犀场 · 实用工具') },
})
