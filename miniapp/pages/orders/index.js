const { request } = require('../../utils/api')
Page({
 data:{loading:true,orders:[],message:''},
 async onLoad(){await this.load()},
 async onShow(){if(!this.data.loading)await this.load()},
 async load(){
  this.setData({loading:true,message:''})
  try{
   const d=await request('/api/wechat/mini/orders')
   this.setData({orders:Array.isArray(d.orders)?d.orders:[]})
  }catch(_){this.setData({message:'订单暂时没有加载出来，请稍后再试。'})}
  finally{this.setData({loading:false})}
 },
 statusText(s){return s==='paid'?'已支付':s==='pending'?'待支付':s==='refunded'?'已退款':s==='canceled'?'已取消':s}
})