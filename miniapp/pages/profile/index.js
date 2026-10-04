const { login, request, switchAccount } = require('../../utils/api')
const { SUPPORTED, initPage, copyFor, getLanguage, setLanguage } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')
const CURRENCIES=[{id:'CNY',label:'CNY ¥ 人民币'},{id:'USD',label:'USD $ 美元'}]
const CURRENCY_KEY='lx_currency'

const PROFILE_UI={
  'zh-CN':{notifications:'消息与公告',notificationsNote:'查看充值到账、退款进度和产品更新。',settings:'设置',settingsNote:'语言、币种与账户常用入口。'},
  en:{notifications:'Notifications',notificationsNote:'See top-ups, refund progress and product updates.',settings:'Settings',settingsNote:'Language, currency and account shortcuts.'},
  ja:{notifications:'通知',notificationsNote:'入金、返金進捗、更新を確認。',settings:'設定',settingsNote:'言語、通貨、アカウント入口。'},
  ko:{notifications:'알림',notificationsNote:'충전, 환불 진행, 업데이트 확인.',settings:'설정',settingsNote:'언어, 통화, 계정 바로가기.'},
  fr:{notifications:'Notifications',notificationsNote:'Recharges, remboursements et mises à jour.',settings:'Paramètres',settingsNote:'Langue, devise et accès du compte.'},
  de:{notifications:'Mitteilungen',notificationsNote:'Aufladungen, Erstattungen und Updates.',settings:'Einstellungen',settingsNote:'Sprache, Währung und Kontozugänge.'},
  es:{notifications:'Notificaciones',notificationsNote:'Recargas, reembolsos y novedades.',settings:'Ajustes',settingsNote:'Idioma, moneda y accesos de cuenta.'},
  pt:{notifications:'Notificações',notificationsNote:'Recargas, reembolsos e novidades.',settings:'Configurações',settingsNote:'Idioma, moeda e atalhos da conta.'},
  ar:{notifications:'الإشعارات',notificationsNote:'الشحن والاسترداد والتحديثات.',settings:'الإعدادات',settingsNote:'اللغة والعملة وروابط الحساب.'},
};

Page({
  data:{lang:'zh-CN',copy:{},ui:PROFILE_UI['zh-CN'],languages:SUPPORTED,languageIndex:0,currencies:CURRENCIES,currencyIndex:0,checking:true,connected:false,linking:false},
  refreshLanguage(lang){const index=Math.max(0,SUPPORTED.findIndex(item=>item.id===lang));this.setData({lang,copy:copyFor('profile',lang),ui:PROFILE_UI[lang]||PROFILE_UI['zh-CN'],languageIndex:index})},
  loadCurrency(){
    const saved=wx.getStorageSync(CURRENCY_KEY)
    const index=Math.max(0,CURRENCIES.findIndex(x=>x.id===saved))
    this.setData({currencyIndex:index})
  },
  changeCurrency(event){
    const index=Number(event.detail.value),item=CURRENCIES[index];if(!item)return
    wx.setStorageSync(CURRENCY_KEY,item.id);this.setData({currencyIndex:index})
    wx.showToast({title:item.id==='CNY'?'已切换人民币':'已切换美元',icon:'none'})
  },
  onLoad(){const lang=initPage(this,'profile');this.refreshLanguage(lang);this.loadCurrency();enableShareMenu();this.refreshIdentity()},
  onShow(){const lang=getLanguage();this.refreshLanguage(lang);this.loadCurrency();enableShareMenu()},
  changeLanguage(event){const index=Number(event.detail.value),item=SUPPORTED[index];if(!item)return;setLanguage(item.id);this.refreshLanguage(item.id)},
  async refreshIdentity(){this.setData({checking:true});try{await login();this.setData({connected:true})}catch(error){this.setData({connected:false});console.warn('[mini identity unavailable]',{statusCode:error&&error.statusCode})}finally{this.setData({checking:false})}},
  openOrders(){wx.navigateTo({url:'/pages/orders/index'})},
  openNotifications(){wx.navigateTo({url:'/pages/notifications/index'})},
  openSettings(){wx.navigateTo({url:'/pages/settings/index'})},
  openWeb(event){const path=event.currentTarget.dataset.path;if(!path)return;wx.navigateTo({url:`/pages/web/index?path=${encodeURIComponent(path)}&currency=${CURRENCIES[this.data.currencyIndex].id}`})},
  async connectExistingAccount(){if(this.data.linking)return;this.setData({linking:true});wx.showLoading({title:this.data.copy.preparing});try{const result=await request('/api/wechat/mini/account-link/start',{method:'POST'});wx.hideLoading();wx.navigateTo({url:`/pages/web/index?path=${encodeURIComponent(result.path)}`})}catch(error){wx.hideLoading();wx.showModal({title:this.data.copy.unavailable,content:this.data.copy.retry,showCancel:false})}finally{this.setData({linking:false})}},
  async relogin(){wx.showLoading({title:this.data.copy.reconnecting});try{await switchAccount();this.setData({connected:true});wx.showToast({title:this.data.copy.reconnected,icon:'success'})}catch(error){this.setData({connected:false});wx.showToast({title:this.data.copy.notConnected,icon:'none'})}finally{wx.hideLoading()}},
  copyLink(){copyWebLink('/')},
  onShareAppMessage(){return appMessage('灵犀场 LINGXIFIELD','/pages/create/index')},
  onShareTimeline(){return timeline('灵犀场 LINGXIFIELD')},
})
