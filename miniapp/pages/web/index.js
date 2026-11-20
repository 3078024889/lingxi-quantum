// Web-view needs the registered business domain, not the request API domain.
const WEB_BASE = 'https://lingxifield.cn'
const USD_WALLET_PATH = '/ai-wallet?currency=USD#wallet-topup'
const USD_BROWSER_URL = 'https://lingxifield.com' + USD_WALLET_PATH
const { enableShareMenu, copyWebLink, publicWebPath, appMessage, timeline } = require('../../utils/share')
const EXACT_ALLOWED=new Set(['/','/siai','/sasi','/sasi/seller','/sasi/delivery','/tools','/discoveries','/partners','/about','/account','/account/orders','/account/notifications','/ai-wallet','/sasi/pricing','/privacy','/terms','/refunds'])
const PREFIX_ALLOWED=['/tools/','/api/wechat/mini/account-link/'],MAX_PATH_LENGTH=2048,CURRENCY_KEY='lx_currency'
function safeDecode(value){try{return decodeURIComponent(value)}catch(_){return''}}
function normalizeMiniPath(input){
 if(typeof input!=='string')return'';const value=input.trim();if(!value||value.length>MAX_PATH_LENGTH||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||value.includes('\u0000')||/[\r\n]/.test(value)||value.includes('://'))return''
 const cut=value.search(/[?#]/),pathname=cut===-1?value:value.slice(0,cut);if(!pathname||pathname.includes('//'))return''
 const segments=pathname.split('/');if(segments.some(segment=>segment==='.'||segment==='..'))return''
 return EXACT_ALLOWED.has(pathname)||PREFIX_ALLOWED.some(prefix=>pathname.startsWith(prefix))?value:''
}
function preferredCurrency(){const value=wx.getStorageSync(CURRENCY_KEY);return value==='USD'?'USD':'CNY'}
function withMiniContext(path){
 const hashAt=path.indexOf('#'),route=hashAt>=0?path.slice(0,hashAt):path,hash=hashAt>=0?path.slice(hashAt):'',separator=route.includes('?')?'&':'?'
 const currencyParam=/(?:[?&])currency=/.test(route)?'':'&currency='+preferredCurrency()
 return WEB_BASE+route+separator+'mini=1&ads=0'+currencyParam+hash
}
const SHARE_TITLES={'/':'灵犀场 · 全球智能服务与实用工具','/siai':'灵犀场 · 全球 SIAI 排行榜','/sasi':'灵犀场 · SASI 智能软件市场','/tools':'灵犀场 · 100+ 实用工具'}
function shareTitleFor(path){return SHARE_TITLES[publicWebPath(path)]||'灵犀场 LINGXIFIELD'}
function shareablePath(options,fallback){
 const current=options&&typeof options.webViewUrl==='string'?options.webViewUrl:''
 if(current.startsWith(WEB_BASE)){
  const candidate=normalizeMiniPath(current.slice(WEB_BASE.length)||'/')
  if(candidate)return publicWebPath(candidate)
 }
 return publicWebPath(fallback)
}
Page({
 data:{src:'',path:'/',loading:true,failed:false,usdWallet:false,usdBrowserUrl:USD_BROWSER_URL},
 onLoad(options){
  enableShareMenu({includeTimeline:true});
  if(options.usdWallet==='1'){
   this.setData({path:USD_WALLET_PATH,loading:false,usdWallet:true})
   return
  }
  const decoded=safeDecode(options.path||'/'),path=normalizeMiniPath(decoded);if(!path){this.setData({loading:false,failed:true});wx.showModal({title:'暂时无法打开',content:'这个入口暂时没有连接到当前小程序。',showCancel:false});return}this.setData({src:withMiniContext(path),path,loading:true,failed:false})},
 openUsdWebsite(){
  this.setData({src:withMiniContext(USD_WALLET_PATH),loading:true,failed:false})
 },
 copyUsdWebsite(){
  wx.setClipboardData({
   data:USD_BROWSER_URL,
   success(){wx.showToast({title:'官网链接已复制',icon:'none'})},
   fail(){wx.showToast({title:'请长按上方网址复制',icon:'none'})},
  })
 },
 onShow(){enableShareMenu({includeTimeline:true})},
 handleLoad(){this.setData({loading:false,failed:false})},
 handleError(){this.setData({src:'',loading:false,failed:true});if(this.data.usdWallet)return;wx.showModal({title:'页面没有打开',content:'请确认网络正常后重试。',showCancel:false})},
 retry(){const path=normalizeMiniPath(this.data.path);if(!path)return;const next=withMiniContext(path);this.setData({src:'',loading:true,failed:false});setTimeout(()=>this.setData({src:next}),50)},
 copyCurrentLink(){copyWebLink(this.data.path,'当前页面链接已复制')},
 openNativeShare(){const sharePath=publicWebPath(this.data.path);const title=shareTitleFor(sharePath);wx.navigateTo({url:'/pages/share/index?path='+encodeURIComponent(sharePath)+'&title='+encodeURIComponent(title),fail(){wx.showToast({title:'暂时无法打开分享页，请重试',icon:'none'})}})},
 onShareAppMessage(options){const sharePath=shareablePath(options,this.data.path);return appMessage(shareTitleFor(sharePath),'/pages/web/index?path='+encodeURIComponent(sharePath))},
 onShareTimeline(options){const sharePath=shareablePath(options,this.data.path);return timeline(shareTitleFor(sharePath),'path='+encodeURIComponent(sharePath))},
})
