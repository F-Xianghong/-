Page({
  data: {
    content: '',
    images: [],
    topics: ['求助', '经验分享', '陪读日记', '机构推荐', '转让互助'],
    topicIndex: -1
  },

  onContent(e) {
    this.setData({ content: e.detail.value });
  },

  pickTopic(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ topicIndex: this.data.topicIndex === index ? -1 : index });
  },

  chooseImage() {
    const remain = 9 - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多 9 张图', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      success: res => {
        const paths = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: this.data.images.concat(paths) });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.slice();
    images.splice(index, 1);
    this.setData({ images });
  },

  previewImage(e) {
    wx.previewImage({
      urls: this.data.images,
      current: e.currentTarget.dataset.url
    });
  },

  submit() {
    const { content, images, topicIndex, topics } = this.data;
    if (!content.trim() && images.length === 0) {
      wx.showToast({ title: '写点什么再发布吧', icon: 'none' });
      return;
    }
    const profile = wx.getStorageSync('profile') || {};
    const posts = wx.getStorageSync('posts') || [];
    posts.unshift({
      id: 'post_' + Date.now(),
      content: content.trim(),
      images: images,
      topic: topicIndex >= 0 ? topics[topicIndex] : '',
      authorName: profile.nickname || '星屿用户',
      authorEmoji: '🌊',
      identity: profile.identity || '家长',
      // 模拟发布位置，后续替换为 wx.getLocation 定位结果
      region: '上海 · 浦东新区',
      city: '上海',
      distanceM: 100,
      createdAt: Date.now()
    });
    wx.setStorageSync('posts', posts);
    this.setData({ content: '', images: [], topicIndex: -1 });
    wx.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/radar/radar' });
    }, 600);
  }
});
