Page({
  data: {
    balance: 0,
    packages: [
      { shells: 60, price: 6 },
      { shells: 300, price: 30, tag: '热门' },
      { shells: 680, price: 68 },
      { shells: 1280, price: 128, tag: '超值' },
      { shells: 3280, price: 328 }
    ],
    selected: 1,
    paying: false
  },

  onShow() {
    const profile = wx.getStorageSync('profile') || {};
    this.setData({ balance: profile.shells || 0 });
  },

  select(e) {
    this.setData({ selected: e.currentTarget.dataset.index });
  },

  // 模拟支付，正式环境需接入微信支付 + 服务端订单
  pay() {
    if (this.data.paying) return;
    const pkg = this.data.packages[this.data.selected];
    this.setData({ paying: true });
    wx.showLoading({ title: '支付中…', mask: true });
    setTimeout(() => {
      wx.hideLoading();
      const profile = wx.getStorageSync('profile') || {};
      profile.shells = (profile.shells || 0) + pkg.shells;
      wx.setStorageSync('profile', profile);
      this.setData({ balance: profile.shells, paying: false });
      wx.showToast({ title: '充值成功', icon: 'success' });
    }, 800);
  }
});
