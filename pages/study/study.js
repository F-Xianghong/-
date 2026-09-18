const { recordStudy } = require('../../utils/badges.js');

// 公益学习资料，后续可替换为云数据库
const MATERIALS = [
  {
    id: 's1',
    title: '家庭感统训练 20 招',
    category: '感统训练',
    type: '图文',
    org: '星桥特教中心',
    duration: '约 15 分钟读完',
    views: 3260,
    free: true,
    intro: '用家里的抱枕、毛巾、椅子就能做的感统小游戏，附每个动作的训练目标。'
  },
  {
    id: 's2',
    title: '口肌训练入门课',
    category: '言语语言',
    type: '视频',
    org: '启航康复中心',
    duration: '6 节课 · 共 90 分钟',
    views: 5180,
    free: true,
    intro: '从吹气、吸吮到咀嚼，系统讲解口肌训练的家庭操作方法。'
  },
  {
    id: 's3',
    title: '融合幼儿园家长手册',
    category: '家长课堂',
    type: '图文',
    org: '麦田计划',
    duration: '约 25 分钟读完',
    views: 2140,
    free: true,
    intro: '入园前准备、与老师的沟通话术、常见问题应对，一篇讲透。'
  },
  {
    id: 's4',
    title: '社交故事编写工作坊回放',
    category: '社交沟通',
    type: '直播回放',
    org: '海龟爸爸工作室',
    duration: '120 分钟',
    views: 1560,
    free: true,
    intro: '手把手教你给孩子写社交故事，含 10 个可直接套用的模板。'
  },
  {
    id: 's5',
    title: '情绪行为问题家庭干预',
    category: '行为干预',
    type: '视频',
    org: '星桥特教中心',
    duration: '4 节课 · 共 60 分钟',
    views: 4420,
    free: true,
    intro: 'ABC 行为分析法入门，学会记录、分析并调整家庭中的触发因素。'
  },
  {
    id: 's6',
    title: '大龄特需青年职业转衔指南',
    category: '家长课堂',
    type: '图文',
    org: '麦田计划',
    duration: '约 30 分钟读完',
    views: 980,
    free: true,
    intro: '从生活技能到支持性就业，为 16 岁以上孩子规划转衔路径。'
  }
];

const CATEGORIES = ['全部', '感统训练', '言语语言', '社交沟通', '行为干预', '家长课堂'];

Page({
  data: {
    categories: CATEGORIES,
    activeCat: '全部',
    materials: MATERIALS,
    list: [],
    favs: [],
    detail: null
  },

  onShow() {
    this.setData({ favs: wx.getStorageSync('studyFavs') || [] });
    this.loadMaterials();
  },

  // 优先读云数据库 study_materials 集合，读不到用内置资料
  loadMaterials() {
    const app = getApp();
    const useLocal = () => {
      this.setData({ materials: MATERIALS }, () => this.buildList());
    };
    if (wx.cloud && app.globalData.cloudReady) {
      wx.cloud.database().collection('study_materials').limit(100).get({
        success: res => {
          if (res.data && res.data.length) {
            // 云端记录兼容本地字段：id 用 _id 兜底
            const materials = res.data.map(m => Object.assign({ id: m._id }, m));
            this.setData({ materials }, () => this.buildList());
          } else {
            useLocal();
          }
        },
        fail: useLocal
      });
    } else {
      useLocal();
    }
  },

  buildList() {
    const { activeCat, favs, materials } = this.data;
    const list = materials
      .filter(m => activeCat === '全部' || m.category === activeCat)
      .map(m => Object.assign({}, m, { isFav: favs.indexOf(m.id) !== -1 }));
    this.setData({ list });
  },

  switchCat(e) {
    const activeCat = e.currentTarget.dataset.value;
    if (activeCat === this.data.activeCat) return;
    this.setData({ activeCat });
    this.buildList();
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    const detail = this.data.list.find(m => m.id === id);
    recordStudy();
    this.setData({ detail });
  },

  closeDetail() {
    this.setData({ detail: null });
  },

  noop() {},

  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    const favs = this.data.favs.slice();
    const idx = favs.indexOf(id);
    if (idx === -1) {
      favs.push(id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    } else {
      favs.splice(idx, 1);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    }
    wx.setStorageSync('studyFavs', favs);
    this.setData({ favs });
    this.buildList();
  },

  startLearn() {
    const detail = this.data.detail;
    // 云端资料带了 fileID（云存储文件）：下载后打开
    if (detail && detail.fileID && wx.cloud) {
      wx.showLoading({ title: '加载中…', mask: true });
      wx.cloud.downloadFile({
        fileID: detail.fileID,
        success: res => {
          wx.hideLoading();
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            fail: () => wx.showToast({ title: '该文件暂不支持预览', icon: 'none' })
          });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '文件加载失败', icon: 'none' });
        }
      });
      return;
    }
    wx.showToast({ title: '学习内容加载中…', icon: 'none' });
  }
});
