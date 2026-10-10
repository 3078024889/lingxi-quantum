// Pricing units reflect the existing price book, including caps and tier increments.
// Creation is not publication; runtime payment still requires the explicit approved map.
export const MINI_TOOL_GOODS = [
  { toolId: "audio-cleanup", skuId: "lx_audio_clean", name: "音频降噪", unitPriceFen: 50 },
  { toolId: "audio-transcription", skuId: "lx_audio_text", name: "音频转文字", unitPriceFen: 50 },
  { toolId: "batch-image-watermark-remover", skuId: "lx_batch_img", name: "批量图片去水印", unitPriceFen: 10 },
  { toolId: "batch-pdf", skuId: "lx_batch_pdf", name: "PDF批量处理", unitPriceFen: 300 },
  { toolId: "burn-after-read-file", skuId: "lx_burn_file", name: "文件阅后即焚", unitPriceFen: 10 },
  { toolId: "cross-page-stamp", skuId: "lx_pdf_stamp", name: "PDF骑缝章", unitPriceFen: 200 },
  { toolId: "e-sign-pdf", skuId: "lx_pdf_sign", name: "PDF电子签名", unitPriceFen: 200 },
  { toolId: "food-calorie", skuId: "tool_food_calorie", name: "食物热量分析", unitPriceFen: 200 },
  { toolId: "handwriting-ocr", skuId: "lx_handwriting", name: "手写文字识别", unitPriceFen: 100 },
  { toolId: "id-photo-ai", skuId: "lx_id_photo", name: "智能证件照", unitPriceFen: 290 },
  { toolId: "image-watermark-remover", skuId: "lx_image_clean", name: "图片去水印", unitPriceFen: 190 },
  { toolId: "pdf-editor", skuId: "lx_pdf_edit", name: "PDF编辑", unitPriceFen: 200 },
  { toolId: "pdf-ocr", skuId: "lx_pdf_ocr", name: "PDF文字识别", unitPriceFen: 100 },
  { toolId: "pdf-redact", skuId: "lx_pdf_redact", name: "PDF隐私遮盖", unitPriceFen: 200 },
  { toolId: "pdf-to-word", skuId: "lx_pdf_word", name: "PDF转Word", unitPriceFen: 10 },
  { toolId: "subtitle-translate", skuId: "lx_subtitle", name: "字幕翻译", unitPriceFen: 100 },
  { toolId: "temp-mail-batch", skuId: "lx_temp_mail", name: "临时邮箱批量服务", unitPriceFen: 5 },
  { toolId: "video-transcription", skuId: "lx_video_text", name: "视频转文字", unitPriceFen: 50 },
  { toolId: "video-translate", skuId: "lx_video_trans", name: "视频翻译", unitPriceFen: 150 },
  { toolId: "video-watermark-remover", skuId: "lx_video_clean", name: "视频去水印", unitPriceFen: 20 },
] as const;

export const MINI_TOPUP_GOODS = [10, 88, 666, 888].map(amount => ({
  skuId: `lx_balance_${amount}`, name: `余额充值${amount}元`, unitPriceFen: amount * 100,
})).concat([{ skuId: "lx_balance_custom", name: "自定义余额充值", unitPriceFen: 100 }, { skuId: "lx_balance_cent", name: "自定义金额余额充值", unitPriceFen: 1 }]);
