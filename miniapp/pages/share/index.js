const SITE='https://lingxifield.cn'
const {publicWebPath,enableShareMenu}=require('../../utils/share')
Page({
 data:{title:'灵犀场 LINGXIFIELD',webPath:'/',webUrl:SITE},
 onLoad(options){
  let p='/';try{p=decodeURIComponent(options.path||'/')}catch(_){}
  if(!p.startsWith('/')||p.startsWith('//')||p.includes('://'))p='/'
  p=publicWebPath(p)
  let title='灵犀场 LINGXIFIELD';try{if(options.title)title=decodeURIComponent(options.title).slice(0,100)}catch(_){}
  this.setData({title,webPath:p,webUrl:`${SITE}${p}`})
  enableShareMenu()
 },
 copyLink(){wx.setClipboardData({data:this.data.webUrl})},
 open(){wx.navigateTo({url:'/pages/web/index?path='+encodeURIComponent(this.data.webPath),fail(){wx.showToast({title:'请点底部“前往小程序”打开',icon:'none'})}})},
 back(){if(getCurrentPages().length>1)wx.navigateBack();else wx.reLaunch({url:'/pages/web/index?path=%2Ftools'})},
 onShareAppMessage(){return{title:this.data.title,path:`/pages/web/index?path=${encodeURIComponent(this.data.webPath)}`,imageUrl:"/assets/share-lingxifield-20260928.png"}},
 onShareTimeline(){return{title:this.data.title,query:`path=${encodeURIComponent(this.data.webPath)}`,imageUrl:"/assets/share-lingxifield-20260928.png"}}
})
