Page({
  data: {
    list: []
  },

  onShow() {
    this.load();
  },

  formatTime(ts) {
    if (!ts) return '刚刚';
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + '分钟前';
    const hour = Math.floor(min / 60);
    if (hour < 24) return hour + '小时前';
    return Math.floor(hour / 24) + '天前';
  },

  load() {
    const posts = (wx.getStorageSync('posts') || []).map(p => Object.assign({}, p, {
      timeText: this.formatTime(p.createdAt),
      imageCount: (p.images || []).length
    }));
    this.setData({ list: posts });
  },

  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({ urls: urls, current: current });
  },

  removePost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除帖子',
      content: '删除后不可恢复，确定删除这条帖子吗？',
      confirmText: '删除',
      confirmColor: '#e86a5e',
      success: res => {
        if (!res.confirm) return;
        const posts = (wx.getStorageSync('posts') || []).filter(p => p.id !== id);
        wx.setStorageSync('posts', posts);
        this.load();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  },

  goPublish() {
    wx.switchTab({ url: '/pages/publish/publish' });
  }
});
