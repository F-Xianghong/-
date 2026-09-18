const DAILY_LIMIT = 10;

function todayKey() {
  const d = new Date();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return d.getFullYear() + '-' + m + '-' + day;
}

// ================= AI 应答 =================
// 当前为本地模拟应答。接入真实大模型时，把 callAI 替换为：
// wx.cloud.callFunction / wx.request 调用你的大模型服务（如腾讯云 Hunyuan、文心等），
// 保持返回 Promise<string> 即可，页面逻辑无需改动。
const RULES = [
  {
    keys: ['诊断', '自闭症', '孤独症', '吃药', '药物'],
    answer: '这类问题涉及医学诊断和用药，岛主不敢乱说哦 🐬 建议尽快带孩子去正规医院发育行为科或儿童精神科面诊。平台上的评估报告可以分享给医生作参考。'
  },
  {
    keys: ['感统', '前庭', '本体', '触觉'],
    answer: '感统训练在家就能做 🐬 前庭觉可以玩荡秋千、滑板车、转椅（注意保护）；本体觉推荐推重物、跳床、攀爬；触觉敏感的孩子可以先从玩沙、玩水、触觉刷开始，每次 10-15 分钟，孩子抗拒就停下来，循序渐进。'
  },
  {
    keys: ['说话', '语言', '言语', '发音', '开口'],
    answer: '语言启蒙的核心是「先理解、后表达」🐬 多和孩子平行描述他正在做的事，创造他必须开口的场景（比如把喜欢的零食放在看得见拿不到的地方），从仿说单词开始，千万别逼孩子说。口肌弱的话可以加吹泡泡、吸粗吸管的游戏。'
  },
  {
    keys: ['情绪', '哭', '发脾气', '崩溃', '打人'],
    answer: '情绪爆发时，记住三步 🐬 1. 保证安全，少说话，别讲道理；2. 平静后找出触发点（是任务太难？环境太吵？还是想要某个东西？）；3. 事后用视觉提示卡教他替代表达，比如递卡片说「我要休息」。坚持记录 ABC（前因-行为-结果），规律会慢慢浮现。'
  },
  {
    keys: ['上学', '幼儿园', '入学', '融合', '陪读'],
    answer: '入学准备可以从这几点入手 🐬 提前带孩子熟悉校园环境；和老师沟通好孩子的触发点和安抚方式；在家练习安坐、举手、排队等课堂常规；必要时可以申请影子老师陪读过渡。雷达里有不少有经验的陪读老师，可以筛选「只看老师」找一找。'
  },
  {
    keys: ['睡觉', '睡眠', '入睡', '夜醒'],
    answer: '睡眠问题可以试试固定睡前流程 🐬 睡前 1 小时调暗灯光、避免屏幕，用同一段抚触或同一个故事收尾，流程可以用图片提示卡贴出来。白天保证足够运动量，晚上更容易入睡。'
  },
  {
    keys: ['吃饭', '挑食', '喂饭'],
    answer: '挑食别硬塞 🐬 新食物遵循「看一看→摸一摸→闻一闻→舔一舔→尝一口」的阶梯，每步都可能要重复十几次。正餐时间控制在 30 分钟内，两餐之间少零食，饥饿感是最好的调味剂。'
  },
  {
    keys: ['aba', '干预', '训练', '强化', '代币'],
    answer: 'ABA 的核心是强化好行为 🐬 孩子出现你期望的行为时，立刻、具体地奖励（表扬要说出具体行为，比如「你自己把积木收好了，真棒」）。代币制适合大一点的孩子：集满 N 个代币换一个大奖励。记得奖励要个体化，孩子喜欢才是强化物。'
  },
  {
    keys: ['评估', '报告', '资料'],
    answer: '评估报告可以在「我的-我的资料库」里管理 🐬 支持从微信聊天记录直接导入文件，还能分组整理。开启「平台内公开」后，老师就能看到孩子的资料，沟通干预方案更方便。'
  }
];

function localAnswer(q) {
  const text = q.toLowerCase();
  for (let i = 0; i < RULES.length; i++) {
    if (RULES[i].keys.some(k => text.indexOf(k.toLowerCase()) !== -1)) {
      return RULES[i].answer;
    }
  }
  return '这个问题岛主还在学习中 🐬 你可以再具体说说孩子的情况，比如年龄、具体表现、持续多久了？描述越详细，岛主越能帮到你。也可以去雷达发帖，平台上有不少经验丰富的老师和家长。';
}

function callAI(question) {
  return new Promise(resolve => {
    setTimeout(() => resolve(localAnswer(question)), 900 + Math.random() * 800);
  });
}
// ================= AI 应答 END =================

Page({
  data: {
    messages: [],
    input: '',
    sending: false,
    left: DAILY_LIMIT,
    sleeping: false,
    scrollTo: ''
  },

  onLoad() {
    this.loadQuota();
    const history = wx.getStorageSync('islandChat') || [];
    if (history.length) {
      this.setData({ messages: history }, () => this.scrollBottom());
    } else {
      this.pushMessage({
        id: 'w0',
        role: 'ai',
        text: '你好呀，我是岛主 🐬 星屿海海最懂特教的 AI 小海豚～孩子的感统、语言、情绪、入学问题都可以问我。每天可以聊 ' + DAILY_LIMIT + ' 个问题，问完我就要回海里睡觉啦。'
      }, false);
    }
  },

  loadQuota() {
    let quota = wx.getStorageSync('islandQuota');
    if (!quota || quota.date !== todayKey()) {
      quota = { date: todayKey(), count: 0 };
      wx.setStorageSync('islandQuota', quota);
    }
    const left = Math.max(0, DAILY_LIMIT - quota.count);
    this.setData({ left, sleeping: left <= 0 });
  },

  consumeQuota() {
    const quota = wx.getStorageSync('islandQuota') || { date: todayKey(), count: 0 };
    quota.count += 1;
    wx.setStorageSync('islandQuota', quota);
    const left = Math.max(0, DAILY_LIMIT - quota.count);
    this.setData({ left });
    return left;
  },

  pushMessage(msg, persist = true) {
    const messages = this.data.messages.concat([msg]);
    this.setData({ messages }, () => this.scrollBottom());
    if (persist) {
      wx.setStorageSync('islandChat', messages.slice(-50));
    }
  },

  scrollBottom() {
    this.setData({ scrollTo: '' }, () => {
      this.setData({ scrollTo: 'msg-' + (this.data.messages.length - 1) });
    });
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  send() {
    const text = this.data.input.trim();
    if (!text || this.data.sending) return;
    if (this.data.sleeping) {
      wx.showToast({ title: '岛主睡着了，明天再来吧', icon: 'none' });
      return;
    }
    const question = text;
    this.setData({ input: '', sending: true });
    this.pushMessage({ id: 'u' + Date.now(), role: 'user', text: question });
    this.consumeQuota();
    // 输入中占位
    this.pushMessage({ id: 'typing', role: 'ai', typing: true, text: '' }, false);

    callAI(question).then(answer => {
      const messages = this.data.messages.filter(m => m.id !== 'typing');
      this.setData({ messages });
      this.pushMessage({ id: 'a' + Date.now(), role: 'ai', text: answer });
      const left = this.data.left;
      if (left <= 0) {
        this.pushMessage({
          id: 'bye' + Date.now(),
          role: 'ai',
          text: '今天的 ' + DAILY_LIMIT + ' 个问题聊完啦，岛主要回海里睡觉了 😴 明天早上再来找我吧，晚安～'
        });
        this.setData({ sleeping: true });
      }
      this.setData({ sending: false });
    });
  }
});
