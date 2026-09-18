const app = getApp();
const { posts: mockPosts } = require('../../utils/data.js');

// 模拟当前所在城市，后续替换为定位结果
const USER_CITY = '上海';

Page({
  data: {
    keyword: '',
    distanceOptions: ['附近 1km', '5km 内', '同城', '全国'],
    distanceIndex: 0,
    topicOptions: ['全部', '求助', '经验分享', '陪读日记', '机构推荐', '转让互助'],
    topicIndex: 0,
    identityOptions: ['全部身份'],
    identityIndex: 0,
    onlyImage: false,
    filterExpanded: true,
    list: [],
    favorites: []
  },

  onLoad() {
    // 未完成注册的用户先走注册流程
    const profile = wx.getStorageSync('profile');
    if (!profile || !profile.registered) {
      wx.reLaunch({ url: '/pages/register/register' });
      return;
    }
    this.setData({
      identityOptions: ['全部身份'].concat(app.globalData.identities)
    });
  },

  onShow() {
    this.setData({ favorites: wx.getStorageSync('favorites') || [] });
    this.buildList();
  },

  onKeyword(e) {
    this.setData({ keyword: e.detail.value }, () => this.buildList());
  },

  clearKeyword() {
    this.setData({ keyword: '' }, () => this.buildList());
  },

  pickDistance(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ distanceIndex: index }, () => this.buildList());
  },

  pickTopic(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ topicIndex: index }, () => this.buildList());
  },

  pickIdentity(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ identityIndex: index }, () => this.buildList());
  },

  toggleOnlyImage() {
    this.setData({ onlyImage: !this.data.onlyImage }, () => this.buildList());
  },

  toggleFilter() {
    this.setData({ filterExpanded: !this.data.filterExpanded });
  },

  formatDistance(m) {
    if (m < 1000) return m + 'm';
    if (m < 10000) return (m / 1000).toFixed(1) + 'km';
    return Math.round(m / 1000) + 'km';
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

  matchDistance(item) {
    const idx = this.data.distanceIndex;
    if (idx === 0) return item.distanceM <= 1000;
    if (idx === 1) return item.distanceM <= 5000;
    if (idx === 2) return item.city === USER_CITY;
    return true;
  },

  buildList() {
    const { keyword, topicIndex, topicOptions, identityIndex, identityOptions, onlyImage, favorites } = this.data;
    const userPosts = (wx.getStorageSync('posts') || []).map(p => ({
      id: p.id,
      authorName: p.authorName || '我',
      authorEmoji: p.authorEmoji || '🌊',
      identity: p.identity || '家长',
      topic: p.topic || '',
      content: p.content || '',
      imageCount: (p.images || []).length,
      region: p.region || USER_CITY,
      city: p.city || USER_CITY,
      distanceM: p.distanceM == null ? 100 : p.distanceM,
      timeText: this.formatTime(p.createdAt),
      likes: p.likes || 0,
      comments: p.comments || 0,
      mine: true
    }));
    const kw = keyword.trim();
    const topic = topicOptions[topicIndex];
    const identity = identityOptions[identityIndex];
    const list = userPosts
      .concat(mockPosts)
      .filter(item => this.matchDistance(item))
      .filter(item => topicIndex === 0 || item.topic === topic)
      .filter(item => identityIndex === 0 || item.identity === identity)
      .filter(item => !onlyImage || item.imageCount > 0)
      .filter(item => !kw || item.content.indexOf(kw) !== -1 || item.authorName.indexOf(kw) !== -1 || item.topic.indexOf(kw) !== -1)
      .map(item => Object.assign({}, item, {
        distanceText: this.formatDistance(item.distanceM),
        isFav: favorites.indexOf(item.id) !== -1
      }));
    this.setData({ list });
  },

  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    const favorites = this.data.favorites.slice();
    const idx = favorites.indexOf(id);
    if (idx === -1) {
      favorites.push(id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    } else {
      favorites.splice(idx, 1);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    }
    wx.setStorageSync('favorites', favorites);
    this.setData({ favorites });
    this.buildList();
  },

  openPost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '帖子详情建设中', icon: 'none' });
  },

  // 点击头像查看 TA 的名片
  openAuthor(e) {
    const { name, emoji, identity } = e.currentTarget.dataset;
    if (!name || name === '我') {
      wx.navigateTo({ url: '/pages/user-card/user-card' });
      return;
    }
    wx.navigateTo({
      url: '/pages/user-card/user-card?visitor=1'
        + '&name=' + encodeURIComponent(name)
        + '&emoji=' + encodeURIComponent(emoji || '🌊')
        + '&identity=' + encodeURIComponent(identity || '家长')
    });
  }
});
