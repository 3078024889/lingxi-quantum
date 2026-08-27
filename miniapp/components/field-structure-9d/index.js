Component({
  data: {
    open: false,
    fullscreen: false,
  },
  methods: {
    openPanel() {
      this.setData({ open: true }, () => {
        wx.createVideoContext('fieldStructureVideo', this).play()
      })
    },
    expandVideo() {
      const context = wx.createVideoContext('fieldStructureVideo', this)
      context.requestFullScreen({ direction: 90 })
    },
    closePanel() {
      wx.createVideoContext('fieldStructureVideo', this).pause()
      this.setData({ open: false, fullscreen: false })
    },
    onFullscreenChange(event) {
      this.setData({ fullscreen: Boolean(event.detail.fullScreen) })
    },
  },
})
