const { providers } = require('../../utils/data.js');

Page({
  data: {
    list: []
  },

  onShow() {
    const favorites = wx.getStorageSync('favorites') || [];
    const list = providers
      .filter(p => favorites.indexOf(p.id) !== -1)
      .map(p => Object.assign({}, p, { priceText: '¥' + p.price + '/月' }));
    this.setData({ list });
  },

  removeFav(e) {
    const id = e.currentTarget.dataset.id;
    let favorites = wx.getStorageSync('favorites') || [];
    favorites = favorites.filter(item => item !== id);
    wx.setStorageSync('favorites', favorites);
    this.setData({ list: this.data.list.filter(item => item.id !== id) });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  },

  goRadar() {
    wx.switchTab({ url: '/pages/radar/radar' });
  }
});
