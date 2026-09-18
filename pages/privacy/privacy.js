const DEFAULTS = {
  showNearby: true,
  allowStrangerMsg: true,
  allowReply: true,
  recommend: false
};

Page({
  data: {
    settings: Object.assign({}, DEFAULTS)
  },

  onLoad() {
    const saved = wx.getStorageSync('privacy') || {};
    this.setData({ settings: Object.assign({}, DEFAULTS, saved) });
  },

  onSwitch(e) {
    const key = e.currentTarget.dataset.key;
    const settings = Object.assign({}, this.data.settings);
    settings[key] = e.detail.value;
    this.setData({ settings });
    wx.setStorageSync('privacy', settings);
  },

  goBlacklist() {
    wx.showToast({ title: '黑名单管理建设中', icon: 'none' });
  }
});
