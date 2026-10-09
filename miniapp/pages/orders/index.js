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
 async confirmVirtual(e){
  if(this.data.loading)return
  const id=String(e.currentTarget.dataset.id||'')
  this.setData({loading:true,message:''})
  try{const result=await request(`/api/wechat/mini/tool-pay/status?orderId=${encodeURIComponent(id)}`);this.setData({message:result.paid?'付款已确认。':'付款结果仍在确认，请稍后再试。'})}
  catch(_){this.setData({message:'结果暂未确认，请勿重复付款，稍后再试。'})}
  finally{this.setData({loading:false})}
  const message=this.data.message
  await this.load();this.setData({message})
 },
 statusText(s){return s==='paid'?'已支付':s==='pending'?'待支付':s==='refunded'?'已退款':s==='canceled'?'已取消':s}
})
