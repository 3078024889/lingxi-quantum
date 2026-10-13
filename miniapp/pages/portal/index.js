const profile=require('../../utils/app-profile')
const share=require('../../utils/share')
const shortcuts=[{title:'临时邮箱',path:'/tools/temp-mail'},{title:'图片改尺寸',path:'/tools/resize-image'},{title:'压缩图片',path:'/tools/compress-image'},{title:'PDF 编辑',path:'/tools/pdf-editor'},{title:'二维码生成',path:'/tools/qr-code-generator'},{title:'阅后即焚',path:'/tools/burn-after-read'}]
Page({
 data:{title:profile.title,isMail:profile.kind==='temp-mail',shortcuts,topInset:80},
 onLoad(){share.enableShareMenu();if(typeof wx.getMenuButtonBoundingClientRect==='function'){try{const rect=wx.getMenuButtonBoundingClientRect();if(rect&&Number.isFinite(rect.bottom)&&rect.bottom>0)this.setData({topInset:rect.bottom+12})}catch(_){}}},onShow(){share.enableShareMenu()},
 open(event){const path=event.currentTarget.dataset.path;const allowed=[profile.homePath,'/tools','/sasi','/sasi?mode=image','/account','/account/notifications',...shortcuts.map(x=>x.path)];if(!allowed.includes(path))return;wx.navigateTo({url:'/pages/web/index?path='+encodeURIComponent(path)})},
 start(){wx.navigateTo({url:'/pages/web/index?path='+encodeURIComponent(profile.homePath)})},
 recharge(){wx.navigateTo({url:'/pages/balance/index'})},
 otherApp(){const target=profile.kind==='temp-mail'?profile.mainAppId:profile.tempMailAppId;wx.navigateToMiniProgram({appId:target,path:'pages/web/index?path='+encodeURIComponent('/'),envVersion:'release',fail:()=>{if(profile.kind==='main')wx.navigateTo({url:'/pages/web/index?path='+encodeURIComponent('/tools/temp-mail')});else wx.showModal({title:'暂未打开',content:'请重试，或通过官网继续使用。',showCancel:false})}})},
 website(){wx.setClipboardData({data:profile.website,success:()=>wx.showToast({title:'官网链接已复制',icon:'none'})})},
 onShareAppMessage(){return share.appMessage(profile.title,'/pages/portal/index')},
 onShareTimeline(){return share.timeline(profile.title)},
})
