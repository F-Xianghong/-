const app = getApp();

Page({
  data: {
    nickname: '星屿用户',
    avatar: '',
    signature: '',
    identity: '家长',
    shells: 0,
    favCount: 0,
    postCount: 0,
    libCount: 0,
    stats: [],
    teacherCert: null,
    isProTeacher: false,
    certStatusText: '未认证'
  },

  onShow() {
    const profile = wx.getStorageSync('profile') || {};
    const favorites = wx.getStorageSync('favorites') || [];
    const posts = wx.getStorageSync('posts') || [];
    const library = wx.getStorageSync('library') || [];
    const likes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const teacherCert = wx.getStorageSync('teacherCert') || null;
    const statusMap = { pending: '审核中', approved: '已认证', rejected: '审核未通过' };
    this.setData({
      teacherCert,
      isProTeacher: (profile.identity || '家长') === '老师' && !!teacherCert && teacherCert.status === 'approved',
      certStatusText: teacherCert ? (statusMap[teacherCert.status] || '未认证') : '未认证',
      nickname: profile.nickname || '星屿用户',
      avatar: profile.avatar || '',
      signature: profile.signature || '',
      identity: profile.identity || '家长',
      shells: profile.shells || 0,
      favCount: favorites.length,
      postCount: posts.length,
      libCount: library.length,
      stats: [
        { label: '帖子', value: posts.length },
        { label: '收藏', value: favorites.length },
        { label: '获赞', value: likes },
        { label: '访客', value: 0 }
      ]
    });
  },

  goCard() {
    wx.navigateTo({ url: '/pages/user-card/user-card' });
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },

  goFavorites() {
    wx.navigateTo({ url: '/pages/favorites/favorites' });
  },

  goMyPosts() {
    wx.navigateTo({ url: '/pages/my-posts/my-posts' });
  },

  goLibrary() {
    wx.navigateTo({ url: '/pages/my-library/my-library' });
  },

  goStudy() {
    wx.navigateTo({ url: '/pages/study/study' });
  },

  goTeacherCert() {
    wx.navigateTo({ url: '/pages/teacher-cert/teacher-cert' });
  },

  previewTeacherCert(e) {
    const index = e.currentTarget.dataset.index;
    const certs = (this.data.teacherCert && this.data.teacherCert.certs) || [];
    if (!certs.length) return;
    wx.previewImage({ current: certs[index], urls: certs });
  },

  goMall() {
    wx.navigateTo({ url: '/pages/mall/mall' });
  },

  goRecharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' });
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  // 退出登录：保留数据，回到登录页
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新验证微信才能登录，数据会保留在本机。',
      confirmText: '退出',
      confirmColor: '#e8862e',
      success: res => {
        if (!res.confirm) return;
        const profile = wx.getStorageSync('profile') || {};
        profile.registered = false;
        wx.setStorageSync('profile', profile);
        wx.reLaunch({ url: '/pages/register/register' });
      }
    });
  },

  // 注销账号：双重确认后清空全部数据
  deleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销将删除你的资料、帖子、资料库、贝壳、认证信息，且不可恢复。确定继续吗？',
      confirmText: '继续注销',
      confirmColor: '#c96a6a',
      success: res => {
        if (!res.confirm) return;
        wx.showModal({
          title: '最后确认',
          content: '账号注销后无法找回，微信绑定也将解除。确认注销？',
          confirmText: '确认注销',
          confirmColor: '#c96a6a',
          success: r => {
            if (!r.confirm) return;
            const keys = [
              'profile', 'favorites', 'posts', 'library', 'libraryGroups',
              'teacherCert', 'studyFavs', 'studyTotal', 'studyMonthly',
              'islandChat', 'islandQuota', 'orders', 'questionBank',
              'certSubmissions', 'wechatAccountUsed'
            ];
            keys.forEach(k => wx.removeStorageSync(k));
            wx.reLaunch({ url: '/pages/register/register' });
          }
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '星屿海海 - 寻找身边的陪伴与支持',
      path: '/pages/radar/radar'
    };
  }
});
