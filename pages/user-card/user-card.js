const { computeBadges } = require('../../utils/badges.js');
const { authorProfiles } = require('../../utils/data.js');

Page({
  data: {
    visitor: false,
    nickname: '星屿用户',
    avatar: '',
    avatarEmoji: '🌊',
    gender: '',
    regionText: '',
    signature: '',
    identity: '家长',
    isTeacher: false,
    certified: false,
    badges: [],
    earnedCount: 0,
    // 名片背景：blue（默认）/ beach（沙滩黄）/ custom（相册上传）
    bgType: 'blue',
    bgImage: '',
    stats: [
      { label: '好友', value: 0 },
      { label: '关注', value: 0 },
      { label: '粉丝', value: 0 },
      { label: '访客', value: 0 }
    ]
  },

  onLoad(options) {
    // 访客模式：从雷达等页面点头像进入
    if (options && options.visitor) {
      const name = decodeURIComponent(options.name || '星屿用户');
      const identity = decodeURIComponent(options.identity || '家长');
      const extra = authorProfiles[name] || {};
      const badges = extra.badges || [];
      this.setData({
        visitor: true,
        nickname: name,
        avatarEmoji: decodeURIComponent(options.emoji || '🌊'),
        identity: identity,
        signature: extra.signature || '',
        isTeacher: identity === '老师',
        certified: !!extra.certified,
        badges: badges,
        earnedCount: badges.filter(b => b.earned).length
      });
    }
  },

  onShow() {
    if (this.data.visitor) return;
    const profile = wx.getStorageSync('profile') || {};
    const teacherCert = wx.getStorageSync('teacherCert') || null;
    const identity = profile.identity || '家长';
    const certified = !!teacherCert && teacherCert.status === 'approved';
    const badges = computeBadges(profile, teacherCert);
    const cardBg = profile.cardBg || { type: 'blue', value: '' };
    this.setData({
      nickname: profile.nickname || '星屿用户',
      avatar: profile.avatar || '',
      avatarEmoji: '🌊',
      gender: profile.gender || '',
      regionText: (profile.region && profile.region.length) ? profile.region.join(' ') : '',
      signature: profile.signature || '',
      identity: identity,
      isTeacher: identity === '老师',
      certified: certified,
      badges: badges,
      earnedCount: badges.filter(b => b.earned).length,
      bgType: cardBg.type || 'blue',
      bgImage: cardBg.value || ''
    });
  },

  // 自定义名片背景（仅本人）
  changeBg() {
    if (this.data.visitor) return;
    wx.showActionSheet({
      itemList: ['默认蓝色', '沙滩黄色', '从相册上传'],
      success: res => {
        if (res.tapIndex === 0) this.applyBg('blue', '');
        else if (res.tapIndex === 1) this.applyBg('beach', '');
        else this.chooseBgImage();
      }
    });
  },

  chooseBgImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: res => {
        const temp = res.tempFiles[0].tempFilePath;
        const fs = wx.getFileSystemManager();
        fs.saveFile({
          tempFilePath: temp,
          success: r => this.applyBg('custom', r.savedFilePath),
          fail: () => this.applyBg('custom', temp)
        });
      }
    });
  },

  applyBg(type, value) {
    const profile = wx.getStorageSync('profile') || {};
    profile.cardBg = { type, value };
    wx.setStorageSync('profile', profile);
    this.setData({ bgType: type, bgImage: value });
    wx.showToast({ title: '背景已更新', icon: 'none' });
  },

  goEdit() {
    if (this.data.visitor) return;
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },

  goFavorites() {
    wx.navigateTo({ url: '/pages/favorites/favorites' });
  },

  goMessage() {
    wx.switchTab({ url: '/pages/message/message' });
  },

  onShareAppMessage() {
    return {
      title: this.data.nickname + ' 的星屿海海名片',
      path: '/pages/radar/radar'
    };
  }
});
