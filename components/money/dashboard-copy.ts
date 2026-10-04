import type {LingxiLang} from '@/lib/lingxi-i18n';
type Copy={overview:string;withdraw:string;records:string;amount:string;date:string;channel:string;status:string;details:string;auto:string};
export const dashboardCopy:Record<LingxiLang,Copy>={
  "zh": {
    "overview": "账户总览",
    "withdraw": "提现",
    "records": "退款记录",
    "amount": "金额",
    "date": "申请时间",
    "channel": "原支付渠道",
    "status": "状态",
    "details": "查看详情",
    "auto": "处理中的进度自动更新"
  },
  "en": {
    "overview": "Account overview",
    "withdraw": "Withdraw",
    "records": "Refund history",
    "amount": "Amount",
    "date": "Requested",
    "channel": "Original payment method",
    "status": "Status",
    "details": "View details",
    "auto": "Progress updates automatically while processing"
  },
  "ja": {
    "overview": "アカウント概要",
    "withdraw": "返金申請",
    "records": "返金履歴",
    "amount": "金額",
    "date": "申請日時",
    "channel": "元の支払い方法",
    "status": "状態",
    "details": "詳細を見る",
    "auto": "処理中の進捗は自動更新されます"
  },
  "ko": {
    "overview": "계정 개요",
    "withdraw": "환불 신청",
    "records": "환불 기록",
    "amount": "금액",
    "date": "신청일",
    "channel": "원 결제수단",
    "status": "상태",
    "details": "상세 보기",
    "auto": "처리 중에는 진행 상황이 자동으로 갱신됩니다"
  },
  "fr": {
    "overview": "Aperçu du compte",
    "withdraw": "Demander un remboursement",
    "records": "Historique des remboursements",
    "amount": "Montant",
    "date": "Date de demande",
    "channel": "Moyen de paiement d’origine",
    "status": "Statut",
    "details": "Voir les détails",
    "auto": "La progression se met à jour automatiquement pendant le traitement"
  },
  "de": {
    "overview": "Kontoübersicht",
    "withdraw": "Erstattung beantragen",
    "records": "Erstattungsverlauf",
    "amount": "Betrag",
    "date": "Antragsdatum",
    "channel": "Ursprüngliche Zahlungsart",
    "status": "Status",
    "details": "Details ansehen",
    "auto": "Der Fortschritt wird während der Bearbeitung automatisch aktualisiert"
  },
  "es": {
    "overview": "Resumen de la cuenta",
    "withdraw": "Solicitar reembolso",
    "records": "Historial de reembolsos",
    "amount": "Importe",
    "date": "Fecha de solicitud",
    "channel": "Método de pago original",
    "status": "Estado",
    "details": "Ver detalles",
    "auto": "El progreso se actualiza automáticamente durante el proceso"
  },
  "pt": {
    "overview": "Visão geral da conta",
    "withdraw": "Solicitar reembolso",
    "records": "Histórico de reembolsos",
    "amount": "Valor",
    "date": "Data da solicitação",
    "channel": "Método de pagamento original",
    "status": "Estado",
    "details": "Ver detalhes",
    "auto": "O progresso é atualizado automaticamente durante o processamento"
  },
  "ar": {
    "overview": "نظرة عامة على الحساب",
    "withdraw": "طلب استرداد",
    "records": "سجل الاسترداد",
    "amount": "المبلغ",
    "date": "تاريخ الطلب",
    "channel": "وسيلة الدفع الأصلية",
    "status": "الحالة",
    "details": "عرض التفاصيل",
    "auto": "يتم تحديث التقدم تلقائيًا أثناء المعالجة"
  }
};
