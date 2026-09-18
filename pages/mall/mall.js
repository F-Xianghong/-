// 商城商品，后续可替换为云数据库 goods 集合
const GOODS = [
  { id: 'g1', name: '触觉刷套装', emoji: '🪥', desc: '触觉防御脱敏训练，含 3 种软硬度', price: 88, tag: '教具' },
  { id: 'g2', name: '视觉提示卡', emoji: '🃏', desc: '日程/规则/情绪表达，120 张防水卡', price: 36, tag: '教具' },
  { id: 'g3', name: '代币奖励板', emoji: '🎯', desc: '磁吸式代币板 + 30 枚星星代币', price: 58, tag: '教具' },
  { id: 'g4', name: '口肌训练器', emoji: '🎈', desc: '吹气训练套装，改善发音清晰度', price: 45, tag: '教具' },
  { id: 'g5', name: '儿童平衡木', emoji: '🪵', desc: '前庭觉与本体觉训练，可折叠收纳', price: 268, tag: '教具' },
  { id: 'g6', name: '感统秋千', emoji: '🛝', desc: '室内吊篮秋千，附安装配件', price: 399, tag: '教具' },
  { id: 'g7', name: '陪读优惠券', emoji: '🎟️', desc: '抵 100 元陪读服务费，全城可用', price: 120, tag: '服务' },
  { id: 'g8', name: '公益课程券', emoji: '📚', desc: '任选一门机构体验课', price: 60, tag: '服务' }
];

Page({
  data: {
    shells: 0,
    goods: GOODS,
    orders: []
  },

  onShow() {
    const profile = wx.getStorageSync('profile') || {};
    this.setData({
      shells: profile.shells || 0,
      orders: wx.getStorageSync('orders') || []
    });
  },

  buy(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.goods.find(g => g.id === id);
    if (!item) return;
    if (this.data.shells < item.price) {
      wx.showModal({
        title: '贝壳不足',
        content: '还差 ' + (item.price - this.data.shells) + ' 贝壳，先去充值吗？',
        confirmText: '去充值',
        success: res => {
          if (res.confirm) wx.navigateTo({ url: '/pages/recharge/recharge' });
        }
      });
      return;
    }
    wx.showModal({
      title: '确认兑换',
      content: '用 ' + item.price + ' 贝壳兑换「' + item.name + '」？',
      confirmColor: '#166b8c',
      success: res => {
        if (!res.confirm) return;
        const profile = wx.getStorageSync('profile') || {};
        profile.shells = (profile.shells || 0) - item.price;
        wx.setStorageSync('profile', profile);
        const orders = [{
          id: 'o' + Date.now(),
          name: item.name,
          emoji: item.emoji,
          price: item.price,
          time: new Date().toLocaleString()
        }].concat(this.data.orders);
        wx.setStorageSync('orders', orders);
        this.setData({ shells: profile.shells, orders });
        wx.showToast({ title: '兑换成功', icon: 'success' });
      }
    });
  },

  goRecharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' });
  }
});
