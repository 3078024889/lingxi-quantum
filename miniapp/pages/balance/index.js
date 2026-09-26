const { request, wxLogin } = require('../../utils/api')

const OPTIONS=[
 {id:'ai-balance-10',amount:10},
 {id:'ai-balance-30',amount:30},
 {id:'ai-balance-50',amount:50},
 {id:'ai-balance-100',amount:100},
 {id:'ai-balance-300',amount:300},
 {id:'ai-balance-500',amount:500},
]

Page({
 data:{options:OPTIONS,selected:2,busy:false,message:'',orderId:''},
 select(e){if(this.data.busy)return;this.setData({selected:Number(e.currentTarget.dataset.index),message:''})},
 async pay(){
  if(this.data.busy)return
  const item=OPTIONS[this.data.selected]||OPTIONS[2]
  this.setData({busy:true,message:''})
  try{
   const login=await wxLogin()
   const created=await request('/api/wechat/mini/balance-pay/create',{method:'POST',data:{productId:item.id,code:login.code}})
   if(!created.payment||!created.orderId)throw {data:{error:'支付没有准备成功，请稍后再试'}}
   this.setData({orderId:created.orderId})
   await new Promise((resolve,reject)=>wx.requestPayment({...created.payment,success:resolve,fail:reject}))
   wx.showLoading({title:'正在确认到账'})
   let paid=false
   for(let i=0;i<12;i++){
    await new Promise(r=>setTimeout(r,1000))
    try{
     const s=await request(`/api/wechat/mini/balance-pay/status?orderId=${encodeURIComponent(created.orderId)}`)
     if(s.order&&s.order.status==='paid'){paid=true;break}
    }catch(_){}
   }
   wx.hideLoading()
   if(paid){
    wx.showToast({title:'充值已到账',icon:'success'})
    setTimeout(()=>wx.navigateBack(),900)
   }else{
    this.setData({message:'微信已返回支付结果，到账状态正在同步。可在订单中心查看最新状态。'})
   }
  }catch(error){
   const raw=error&&error.errMsg?String(error.errMsg):''
   const canceled=/cancel/i.test(raw)
   const msg=canceled?'支付已取消，没有扣款。':(error&&error.data&&error.data.error?error.data.error:'支付没有完成，可以重新尝试。')
   this.setData({message:msg})
  }finally{try{wx.hideLoading()}catch(_){}this.setData({busy:false})}
 },
 openOrders(){wx.navigateTo({url:'/pages/orders/index'})}
})
