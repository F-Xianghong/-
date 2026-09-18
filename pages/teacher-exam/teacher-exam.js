const app = getApp();

// 题库来源优先级：云数据库 question_bank 集合 > QUESTION_BANK_URL 接口 > 缓存 > 内置题库
// 自有接口返回 JSON：{ "singles": [...], "multis": [...], "terms": [...] }
// 注意：自有接口域名需加入小程序后台 request 合法域名。
const QUESTION_BANK_URL = '';

// ================= ABA 专业理论题库（内置兜底） =================
// 单选题（每题 5 分，随机抽 6 题）
const SINGLE_BANK = [
  { q: 'ABA 的全称是什么？', options: ['应用行为分析', '认知行为疗法', '结构化教学', '感觉统合训练'], answer: 0 },
  { q: 'ABC 行为分析中，B 指的是什么？', options: ['前因', '行为', '结果', '强化物'], answer: 1 },
  { q: '正强化是指？', options: ['行为后移除厌恶刺激', '行为后给予愉快刺激使行为增加', '行为后给予厌恶刺激', '忽略问题行为'], answer: 1 },
  { q: 'DTT 指的是哪种教学方法？', options: ['自然情境教学', '回合式教学', '关键反应训练', '地板时光'], answer: 1 },
  { q: '消退（Extinction）是指？', options: ['给予惩罚使行为减少', '不再强化之前被强化的行为', '转移注意力', '增加任务难度'], answer: 1 },
  { q: '选择强化物最重要的原则是？', options: ['价格越高越好', '越大越好', '符合孩子个体偏好', '固定不变'], answer: 2 },
  { q: '负强化是指？', options: ['行为后移除厌恶刺激使行为增加', '行为后给予厌恶刺激', '扣除代币', '罚站'], answer: 0 },
  { q: '代币制属于哪一类强化系统？', options: ['一级强化', '二级（条件性）强化', '惩罚系统', '消退程序'], answer: 1 }
];

// 多选题（每题 6 分，随机抽 5 题，少选得半分，错选不得分）
const MULTI_BANK = [
  { q: '行为的四大功能包括哪些？', options: ['获得关注', '逃避任务', '获得实物/活动', '自我刺激'], answer: [0, 1, 2, 3] },
  { q: '以下属于正强化的有？', options: ['口头表扬', '奖励代币', '完成作业后可以看动画', '罚抄课文'], answer: [0, 1, 2] },
  { q: '常用的行为数据记录方法有？', options: ['频率记录', '时距记录', '持续时间记录', 'ABC 记录'], answer: [0, 1, 2, 3] },
  { q: '教学中常见的提示类型包括？', options: ['肢体提示', '手势提示', '语言提示', '视觉提示'], answer: [0, 1, 2, 3] },
  { q: '促进技能泛化的做法有？', options: ['换不同的教学者', '换不同的环境', '换不同的教学材料', '只在固定教室练习'], answer: [0, 1, 2] },
  { q: '制定个别化教育计划（IEP）前应收集的信息包括？', options: ['评估结果', '家庭诉求', '既往干预记录', '孩子兴趣爱好'], answer: [0, 1, 2, 3] },
  { q: '以下哪些属于问题行为干预前的必要步骤？', options: ['功能性行为评估', '定义目标行为', '直接体罚', '建立基线数据'], answer: [0, 1, 3] }
];

// 名词解释（每题 8 分，随机抽 5 题，按关键词自动判分）
const TERM_BANK = [
  { term: '强化（Reinforcement）', hint: '提示：说明它与行为发生率的关系', keywords: ['行为', '增加', '刺激'] },
  { term: '惩罚（Punishment）', hint: '提示：说明它与行为发生率的关系', keywords: ['行为', '减少', '刺激'] },
  { term: '塑造（Shaping）', hint: '提示：逐步接近目标行为', keywords: ['逐步', '近似', '目标行为'] },
  { term: '任务分解（Task Analysis）', hint: '提示：复杂技能如何教学', keywords: ['分解', '步骤', '教学'] },
  { term: '功能性行为评估（FBA）', hint: '提示：为什么要做、怎么做', keywords: ['功能', 'ABC', '假设'] },
  { term: '泛化（Generalization）', hint: '提示：技能在不同条件下的表现', keywords: ['环境', '人物', '迁移'] },
  { term: '区别强化（DRA/DRO）', hint: '提示：替代行为与强化', keywords: ['替代行为', '强化', '问题行为'] }
];

const PASS_SCORE = 90;
const EXAM_SECONDS = 8 * 60;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

Page({
  data: {
    singles: [],
    multis: [],
    terms: [],
    letters: LETTERS,
    singleAns: {},
    multiAns: {},
    termAns: {},
    remainText: '08:00',
    timeUp: false,
    result: null,
    passScore: PASS_SCORE
  },

  onLoad() {
    this.loadBank().then(() => this.generatePaper());
  },

  // 拉取最新题库：云数据库 > 自有接口 > 缓存 > 内置
  loadBank() {
    return new Promise(resolve => {
      const cached = wx.getStorageSync('questionBank');
      if (cached && this.validBank(cached.data)) {
        this.bank = cached.data;
      }
      const fromHttp = () => {
        if (!QUESTION_BANK_URL) return resolve();
        wx.request({
          url: QUESTION_BANK_URL,
          timeout: 8000,
          success: res => {
            const d = res.data && (res.data.data || res.data);
            if (this.validBank(d)) {
              this.bank = d;
              wx.setStorageSync('questionBank', { data: d, updatedAt: Date.now() });
            }
            resolve();
          },
          fail: () => resolve()
        });
      };
      // 优先读云数据库 question_bank 集合（后台实时更新，考生端实时生效）
      if (wx.cloud && app.globalData.cloudReady) {
        wx.cloud.database().collection('question_bank').limit(100).get({
          success: res => {
            const d = this.rowsToBank(res.data);
            if (this.validBank(d)) {
              this.bank = d;
              wx.setStorageSync('questionBank', { data: d, updatedAt: Date.now() });
              resolve();
            } else {
              fromHttp();
            }
          },
          fail: () => fromHttp()
        });
      } else {
        fromHttp();
      }
    });
  },

  // 云数据库记录 → 题库结构
  // 记录格式：{ kind: 'single'|'multi'|'term', q, options, answer, term, hint, keywords }
  rowsToBank(rows) {
    const bank = { singles: [], multis: [], terms: [] };
    (rows || []).forEach(r => {
      if (r.kind === 'single') bank.singles.push({ q: r.q, options: r.options, answer: r.answer });
      else if (r.kind === 'multi') bank.multis.push({ q: r.q, options: r.options, answer: r.answer });
      else if (r.kind === 'term') bank.terms.push({ term: r.term, hint: r.hint, keywords: r.keywords });
    });
    return bank;
  },

  validBank(d) {
    return d &&
      Array.isArray(d.singles) && d.singles.length >= 6 &&
      Array.isArray(d.multis) && d.multis.length >= 5 &&
      Array.isArray(d.terms) && d.terms.length >= 5;
  },

  getBank() {
    return this.bank || { singles: SINGLE_BANK, multis: MULTI_BANK, terms: TERM_BANK };
  },

  onUnload() {
    this.clearTimer();
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  startTimer() {
    this.clearTimer();
    let remain = EXAM_SECONDS;
    const render = () => {
      const m = ('0' + Math.floor(remain / 60)).slice(-2);
      const s = ('0' + (remain % 60)).slice(-2);
      this.setData({ remainText: m + ':' + s });
    };
    render();
    this.timer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        this.clearTimer();
        this.setData({ remainText: '00:00' });
        this.autoSubmit();
        return;
      }
      render();
    }, 1000);
  },

  // 时间到，强制交卷
  autoSubmit() {
    if (this.data.result) return;
    this.setData({ timeUp: true });
    this.submit(true);
  },

  generatePaper() {
    const bank = this.getBank();
    this.setData({
      singles: shuffle(bank.singles).slice(0, 6),
      multis: shuffle(bank.multis).slice(0, 5).map(q => ({
        q: q.q,
        answer: q.answer,
        options: q.options.map(text => ({ text: text, sel: false }))
      })),
      terms: shuffle(bank.terms).slice(0, 5),
      singleAns: {},
      multiAns: {},
      termAns: {},
      timeUp: false,
      result: null
    });
    this.startTimer();
  },

  // ============ 作答 ============
  pickSingle(e) {
    const { qi, oi } = e.currentTarget.dataset;
    this.setData({ ['singleAns.' + qi]: oi });
  },

  pickMulti(e) {
    const { qi, oi } = e.currentTarget.dataset;
    const cur = (this.data.multiAns[qi] || []).slice();
    const idx = cur.indexOf(oi);
    if (idx === -1) cur.push(oi);
    else cur.splice(idx, 1);
    this.setData({
      ['multiAns.' + qi]: cur,
      ['multis[' + qi + '].options[' + oi + '].sel']: idx === -1
    });
  },

  onTermInput(e) {
    const qi = e.currentTarget.dataset.qi;
    this.setData({ ['termAns.' + qi]: e.detail.value });
  },

  // ============ 自动判分 ============
  submit(force) {
    if (this.data.result) return;
    this.clearTimer();
    const { singles, multis, terms, singleAns, multiAns, termAns } = this.data;

    const unansweredSingle = singles.some((_, i) => singleAns[i] == null);
    const unansweredMulti = multis.some((_, i) => !(multiAns[i] || []).length);
    const unansweredTerm = terms.some((_, i) => !(termAns[i] || '').trim());
    if (!force && (unansweredSingle || unansweredMulti || unansweredTerm)) {
      wx.showModal({
        title: '还有题目未完成',
        content: '请完成所有题目后再交卷',
        showCancel: false
      });
      return;
    }

    // 单选：每题 5 分
    let singleScore = 0;
    const wrongSingles = [];
    singles.forEach((q, i) => {
      if (singleAns[i] === q.answer) {
        singleScore += 5;
      } else {
        wrongSingles.push({
          no: i + 1,
          q: q.q,
          your: singleAns[i] != null ? LETTERS[singleAns[i]] : '未作答',
          correct: LETTERS[q.answer],
          correctText: q.options[q.answer]
        });
      }
    });

    // 多选：全对 6 分，少选 3 分，错选 0 分
    let multiScore = 0;
    const wrongMultis = [];
    multis.forEach((q, i) => {
      const sel = multiAns[i] || [];
      const hasWrong = sel.some(o => q.answer.indexOf(o) === -1);
      if (!hasWrong && sel.length === q.answer.length) {
        multiScore += 6;
        return;
      }
      if (!hasWrong && sel.length > 0) multiScore += 3;
      wrongMultis.push({
        no: i + 1,
        q: q.q,
        your: sel.length ? sel.slice().sort().map(o => LETTERS[o]).join('、') : '未作答',
        correct: q.answer.slice().sort().map(o => LETTERS[o]).join('、'),
        correctText: q.answer.map(o => q.options[o].text).join('；'),
        tip: hasWrong ? '存在错选' : '漏选了正确项'
      });
    });

    // 名词解释：按关键词覆盖率 × 8 分
    let termScore = 0;
    const termDetail = terms.map((t, i) => {
      const ans = (termAns[i] || '').toLowerCase();
      const hit = t.keywords.filter(k => ans.indexOf(k.toLowerCase()) !== -1);
      const miss = t.keywords.filter(k => ans.indexOf(k.toLowerCase()) === -1);
      const score = Math.round(hit.length / t.keywords.length * 8);
      termScore += score;
      return { term: t.term, score, hit: hit.length, total: t.keywords.length, miss: miss };
    });

    const total = singleScore + multiScore + termScore;
    const passed = total >= PASS_SCORE;

    if (passed) {
      const cert = wx.getStorageSync('teacherCert') || {};
      Object.assign(cert, { examScore: total, examPassed: true, examTime: Date.now() });
      wx.setStorageSync('teacherCert', cert);
    }

    this.setData({
      result: {
        total,
        passed,
        singleScore,
        multiScore,
        termScore,
        termDetail,
        wrongSingles,
        wrongMultis,
        wrongCount: wrongSingles.length + wrongMultis.length + termDetail.filter(t => t.miss.length > 0).length
      }
    });
  },

  closeResult() {
    this.setData({ result: null });
    if (this.data.result && this.data.result.passed) return;
  },

  retry() {
    this.generatePaper();
    wx.pageScrollTo({ scrollTop: 0 });
  },

  goCert() {
    wx.redirectTo({ url: '/pages/teacher-cert/teacher-cert' });
  },

  noop() {}
});
