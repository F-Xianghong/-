// 徽章体系：认证徽章 / 学习徽章 / 每月特色徽章
function monthKey() {
  const d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
}

function monthLabel() {
  return (new Date().getMonth() + 1) + '月';
}

// 记录一次公益学习行为（打开学习资料详情 / 开始学习时调用）
function recordStudy() {
  const total = (wx.getStorageSync('studyTotal') || 0) + 1;
  wx.setStorageSync('studyTotal', total);
  let m = wx.getStorageSync('studyMonthly');
  if (!m || m.month !== monthKey()) {
    m = { month: monthKey(), count: 0 };
  }
  m.count += 1;
  wx.setStorageSync('studyMonthly', m);
}

function getStudyTotal() {
  return wx.getStorageSync('studyTotal') || 0;
}

function getMonthCount() {
  const m = wx.getStorageSync('studyMonthly');
  return m && m.month === monthKey() ? m.count : 0;
}

// 计算当前用户的徽章列表（含已获得与未获得）
function computeBadges(profile, teacherCert) {
  const identity = (profile && profile.identity) || '家长';
  const certified = !!teacherCert && teacherCert.status === 'approved';
  const total = getStudyTotal();
  const monthCount = getMonthCount();
  const badges = [];

  // 老师：认证与未认证是不同的徽章标签
  if (identity === '老师') {
    badges.push({
      id: 'cert',
      emoji: certified ? '🎓' : '📋',
      name: certified ? '认证专业老师' : '老师 · 未认证',
      desc: certified ? '已通过 ABA 专业考试与资质审核' : '通过专业考试与资质审核后点亮',
      earned: certified
    });
  }

  // 公益学习徽章（所有身份都可点亮）
  badges.push(
    {
      id: 'study3',
      emoji: '🌱',
      name: '学习新星',
      desc: '公益知识库学习满 3 次（当前 ' + total + ' 次）',
      earned: total >= 3
    },
    {
      id: 'study10',
      emoji: '🏅',
      name: '学习达人',
      desc: '公益知识库学习满 10 次（当前 ' + total + ' 次）',
      earned: total >= 10
    },
    {
      id: 'monthly',
      emoji: '🌟',
      name: monthLabel() + ' · 好学之星',
      desc: '本月学习满 3 次（本月 ' + monthCount + ' 次），每月限定徽章',
      earned: monthCount >= 3,
      monthly: true
    }
  );

  return badges;
}

module.exports = { recordStudy, computeBadges };
