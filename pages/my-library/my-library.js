// 默认资料库数据，后续可替换为云数据库
const DEFAULT_LIBRARY = [
  {
    id: 'a1',
    student: '小宝',
    type: '评估结果',
    title: '感觉统合能力评估',
    date: '2026-08-20',
    score: '前庭觉 68 / 本体觉 75 / 触觉 82',
    summary: '前庭觉偏弱，建议增加秋千、滑板等前庭刺激活动。',
    shared: true,
    group: '默认分组'
  },
  {
    id: 'a2',
    student: '小宝',
    type: '评估报告',
    title: 'VB-MAPP 阶段性评估报告',
    date: '2026-07-15',
    score: '里程碑总分 96',
    summary: '语言与社交领域进步明显，下一阶段重点训练集体指令跟随。',
    shared: false,
    group: '默认分组'
  },
  {
    id: 'a3',
    student: '小宝',
    type: '评估结果',
    title: '言语语言能力筛查',
    date: '2026-06-02',
    score: '表达 3.5岁 / 理解 4.2岁',
    summary: '表达能力落后于理解能力，建议加强口肌训练与仿说练习。',
    shared: true,
    group: '默认分组'
  },
  {
    id: 'a4',
    student: '朵朵',
    type: '评估报告',
    title: '入学适应综合评估报告',
    date: '2026-09-01',
    score: '综合适应等级 B+',
    summary: '课堂安坐可达 15 分钟，情绪触发点集中在任务转换环节。',
    shared: false,
    group: '默认分组'
  }
];

const DEFAULT_GROUPS = ['默认分组'];
const TABS = ['全部', '评估结果', '评估报告', '微信文件'];
const RECORD_TYPES = ['评估结果', '评估报告'];

function today() {
  const d = new Date();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return d.getFullYear() + '-' + m + '-' + day;
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

Page({
  data: {
    tabs: TABS,
    activeTab: '全部',
    list: [],
    groups: [],
    viewGroups: [],
    sharedCount: 0,
    highlightId: '',
    collapsed: {},
    // 新建/编辑表单
    showForm: false,
    editingId: '',
    formIsFile: false,
    form: { student: '', title: '', type: '评估结果', score: '', summary: '', group: '默认分组' },
    recordTypes: RECORD_TYPES,
    // 分组管理
    showGroupMgr: false,
    newGroupName: ''
  },

  onLoad(options) {
    if (options && options.sharedId) {
      this.setData({ highlightId: options.sharedId });
    }
  },

  onShow() {
    let library = wx.getStorageSync('library');
    if (!library || !library.length) {
      library = DEFAULT_LIBRARY;
      wx.setStorageSync('library', library);
    }
    let groups = wx.getStorageSync('libraryGroups');
    if (!groups || !groups.length) {
      groups = DEFAULT_GROUPS;
      wx.setStorageSync('libraryGroups', groups);
    }
    // 兼容旧数据：补充分组字段
    library = library.map(item => Object.assign({ group: '默认分组' }, item));
    wx.setStorageSync('library', library);
    this.setData({ list: library, groups });
    this.buildView();
  },

  buildView() {
    const { activeTab, list, groups, collapsed } = this.data;
    const filtered = activeTab === '全部'
      ? list
      : list.filter(item => item.type === activeTab);
    const viewGroups = groups.map(name => ({
      name: name,
      collapsed: !!collapsed[name],
      items: filtered.filter(item => item.group === name)
    }));
    this.setData({
      viewGroups,
      filteredCount: filtered.length,
      sharedCount: list.filter(item => item.shared).length
    });
  },

  noop() {},

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.value;
    if (activeTab === this.data.activeTab) return;
    this.setData({ activeTab });
    this.buildView();
  },

  // 分组展开 / 收起
  toggleGroup(e) {
    const name = e.currentTarget.dataset.name;
    const collapsed = Object.assign({}, this.data.collapsed);
    collapsed[name] = !collapsed[name];
    this.setData({ collapsed });
    this.buildView();
  },

  // ============ 微信文件上传 ============
  chooseWechatFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      success: res => {
        const files = res.tempFiles || [];
        if (!files.length) return;
        wx.showLoading({ title: '导入中…', mask: true });
        const fs = wx.getFileSystemManager();
        const newItems = [];
        let pending = files.length;
        const finish = () => {
          pending -= 1;
          if (pending > 0) return;
          wx.hideLoading();
          const list = newItems.concat(this.data.list);
          wx.setStorageSync('library', list);
          this.setData({ list });
          this.buildView();
          wx.showToast({ title: '已导入 ' + newItems.length + ' 个文件', icon: 'none' });
        };
        files.forEach(f => {
          const ext = (f.name.split('.').pop() || '').toLowerCase();
          const makeItem = savedPath => {
            newItems.push({
              id: 'f' + Date.now() + Math.floor(Math.random() * 1000),
              student: '',
              type: '微信文件',
              title: f.name,
              date: today(),
              score: formatSize(f.size),
              summary: '',
              shared: false,
              group: '默认分组',
              filePath: savedPath,
              fileType: ext
            });
            finish();
          };
          // 持久化保存文件，避免临时路径失效
          fs.saveFile({
            tempFilePath: f.path,
            success: r => makeItem(r.savedFilePath),
            fail: () => makeItem(f.path)
          });
        });
      }
    });
  },

  // 预览文件
  openFile(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) return;
    wx.openDocument({
      filePath: path,
      showMenu: true,
      fail: () => wx.showToast({ title: '该文件暂不支持预览', icon: 'none' })
    });
  },

  // ============ 新建 / 编辑 / 删除 ============
  showAddForm() {
    this.setData({
      showForm: true,
      editingId: '',
      formIsFile: false,
      form: { student: '', title: '', type: '评估结果', score: '', summary: '', group: this.data.groups[0] || '默认分组' }
    });
  },

  showActions(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.list.find(i => i.id === id);
    if (!item) return;
    const isFile = item.type === '微信文件';
    const actions = isFile
      ? ['编辑备注', '移动到分组', '删除']
      : ['编辑', '移动到分组', '删除'];
    wx.showActionSheet({
      itemList: actions,
      success: res => {
        if (res.tapIndex === 0) this.editItem(id);
        else if (res.tapIndex === 1) this.moveItem(id);
        else if (res.tapIndex === 2) this.deleteItem(id);
      }
    });
  },

  editItem(id) {
    const item = this.data.list.find(i => i.id === id);
    if (!item) return;
    this.setData({
      showForm: true,
      editingId: id,
      formIsFile: item.type === '微信文件',
      form: {
        student: item.student || '',
        title: item.title || '',
        type: item.type === '微信文件' ? '评估结果' : item.type,
        score: item.filePath ? '' : (item.score || ''),
        summary: item.summary || '',
        group: item.group || '默认分组'
      }
    });
  },

  deleteItem(id) {
    wx.showModal({
      title: '删除资料',
      content: '确定删除这条资料吗？',
      confirmColor: '#e8862e',
      success: res => {
        if (!res.confirm) return;
        const list = this.data.list.filter(item => item.id !== id);
        wx.setStorageSync('library', list);
        this.setData({ list });
        this.buildView();
        wx.showToast({ title: '已删除', icon: 'none' });
      }
    });
  },

  moveItem(id) {
    const groups = this.data.groups;
    wx.showActionSheet({
      itemList: groups,
      success: res => {
        const group = groups[res.tapIndex];
        const list = this.data.list.map(item =>
          item.id === id ? Object.assign({}, item, { group }) : item
        );
        wx.setStorageSync('library', list);
        this.setData({ list });
        this.buildView();
        wx.showToast({ title: '已移动到「' + group + '」', icon: 'none' });
      }
    });
  },

  // 表单
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  onFormType(e) {
    this.setData({ 'form.type': RECORD_TYPES[Number(e.detail.value)] });
  },

  onFormGroup(e) {
    this.setData({ 'form.group': this.data.groups[Number(e.detail.value)] });
  },

  closeForm() {
    this.setData({ showForm: false });
  },

  saveForm() {
    const f = this.data.form;
    if (!f.title.trim()) {
      wx.showToast({ title: '请填写标题', icon: 'none' });
      return;
    }
    let list;
    if (this.data.editingId) {
      list = this.data.list.map(item => {
        if (item.id !== this.data.editingId) return item;
        return Object.assign({}, item, {
          student: f.student.trim(),
          title: f.title.trim(),
          type: item.type === '微信文件' ? '微信文件' : f.type,
          score: item.filePath ? item.score : f.score.trim(),
          summary: f.summary.trim(),
          group: f.group
        });
      });
    } else {
      list = [{
        id: 'r' + Date.now(),
        student: f.student.trim(),
        type: f.type,
        title: f.title.trim(),
        date: today(),
        score: f.score.trim(),
        summary: f.summary.trim(),
        shared: false,
        group: f.group
      }].concat(this.data.list);
    }
    wx.setStorageSync('library', list);
    this.setData({ list, showForm: false });
    this.buildView();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  // ============ 分组管理 ============
  openGroupMgr() {
    this.setData({ showGroupMgr: true, newGroupName: '' });
  },

  closeGroupMgr() {
    this.setData({ showGroupMgr: false });
  },

  onNewGroupInput(e) {
    this.setData({ newGroupName: e.detail.value });
  },

  addGroup() {
    const name = this.data.newGroupName.trim();
    if (!name) {
      wx.showToast({ title: '请输入分组名称', icon: 'none' });
      return;
    }
    if (this.data.groups.indexOf(name) !== -1) {
      wx.showToast({ title: '分组已存在', icon: 'none' });
      return;
    }
    const groups = this.data.groups.concat([name]);
    wx.setStorageSync('libraryGroups', groups);
    this.setData({ groups, newGroupName: '' });
    this.buildView();
  },

  deleteGroup(e) {
    const name = e.currentTarget.dataset.name;
    if (name === '默认分组') {
      wx.showToast({ title: '默认分组不能删除', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '删除分组',
      content: '删除后，组内资料会移到「默认分组」',
      confirmColor: '#e8862e',
      success: res => {
        if (!res.confirm) return;
        const groups = this.data.groups.filter(g => g !== name);
        const list = this.data.list.map(item =>
          item.group === name ? Object.assign({}, item, { group: '默认分组' }) : item
        );
        wx.setStorageSync('libraryGroups', groups);
        wx.setStorageSync('library', list);
        this.setData({ groups, list });
        this.buildView();
      }
    });
  },

  // ============ 分享 ============
  toggleShare(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.list.map(item =>
      item.id === id ? Object.assign({}, item, { shared: !item.shared }) : item
    );
    wx.setStorageSync('library', list);
    this.setData({ list });
    this.buildView();
    const target = list.find(item => item.id === id);
    wx.showToast({
      title: target.shared ? '已分享给平台用户' : '已设为仅自己可见',
      icon: 'none'
    });
  },

  onShareAppMessage(e) {
    const id = e.from === 'button' && e.target ? e.target.dataset.id : '';
    const item = this.data.list.find(i => i.id === id) || {};
    const title = item.title
      ? (item.student ? item.student + '的' : '') + item.title + ' - 星屿海海资料库'
      : '星屿海海 - 我的资料库';
    return {
      title: title,
      path: '/pages/my-library/my-library' + (item.id ? '?sharedId=' + item.id : '')
    };
  }
});
