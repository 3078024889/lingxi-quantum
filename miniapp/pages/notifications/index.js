const { request } = require('../../utils/api')
const { getLanguage } = require('../../utils/i18n')
const TEXT={
 'zh-CN':{title:'通知与进度',empty:'暂时没有新的通知。',topup:'充值已到账',withdraw:'退款进度',done:'退款已完成',fail:'退款未完成'},
 en:{title:'Notifications',empty:'No notifications yet.',topup:'Top-up received',withdraw:'Refund progress',done:'Refund completed',fail:'Refund not completed'},
 ja:{title:'通知と進捗',empty:'新しい通知はありません。',topup:'チャージ完了',withdraw:'返金状況',done:'返金完了',fail:'返金未完了'},
 ko:{title:'알림 및 진행 상황',empty:'새 알림이 없습니다.',topup:'충전 완료',withdraw:'환불 진행',done:'환불 완료',fail:'환불 미완료'},
 fr:{title:'Notifications',empty:'Aucune notification.',topup:'Solde crédité',withdraw:'Suivi du remboursement',done:'Remboursement terminé',fail:'Remboursement non terminé'},
 de:{title:'Mitteilungen',empty:'Keine neuen Mitteilungen.',topup:'Guthaben eingegangen',withdraw:'Erstattungsstatus',done:'Erstattung abgeschlossen',fail:'Erstattung nicht abgeschlossen'},
 es:{title:'Notificaciones',empty:'No hay notificaciones.',topup:'Saldo recibido',withdraw:'Estado del reembolso',done:'Reembolso completado',fail:'Reembolso no completado'},
 pt:{title:'Notificações',empty:'Nenhuma notificação.',topup:'Saldo recebido',withdraw:'Andamento do reembolso',done:'Reembolso concluído',fail:'Reembolso não concluído'},
 ar:{title:'الإشعارات والتقدم',empty:'لا توجد إشعارات جديدة.',topup:'تمت إضافة الرصيد',withdraw:'حالة الاسترداد',done:'اكتمل الاسترداد',fail:'لم يكتمل الاسترداد'}
}
function money(c,n){return c==='USD'?`$${(n/100).toFixed(2)}`:`¥${(n/100).toFixed(2)}`}
Page({
 data:{loading:true,items:[],copy:TEXT['zh-CN']},
 async onLoad(){await this.load()}, async onPullDownRefresh(){await this.load();wx.stopPullDownRefresh()},
 async load(){const lang=getLanguage(),copy=TEXT[lang]||TEXT['zh-CN'];this.setData({loading:true,copy});try{const d=await request(`/api/wechat/mini/notifications?lang=${encodeURIComponent(lang)}`);const items=(d.items||[]).map(x=>{if(x.kind==='announcement')return x;const amount=money(x.currency,x.amountMinor||0);if(x.kind==='topup')return {...x,title:copy.topup,body:`${amount}`};const failed=x.status==='failed'||x.status==='released';const done=x.status==='completed';return {...x,title:done?copy.done:failed?copy.fail:copy.withdraw,body:amount};});this.setData({items})}catch(_){this.setData({items:[]})}finally{this.setData({loading:false})}}
})
