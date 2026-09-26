const SITE='https://lingxifield.cn'
Page({
 data:{title:'灵犀场 LINGXIFIELD',webPath:'/',webUrl:SITE},
 onLoad(options){
  let p='/';try{p=decodeURIComponent(options.path||'/')}catch(_){}
  if(!p.startsWith('/')||p.startsWith('//')||p.includes('://'))p='/'
  const cut=p.search(/[?#]/);if(cut>=0)p=p.slice(0,cut)
  if(p.startsWith('/account')||p.startsWith('/ai-wallet')||p.startsWith('/api/'))p='/'
  let title='灵犀场 LINGXIFIELD';try{if(options.title)title=decodeURIComponent(options.title)}catch(_){}
  this.setData({title,webPath:p,webUrl:`${SITE}${p}`})
  wx.showShareMenu({menus:['shareAppMessage','shareTimeline']})
 },
 copyLink(){wx.setClipboardData({data:this.data.webUrl})},
 back(){if(getCurrentPages().length>1)wx.navigateBack();else wx.switchTab({url:'/pages/tools/index'})},
 onShareAppMessage(){return{title:this.data.title,path:`/pages/web/index?path=${encodeURIComponent(this.data.webPath)}`,imageUrl:`${SITE}/og-lingxifield-20260925.jpg`}},
 onShareTimeline(){return{title:this.data.title,query:`path=${encodeURIComponent(this.data.webPath)}`,imageUrl:`${SITE}/og-lingxifield-20260925.jpg`}}
})
