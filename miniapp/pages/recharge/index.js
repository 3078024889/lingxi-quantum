const profile=require('../../utils/app-profile')
Page({
 data:{busy:false,error:''},
 continue(){if(this.data.busy)return;this.setData({busy:true,error:''});wx.navigateToMiniProgram({appId:profile.mainAppId,path:'pages/balance/index',envVersion:'release',complete:()=>this.setData({busy:false}),fail:()=>this.setData({error:'未能打开充值，请重试。'})})},
 website(){wx.setClipboardData({data:profile.website+'/ai-wallet',success:()=>wx.showToast({title:'官网充值链接已复制',icon:'none'})})},
 orders(){wx.navigateTo({url:'/pages/orders/index'})},
})
