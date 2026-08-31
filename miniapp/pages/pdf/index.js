Page({
  data: { status: '正在接入微信文件…', error: '' },
  onLoad(options) {
    const url = decodeURIComponent(options.url || '')
    const name = decodeURIComponent(options.name || '灵犀场报告.pdf')
    if (!/^https:\/\/lingxifield\.(cn|com)\/api\/wechat\/mini\/pdf-download\?ticket=/i.test(url)) {
      this.setData({ error: 'PDF 下载地址无效', status: '' })
      return
    }
    wx.downloadFile({
      url,
      success: (result) => {
        if (result.statusCode !== 200) return this.setData({ error: 'PDF 下载未完成，请稍后重试', status: '' })
        wx.saveFile({
          tempFilePath: result.tempFilePath,
          success: (saved) => {
            this.setData({ status: 'PDF 已保存到微信本地文件，并已打开预览。可从右上角菜单转发或收藏。' })
            wx.openDocument({ filePath: saved.savedFilePath, fileType: 'pdf', showMenu: true, fail: () => this.setData({ error: `${name} 已保存，但微信未能打开文件`, status: '' }) })
          },
          fail: () => {
            this.setData({ status: '微信本地文件空间不足，已改用临时预览；请从右上角菜单另存或转发。' })
            wx.openDocument({ filePath: result.tempFilePath, fileType: 'pdf', showMenu: true, fail: () => this.setData({ error: `${name} 已下载，但微信未能打开文件`, status: '' }) })
          },
        })
      },
      fail: () => this.setData({ error: '微信未能下载 PDF，请检查网络后重试', status: '' }),
    })
  },
})
