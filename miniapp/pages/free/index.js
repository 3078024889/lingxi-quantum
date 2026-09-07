const { initPage } = require('../../utils/i18n')

Page({
  data: {
    lang: 'zh',
    items: [
      { title: '梦境探索', titleEn: 'Dream Exploration', note: '记录梦境，在象征与现实经验之间寻找可验证的线索。', noteEn: 'Record dreams and find testable links between symbols and lived experience.', path: '/dream' },
      { title: '量子息法', titleEn: 'Quantum Breath', note: '以呼吸把注意力带回身体与当下。', noteEn: 'Bring attention back to body and present through breath.', path: '/practice/breath' },
      { title: '直觉丹道', titleEn: 'The Intuitive Way', note: '练习区分内在感知与外界噪音。', noteEn: 'Practise distinguishing inner perception from outside noise.', path: '/practice/intuition' },
      { title: '归零心诀', titleEn: 'Heart Reset', note: '在日常压力中恢复内在中心。', noteEn: 'Recover your inner centre amid daily pressure.', path: '/practice/heart-reset' },
      { title: '上升心经', titleEn: 'Ascending Heart', note: '把觉察逐步带入关系、创造与行动。', noteEn: 'Carry awareness into relationships, creation and action.', path: '/practice/ascending-heart' },
    ],
  },
  onLoad() { initPage(this) },
  onShow() { initPage(this) },
  open(event) {
    const item = this.data.items[event.currentTarget.dataset.index]
    wx.navigateTo({ url: `/pages/web/index?path=${encodeURIComponent(item.path)}` })
  },
})
