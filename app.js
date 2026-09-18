App({
  onLaunch() {
    // 初始化微信云开发（把 env 换成你的云环境 ID；未开通时自动降级，不影响其他功能）
    if (wx.cloud) {
      try {
        wx.cloud.init({ env: 'cloud1-d0gid7ioe9ba0e950', traceUser: true });
        this.globalData.cloudReady = true;
      } catch (e) {
        this.globalData.cloudReady = false;
      }
    }

    // 初始化本地用户资料
    const profile = wx.getStorageSync('profile');
    if (!profile) {
      wx.setStorageSync('profile', {
        nickname: '星屿用户',
        avatar: '',
        gender: '',
        region: [],
        signature: '',
        addresses: [],
        identity: '家长',
        shells: 128,
        registered: false,
        wechatBound: false,
        location: null
      });
    }
  },
  globalData: {
    identities: ['家长', '老师', '大龄特需人群', '爱心企业'],
    cloudReady: false
  }
});
