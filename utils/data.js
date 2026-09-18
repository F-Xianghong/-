// 模拟陪伴服务提供者数据，后续可替换为云数据库
const providers = [
  {
    id: 'p1',
    name: '林老师',
    emoji: '👩‍🏫',
    identity: '老师',
    services: ['上午陪读', '下午陪读'],
    price: 4500,
    scopes: ['同区域', '同城', '全国'],
    region: '上海 · 浦东新区',
    intro: '8 年特教经验，擅长融合课堂陪伴'
  },
  {
    id: 'p2',
    name: '星桥特教中心',
    emoji: '🏫',
    identity: '爱心企业',
    services: ['机构试课', '入户干预'],
    price: 8800,
    scopes: ['同城', '全国'],
    region: '上海 · 徐汇区',
    intro: '持证康复师团队，支持免费试课一节'
  },
  {
    id: 'p3',
    name: '陈老师',
    emoji: '👨‍🏫',
    identity: '老师',
    services: ['夜间陪读', '入户干预'],
    price: 12000,
    scopes: ['全国'],
    region: '北京 · 朝阳区',
    intro: '专注大龄特需人群生活技能训练'
  },
  {
    id: 'p4',
    name: '周阿姨',
    emoji: '👵',
    identity: '家长',
    services: ['上午陪读'],
    price: 3800,
    scopes: ['同区域'],
    region: '上海 · 浦东新区',
    intro: '陪读自家孩子 5 年，耐心细致'
  },
  {
    id: 'p5',
    name: '启航康复中心',
    emoji: '⛵',
    identity: '爱心企业',
    services: ['机构试课'],
    price: 15000,
    scopes: ['全国'],
    region: '广州 · 天河区',
    intro: '言语康复 + 感统训练综合机构'
  },
  {
    id: 'p6',
    name: '小吴老师',
    emoji: '🧑‍🏫',
    identity: '老师',
    services: ['下午陪读', '夜间陪读'],
    price: 6800,
    scopes: ['同城', '全国'],
    region: '上海 · 闵行区',
    intro: '影子老师，可随班入校陪伴'
  },
  {
    id: 'p7',
    name: '海龟爸爸工作室',
    emoji: '🐢',
    identity: '老师',
    services: ['入户干预'],
    price: 9800,
    scopes: ['同区域', '同城'],
    region: '上海 · 静安区',
    intro: 'ABA 入户一对一，定制个别化计划'
  },
  {
    id: 'p8',
    name: '麦田计划',
    emoji: '🌾',
    identity: '爱心企业',
    services: ['上午陪读', '机构试课'],
    price: 5200,
    scopes: ['全国'],
    region: '杭州 · 西湖区',
    intro: '公益补贴项目，贝壳可抵扣费用'
  }
];

// 模拟附近帖子数据，后续可替换为云数据库
const posts = [
  {
    id: 'pt1',
    authorName: '星海妈妈',
    authorEmoji: '👨‍👩‍👧',
    identity: '家长',
    topic: '求助',
    content: '求推荐浦东靠谱的感统训练机构，孩子 5 岁，评估说前庭觉偏弱，有上过的家长吗？',
    imageCount: 0,
    region: '上海 · 浦东新区',
    city: '上海',
    distanceM: 650,
    timeText: '12分钟前',
    likes: 8,
    comments: 15
  },
  {
    id: 'pt2',
    authorName: '林老师',
    authorEmoji: '👩‍🏫',
    identity: '老师',
    topic: '经验分享',
    content: '融合课堂陪读三个月小结：代币制 + 视觉提示卡对情绪稳定帮助最大，分享给大家。',
    imageCount: 3,
    region: '上海 · 浦东新区',
    city: '上海',
    distanceM: 900,
    timeText: '36分钟前',
    likes: 42,
    comments: 11
  },
  {
    id: 'pt3',
    authorName: '贝壳爸爸',
    authorEmoji: '🐚',
    identity: '家长',
    topic: '陪读日记',
    content: '今天小宝第一次在小组课上主动举手回答问题，记录一下这个小小的里程碑。',
    imageCount: 1,
    region: '上海 · 徐汇区',
    city: '上海',
    distanceM: 3200,
    timeText: '1小时前',
    likes: 56,
    comments: 23
  },
  {
    id: 'pt4',
    authorName: '星桥特教中心',
    authorEmoji: '🏫',
    identity: '爱心企业',
    topic: '机构推荐',
    content: '本周六开放日，可免费体验感统课一节，名额 10 个，欢迎预约。',
    imageCount: 2,
    region: '上海 · 徐汇区',
    city: '上海',
    distanceM: 4600,
    timeText: '2小时前',
    likes: 19,
    comments: 7
  },
  {
    id: 'pt5',
    authorName: '远航妈妈',
    authorEmoji: '⛵',
    identity: '家长',
    topic: '转让互助',
    content: '转让九成新平衡木和触觉垫，孩子用不上了，同城自提优先。',
    imageCount: 4,
    region: '北京 · 朝阳区',
    city: '北京',
    distanceM: 1200000,
    timeText: '昨天',
    likes: 5,
    comments: 3
  },
  {
    id: 'pt6',
    authorName: '陈老师',
    authorEmoji: '👨‍🏫',
    identity: '老师',
    topic: '经验分享',
    content: '大龄特需人群生活技能训练：从超市购物清单开始，分四步建立独立购物能力。',
    imageCount: 0,
    region: '北京 · 海淀区',
    city: '北京',
    distanceM: 1250000,
    timeText: '昨天',
    likes: 31,
    comments: 9
  },
  {
    id: 'pt7',
    authorName: '麦田计划',
    authorEmoji: '🌾',
    identity: '爱心企业',
    topic: '求助',
    content: '寻找有 ABA 经验的志愿者老师，参与周末公益陪伴活动，坐标杭州。',
    imageCount: 0,
    region: '杭州 · 西湖区',
    city: '杭州',
    distanceM: 170000,
    timeText: '2天前',
    likes: 12,
    comments: 6
  }
];

// 模拟作者名片资料，后续可替换为云数据库（按 openid 查询）
const authorProfiles = {
  '林老师': {
    signature: '8 年特教经验，擅长融合课堂陪伴',
    certified: true,
    badges: [
      { id: 'cert', emoji: '🎓', name: '认证专业老师', desc: '已通过 ABA 专业考试与资质审核', earned: true },
      { id: 'm1', emoji: '🌟', name: '9月 · 好学之星', desc: '本月限定徽章', earned: true, monthly: true }
    ]
  },
  '陈老师': {
    signature: '专注大龄特需人群生活技能训练',
    certified: true,
    badges: [
      { id: 'cert', emoji: '🎓', name: '认证专业老师', desc: '已通过 ABA 专业考试与资质审核', earned: true }
    ]
  },
  '海龟爸爸工作室': {
    signature: 'ABA 入户一对一，定制个别化计划',
    certified: true,
    badges: [
      { id: 'cert', emoji: '🎓', name: '认证专业老师', desc: '已通过 ABA 专业考试与资质审核', earned: true }
    ]
  },
  '星桥特教中心': {
    signature: '持证康复师团队，支持免费试课一节',
    certified: true,
    badges: [
      { id: 'cert', emoji: '🏫', name: '认证机构', desc: '已通过平台资质审核', earned: true }
    ]
  },
  '麦田计划': {
    signature: '公益补贴项目，贝壳可抵扣费用',
    certified: true,
    badges: [
      { id: 'cert', emoji: '🏫', name: '认证机构', desc: '已通过平台资质审核', earned: true }
    ]
  },
  '星海妈妈': {
    signature: '陪孩子一起慢慢长大',
    certified: false,
    badges: [
      { id: 'study3', emoji: '🌱', name: '学习新星', desc: '公益知识库学习满 3 次', earned: true }
    ]
  },
  '贝壳爸爸': {
    signature: '记录小宝的每一个小进步',
    certified: false,
    badges: []
  },
  '远航妈妈': {
    signature: '愿每颗星星都被温柔以待',
    certified: false,
    badges: []
  }
};

module.exports = { providers, posts, authorProfiles };
