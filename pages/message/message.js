const ISLAND_DAILY_LIMIT = 10;

function todayKey() {
  const d = new Date();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return d.getFullYear() + '-' + m + '-' + day;
}

Page({
  data: {
    tab: 'chat',
    islandLeft: ISLAND_DAILY_LIMIT,
    islandSleeping: false,
    conversations: [
      {
        id: 'c1',
        emoji: '👩‍🏫',
        name: '林老师',
        last: '您好，下周三上午的时间可以约',
        time: '10:24',
        unread: 2
      },
      {
        id: 'c2',
        emoji: '🏫',
        name: '星桥特教中心',
        last: '试课名额已为您保留，请查收确认单',
        time: '昨天',
        unread: 0
      },
      {
        id: 'c3',
        emoji: '🐢',
        name: '海龟爸爸工作室',
        last: '评估报告这周五发您',
        time: '周一',
        unread: 1
      },
      {
        id: 'sys',
        emoji: '📢',
        name: '星屿小助手',
        last: '欢迎来到星屿海海，完善资料可获得 20 贝壳',
        time: '周一',
        unread: 0
      }
    ],
    replies: [
      {
        id: 'r1',
        emoji: '👨‍👩‍👧',
        name: '星海妈妈',
        action: '回复了你的帖子',
        postSnippet: '求推荐浦东靠谱的感统训练机构…',
        reply: '我们家在星桥上过半年，老师很专业，可以先约节体验课',
        time: '09:12',
        unread: 1
      },
      {
        id: 'r2',
        emoji: '👨‍🏫',
        name: '陈老师',
        action: '回复了你的帖子',
        postSnippet: '求推荐浦东靠谱的感统训练机构…',
        reply: '前庭觉偏弱可以先在家做荡秋千、滑板车这类游戏干预',
        time: '昨天',
        unread: 1
      },
      {
        id: 'r3',
        emoji: '🐚',
        name: '贝壳爸爸',
        action: '赞了你的帖子',
        postSnippet: '今天小宝第一次在小组课上主动举手…',
        reply: '',
        time: '昨天',
        unread: 0
      }
    ]
  },

  onShow() {
    const quota = wx.getStorageSync('islandQuota');
    const used = quota && quota.date === todayKey() ? quota.count : 0;
    const left = Math.max(0, ISLAND_DAILY_LIMIT - used);
    this.setData({ islandLeft: left, islandSleeping: left <= 0 });
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  goIsland() {
    wx.navigateTo({ url: '/pages/island-master/island-master' });
  },

  openChat(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: '与「' + name + '」的聊天建设中', icon: 'none' });
  },

  openReply(e) {
    wx.showToast({ title: '帖子详情建设中', icon: 'none' });
  }
});
