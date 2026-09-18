const app = getApp();

Page({
  data: {
    loginMode: false,
    accountName: '',
    accountAvatar: '',
    bound: false,
    locating: false,
    located: false,
    album: false,
    identity: '家长',
    identities: []
  },

  onLoad() {
    // 已创建过账号但处于退出状态 → 进入登录模式
    const profile = wx.getStorageSync('profile');
    const used = wx.getStorageSync('wechatAccountUsed');
    const hasAccount = !!(used && profile && profile.nickname);
    this.setData({
      identities: app.globalData.identities,
      loginMode: hasAccount && !profile.registered,
      accountName: hasAccount ? profile.nickname : '',
      accountAvatar: hasAccount ? (profile.avatar || '') : ''
    });
  },

  // 老账号一键登录
  login() {
    const profile = wx.getStorageSync('profile') || {};
    profile.registered = true;
    wx.setStorageSync('profile', profile);
    wx.showToast({ title: '欢迎回来', icon: 'success' });
    setTimeout(() => wx.reLaunch({ url: '/pages/radar/radar' }), 600);
  },

  // 绑定个人微信账号（一个微信账号只能注册一次）
  bindWechat() {
    if (this.data.bound) return;
    wx.login({
      success: res => {
        // 真实环境：将 code 发往后端换取 openid，由后端校验 openid 是否已注册
        // 本地模拟：用本地记录校验唯一性
        const used = wx.getStorageSync('wechatAccountUsed');
        if (used) {
          wx.showModal({
            title: '该微信已注册过',
            content: '一个微信账号只能注册一次，请使用原账号继续。',
            showCancel: false
          });
          return;
        }
        wx.setStorageSync('wechatAccountUsed', { code: res.code, time: Date.now() });
        const profile = wx.getStorageSync('profile') || {};
        profile.wechatBound = true;
        wx.setStorageSync('profile', profile);
        this.setData({ bound: true });
        wx.showToast({ title: '微信绑定成功', icon: 'success' });
      },
      fail: () => wx.showToast({ title: '微信授权失败，请重试', icon: 'none' })
    });
  },

  // 开启位置权限
  openLocation() {
    if (this.data.located || this.data.locating) return;
    this.setData({ locating: true });
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        const profile = wx.getStorageSync('profile') || {};
        profile.location = { latitude: res.latitude, longitude: res.longitude };
        wx.setStorageSync('profile', profile);
        this.setData({ locating: false, located: true });
        wx.showToast({ title: '位置已开启', icon: 'success' });
      },
      fail: () => {
        this.setData({ locating: false });
        wx.showModal({
          title: '需要位置权限',
          content: '位置用于在雷达中推荐附近的帖子与陪伴资源，请在设置中开启。',
          confirmText: '去设置',
          cancelText: '暂不',
          success: r => {
            if (!r.confirm) return;
            wx.openSetting({
              success: s => {
                if (s.authSetting && s.authSetting['scope.userLocation']) {
                  this.openLocation();
                }
              }
            });
          }
        });
      }
    });
  },

  // 申请相册权限（用于上传证书、保存名片等）
  openAlbum() {
    if (this.data.album) return;
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => {
        const profile = wx.getStorageSync('profile') || {};
        profile.albumAuth = true;
        wx.setStorageSync('profile', profile);
        this.setData({ album: true });
        wx.showToast({ title: '相册权限已开启', icon: 'success' });
      },
      fail: () => {
        wx.showModal({
          title: '需要相册权限',
          content: '相册用于上传证书材料、保存名片图片，请在设置中开启。',
          confirmText: '去设置',
          cancelText: '暂不',
          success: r => {
            if (!r.confirm) return;
            wx.openSetting({
              success: s => {
                if (s.authSetting && s.authSetting['scope.writePhotosAlbum']) {
                  const profile = wx.getStorageSync('profile') || {};
                  profile.albumAuth = true;
                  wx.setStorageSync('profile', profile);
                  this.setData({ album: true });
                }
              }
            });
          }
        });
      }
    });
  },

  switchIdentity(e) {
    this.setData({ identity: e.currentTarget.dataset.value });
  },

  finish() {
    if (!this.data.bound) {
      wx.showToast({ title: '请先绑定微信账号', icon: 'none' });
      return;
    }
    if (!this.data.located) {
      wx.showToast({ title: '请开启位置权限', icon: 'none' });
      return;
    }
    if (!this.data.album) {
      wx.showToast({ title: '请开启相册权限', icon: 'none' });
      return;
    }
    const profile = wx.getStorageSync('profile') || {};
    Object.assign(profile, {
      registered: true,
      identity: this.data.identity,
      wechatBound: true
    });
    wx.setStorageSync('profile', profile);

    if (this.data.identity === '老师') {
      wx.showModal({
        title: '注册成功',
        content: '老师身份需通过 ABA 专业理论考试（≥90 分）并提交资质材料审核后，才能成为认证专业老师。',
        confirmText: '去认证',
        cancelText: '稍后再说',
        success: r => {
          if (r.confirm) {
            wx.reLaunch({ url: '/pages/teacher-cert/teacher-cert' });
          } else {
            wx.reLaunch({ url: '/pages/radar/radar' });
          }
        }
      });
      return;
    }
    wx.reLaunch({ url: '/pages/radar/radar' });
  }
});
