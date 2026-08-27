Component({
  data: {
    open: false,
    fullscreen: false,
    videoFailed: false,
    left: 300,
    top: 540,
  },
  lifetimes: {
    attached() {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      this.windowWidth = info.windowWidth
      this.windowHeight = info.windowHeight
      this.setData({ left: Math.max(12, info.windowWidth - 72), top: Math.max(90, info.windowHeight - 150) })
    },
  },
  methods: {
    startDrag(event) {
      const touch = event.touches[0]
      this.dragStart = { x: touch.clientX, y: touch.clientY, left: this.data.left, top: this.data.top, moved: false }
    },
    moveDrag(event) {
      if (!this.dragStart) return
      const touch = event.touches[0]
      const dx = touch.clientX - this.dragStart.x
      const dy = touch.clientY - this.dragStart.y
      if (Math.abs(dx) + Math.abs(dy) > 6) this.dragStart.moved = true
      this.setData({ left: Math.max(8, Math.min(this.windowWidth - 66, this.dragStart.left + dx)), top: Math.max(70, Math.min(this.windowHeight - 78, this.dragStart.top + dy)) })
    },
    endDrag() { this.wasDragged = Boolean(this.dragStart && this.dragStart.moved); this.dragStart = null },
    openPanel() {
      if (this.wasDragged) { this.wasDragged = false; return }
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
    onVideoError() { this.setData({ videoFailed: true }) },
  },
})
