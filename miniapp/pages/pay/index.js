const { request } = require('../../utils/api')

Page({
  data:{quoteId:'',quote:null,busy:false,message:''},
  async onLoad(options){
    const quoteId=String(options.quoteId||'')
    this.setData({quoteId})
    if(!quoteId){this.setData({message:'这次价格已经失效，请返回工具重新确认。'});return}
    try{
      const quote=await request(`/api/wechat/mini/tool-pay/quote?quoteId=${encodeURIComponent(quoteId)}`)
      this.setData({quote})
    }catch(_){this.setData({message:'这次价格已经失效，请返回工具重新确认。'})}
  },
  async pay(){
    if(this.data.busy||!this.data.quoteId)return
    this.setData({busy:true,message:''})
    let created=null
    try{
      created=await request('/api/wechat/mini/tool-pay/create',{method:'POST',data:{quoteId:this.data.quoteId}})
      if(created.paid){wx.showToast({title:'支付已确认',icon:'success'});setTimeout(()=>wx.navigateBack(),600);return}
      const payment=created.payment
      await new Promise((resolve,reject)=>wx.requestPayment({...payment,success:resolve,fail:reject}))
      wx.showToast({title:'支付完成',icon:'success'})
      setTimeout(()=>wx.navigateBack(),800)
    }catch(error){
      if(created&&created.orderId){
        try{await request('/api/wechat/mini/tool-pay/cancel',{method:'POST',data:{orderId:created.orderId,quoteId:this.data.quoteId}})}catch(_){}
      }
      const msg=error&&error.data&&error.data.error?error.data.error:'支付没有完成，可以重新尝试。'
      this.setData({message:msg})
    }finally{this.setData({busy:false})}
  },
  back(){wx.navigateBack()}
})
