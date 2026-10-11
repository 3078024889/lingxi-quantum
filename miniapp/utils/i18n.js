const KEY='lx_language'
const SUPPORTED = [
  { id: 'zh-CN', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'es', label: 'Español' },
  { id: 'pt', label: 'Português' },
  { id: 'ar', label: 'العربية' },
]


function getLanguage(){const lang=wx.getStorageSync(KEY);return SUPPORTED.some(item=>item.id===lang)?lang:'zh-CN'}
module.exports={getLanguage}
