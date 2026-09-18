const app = getApp();

Page({
  data: {
    avatar: '',
    nickname: '',
    identity: '家长',
    identities: [],
    gender: '',
    genderOptions: ['男', '女', '保密'],
    genderIndex: -1,
    region: [],
    signature: '',
    addresses: [],
    showAddrForm: false,
    addrForm: { name: '', phone: '', region: [], detail: '' }
  },

  onLoad() {
    const profile = wx.getStorageSync('profile') || {};
    const genderIndex = this.data.genderOptions.indexOf(profile.gender || '');
    this.setData({
      identities: app.globalData.identities,
      avatar: profile.avatar || '',
      nickname: profile.nickname || '',
      identity: profile.identity || '家长',
      gender: profile.gender || '',
      genderIndex: genderIndex,
      region: profile.region || [],
      signature: profile.signature || '',
      addresses: profile.addresses || []
    });
  },

  onChooseAvatar(e) {
    this.setData({ avatar: e.detail.avatarUrl });
  },

  onNickname(e) {
    this.setData({ nickname: e.detail.value });
  },

  pickIdentity(e) {
    this.setData({ identity: e.currentTarget.dataset.value });
  },

  onGender(e) {
    const index = Number(e.detail.value);
    this.setData({ genderIndex: index, gender: this.data.genderOptions[index] });
  },

  onRegion(e) {
    this.setData({ region: e.detail.value });
  },

  onSignature(e) {
    this.setData({ signature: e.detail.value });
  },

  // 收货地址
  toggleAddrForm() {
    this.setData({
      showAddrForm: !this.data.showAddrForm,
      addrForm: { name: '', phone: '', region: [], detail: '' }
    });
  },

  onAddrInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['addrForm.' + field]: e.detail.value });
  },

  onAddrRegion(e) {
    this.setData({ 'addrForm.region': e.detail.value });
  },

  addAddress() {
    const f = this.data.addrForm;
    if (!f.name.trim() || !f.phone.trim() || f.region.length === 0 || !f.detail.trim()) {
      wx.showToast({ title: '请填完整地址信息', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(f.phone.trim())) {
      wx.showToast({ title: '手机号格式不对', icon: 'none' });
      return;
    }
    const addresses = this.data.addresses.concat([{
      name: f.name.trim(),
      phone: f.phone.trim(),
      region: f.region,
      detail: f.detail.trim()
    }]);
    this.setData({ addresses, showAddrForm: false });
  },

  removeAddress(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '删除地址',
      content: '确定删除这条收货地址吗？',
      confirmColor: '#e8862e',
      success: res => {
        if (res.confirm) {
          const addresses = this.data.addresses.slice();
          addresses.splice(index, 1);
          this.setData({ addresses });
        }
      }
    });
  },

  save() {
    if (!this.data.nickname.trim()) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    const profile = wx.getStorageSync('profile') || {};
    Object.assign(profile, {
      avatar: this.data.avatar,
      nickname: this.data.nickname.trim(),
      identity: this.data.identity,
      gender: this.data.gender,
      region: this.data.region,
      signature: this.data.signature.trim(),
      addresses: this.data.addresses
    });
    wx.setStorageSync('profile', profile);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
