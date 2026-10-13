const profile = require('../../utils/app-profile')
const share = require('../../utils/share')
const tools = [
 {title:'图片改尺寸',detail:'适配头像与社交平台',icon:'▧',tone:'blue',path:'/tools/resize-image'},
 {title:'图片压缩',detail:'让图片轻一点',icon:'◈',tone:'peach',path:'/tools/compress-image'},
 {title:'PDF 合并',detail:'多份文件合成一份',icon:'▤',tone:'purple',path:'/tools/merge-pdf'},
 {title:'图片转 PDF',detail:'整理照片与扫描件',icon:'▦',tone:'blue',path:'/tools/image-to-pdf'},
 {title:'二维码生成',detail:'文字与链接随手分享',icon:'⌘',tone:'mint',path:'/tools/qr-code-generator'},
 {title:'字数统计',detail:'字符、词数与字节',icon:'Aa',tone:'peach',path:'/tools/text-counter'},
 {title:'阅后即焚',detail:'设置私密内容的有效期',icon:'✦',tone:'purple',path:'/tools/burn-after-read'},
 {title:'JSON 格式化',detail:'整理与校验 JSON',icon:'{}',tone:'mint',path:'/tools/json-formatter'},
]
const allowed = new Set(['/', '/tools', '/sasi', '/sasi?mode=image', '/account', '/account/notifications', '/tools/temp-mail', ...tools.map(tool=>tool.path)])
Page({
 data:{tools,topInset:80},
 onLoad(){share.enableShareMenu();if(typeof wx.getMenuButtonBoundingClientRect==='function'){try{const rect=wx.getMenuButtonBoundingClientRect();if(rect&&Number.isFinite(rect.bottom)&&rect.bottom>0)this.setData({topInset:rect.bottom+12})}catch(_){}}},
 onShow(){share.enableShareMenu()},
 open(event){const path=event.currentTarget.dataset.path;if(!allowed.has(path))return;wx.navigateTo({url:'/pages/web/index?path='+encodeURIComponent(path)})},
 start(){wx.navigateTo({url:'/pages/web/index?path=%2Ftools%2Ftemp-mail'})},
 recharge(){wx.navigateTo({url:'/pages/recharge/index'})},
 mainApp(){wx.navigateToMiniProgram({appId:profile.mainAppId,path:'pages/web/index?path=%2F',envVersion:'release',fail:()=>wx.showModal({title:'暂未打开',content:'请重试，或点击官网入口继续使用。',showCancel:false})})},
 website(){wx.navigateTo({url:'/pages/web/index?path=%2F'})},
 copyWebsite(){wx.setClipboardData({data:profile.website,success:()=>wx.showToast({title:'官网链接已复制',icon:'none'})})},
 onShareAppMessage(){return share.appMessage('灵犀场 · 临时邮箱与随手工具','/pages/mail-home/index')},
 onShareTimeline(){return share.timeline('灵犀场 · 临时邮箱与随手工具')},
})
