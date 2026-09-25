const { initPage } = require('../../utils/i18n')
const { enableShareMenu, copyWebLink, appMessage, timeline } = require('../../utils/share')

const TOOLS = [
  { title: 'PDF 编辑', note: '编辑、签名、盖章与常用 PDF 处理。', path: '/tools/pdf-editor' },
  { title: 'PDF 合并 / 拆分', note: '把多个 PDF 合并，或按页拆成新的文件。', path: '/tools/pdf-merge-split' },
  { title: '图片去水印', note: '处理图片里的不需要区域，并导出新图片。', path: '/tools/image-watermark-remover' },
  { title: 'OCR 文字识别', note: '从图片或文件里提取可复制文字。', path: '/tools/ocr' },
  { title: '视频转文字', note: '把视频中的语音整理成可继续编辑的文字。', path: '/tools/video-transcription' },
  { title: '字幕翻译', note: '上传字幕，翻译并继续导出使用。', path: '/tools/subtitle-translate' },
  { title: '临时邮箱', note: '创建短期邮箱，用于接收临时邮件。', path: '/tools/temp-mail' },
  { title: '阅后即焚', note: '生成限时内容链接，到期或阅读后按规则失效。', path: '/tools/burn-after-read' },
]

const SHARE_TITLE = '灵犀场 · 免费实用工具'

Page({
  data: { lang: 'zh', tools: TOOLS },

  onLoad() {
    initPage(this)
    enableShareMenu()
  },

  onShow() {
    initPage(this)
    enableShareMenu()
  },

  open(event) {
    const item = this.data.tools[event.currentTarget.dataset.index]
    if (!item) return
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },

  allTools() {
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent('/tools')}` })
  },

  copyLink() {
    copyWebLink('/tools')
  },

  onShareAppMessage() {
    return appMessage(SHARE_TITLE, '/pages/tools/index')
  },

  onShareTimeline() {
    return timeline(SHARE_TITLE)
  },
})
