// Web-view needs the registered business domain, not the request API domain.
const WEB_BASE = 'https://lingxifield.cn'
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
 return `${WEB_BASE}${route}${separator}mini=1&ads=0&currency=${preferredCurrency()}${hash}`
}
const SHARE_TITLES={'/':'灵犀场 · 全球智能服务与实用工具平台','/siai':'灵犀场 · 全球 SIAI 排行榜','/sasi':'灵犀场 · SASI 智能软件市场','/sasi/seller':'灵犀场 · SASI 卖家工作台','/sasi/delivery':'灵犀场 · 软件授权与自动交付','/tools':'灵犀场 · 100+ 实用工具','/discoveries':'灵犀场 · 奇闻发现','/partners':'灵犀场 · 全球合作伙伴'}
function shareTitleFor(path){return SHARE_TITLES[publicWebPath(path)]||'灵犀场 LINGXIFIELD'}
Page({
 data:{src:'',path:'/tools',loading:true,failed:false},
 onLoad(options){enableShareMenu({includeTimeline:true});const decoded=safeDecode(options.path||'/tools'),path=normalizeMiniPath(decoded);if(!path){this.setData({loading:false,failed:true});wx.showModal({title:'暂时无法打开',content:'这个入口暂时没有连接到当前小程序。',showCancel:false});return}this.setData({src:withMiniContext(path),path,loading:true,failed:false})},
 onShow(){enableShareMenu({includeTimeline:true})},
 onHide(){this.clearPreviousCheckout()},
 onUnload(){this.clearPreviousCheckout()},
 clearPreviousCheckout(){if(this.data.path.includes('miniLink=')){wx.removeStorageSync('lx_mini_topup_pending');wx.removeStorageSync('lx_mini_last_payment_error')}},
 handleLoad(){this.setData({loading:false,failed:false})},
 handleError(event){console.warn('[mini webview load failed]',event&&event.detail);this.setData({loading:false,failed:true});wx.showModal({title:'页面没有打开',content:'请确认网络正常后重试。',showCancel:false})},
 retry(){const path=normalizeMiniPath(this.data.path);if(!path)return;const next=withMiniContext(path);this.setData({src:'',loading:true,failed:false});setTimeout(()=>this.setData({src:next}),50)},
 copyCurrentLink(){copyWebLink(this.data.path,'当前页面链接已复制')},
 onShareAppMessage(){const sharePath=publicWebPath(this.data.path);return appMessage(shareTitleFor(sharePath),`/pages/web/index?path=${encodeURIComponent(sharePath)}`)},
 onShareTimeline(){const sharePath=publicWebPath(this.data.path);return timeline(shareTitleFor(sharePath),`path=${encodeURIComponent(sharePath)}`)},
})
