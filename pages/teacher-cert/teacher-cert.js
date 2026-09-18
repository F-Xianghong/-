const EDU_OPTIONS = ['中专以下', '中专', '大专', '本科', '硕士', '博士及以上'];
const YEAR_OPTIONS = ['1年以下', '1-3年', '3-5年', '5-10年', '10年以上'];

// 自有后台接口（备选通道）。已接入微信云开发云函数 submitTeacherCert，
// 云开发可用时走云函数；不可用时走此接口；都不可用进入本地队列。
const REVIEW_URL = '';

Page({
  data: {
    cert: {},
    eduOptions: EDU_OPTIONS,
    yearOptions: YEAR_OPTIONS,
    form: {
      name: '',
      major: '',
      eduIndex: -1,
      yearIndex: -1,
      certs: [],
      note: ''
    }
  },

  onLoad() {
    const cert = wx.getStorageSync('teacherCert') || {};
    this.setData({
      cert,
      'form.name': cert.name || '',
      'form.major': cert.major || '',
      'form.eduIndex': cert.eduIndex != null ? cert.eduIndex : -1,
      'form.yearIndex': cert.yearIndex != null ? cert.yearIndex : -1,
      'form.certs': cert.certs || [],
      'form.note': cert.note || ''
    });
  },

  // 只刷新认证状态（如考试通过后返回），不重置用户正在填写的表单
  onShow() {
    const cert = wx.getStorageSync('teacherCert') || {};
    this.setData({ cert });
  },

  goExam() {
    wx.navigateTo({ url: '/pages/teacher-exam/teacher-exam' });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  onEdu(e) {
    this.setData({ 'form.eduIndex': Number(e.detail.value) });
  },

  onYear(e) {
    this.setData({ 'form.yearIndex': Number(e.detail.value) });
  },

  // 上传证书/资质照片
  chooseCert() {
    const remain = 9 - this.data.form.certs.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传 9 张', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      success: res => {
        const fs = wx.getFileSystemManager();
        const saved = [];
        let pending = res.tempFiles.length;
        res.tempFiles.forEach(f => {
          const done = path => {
            saved.push(path);
            pending -= 1;
            if (pending === 0) {
              this.setData({ 'form.certs': this.data.form.certs.concat(saved) });
            }
          };
          fs.saveFile({
            tempFilePath: f.tempFilePath,
            success: r => done(r.savedFilePath),
            fail: () => done(f.tempFilePath)
          });
        });
      }
    });
  },

  previewCert(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.form.certs[index],
      urls: this.data.form.certs
    });
  },

  removeCert(e) {
    const index = e.currentTarget.dataset.index;
    const certs = this.data.form.certs.slice();
    certs.splice(index, 1);
    this.setData({ 'form.certs': certs });
  },

  submit() {
    const f = this.data.form;
    if (!this.data.cert.examPassed) {
      wx.showToast({ title: '请先通过专业考试', icon: 'none' });
      return;
    }
    if (!f.name.trim()) {
      wx.showToast({ title: '请填写真实姓名', icon: 'none' });
      return;
    }
    if (!f.major.trim()) {
      wx.showToast({ title: '请填写专业方向', icon: 'none' });
      return;
    }
    if (f.eduIndex < 0) {
      wx.showToast({ title: '请选择学历', icon: 'none' });
      return;
    }
    if (f.yearIndex < 0) {
      wx.showToast({ title: '请选择从业年限', icon: 'none' });
      return;
    }
    if (!f.certs.length) {
      wx.showToast({ title: '请上传证书材料', icon: 'none' });
      return;
    }
    const cert = Object.assign({}, this.data.cert, {
      name: f.name.trim(),
      major: f.major.trim(),
      eduIndex: f.eduIndex,
      education: EDU_OPTIONS[f.eduIndex],
      yearIndex: f.yearIndex,
      years: YEAR_OPTIONS[f.yearIndex],
      certs: f.certs,
      note: f.note.trim(),
      status: 'pending',
      submitTime: Date.now()
    });
    wx.setStorageSync('teacherCert', cert);
    this.setData({ cert });
    this.sendToBackend(cert);
    wx.showModal({
      title: '提交成功',
      content: '注册信息已打包发送至开发者后台审核，结果将在 1-3 个工作日内反馈',
      showCancel: false
    });
  },

  // 把注册老师的信息打包发送给开发者后台审核
  // 通道优先级：云函数（图片传云存储）→ 自有接口 → 本地队列
  sendToBackend(cert) {
    const pkg = {
      name: cert.name,
      major: cert.major,
      education: cert.education,
      years: cert.years,
      examScore: cert.examScore,
      examTime: cert.examTime,
      note: cert.note,
      certImages: cert.certs,
      submitTime: cert.submitTime
    };
    const app = getApp();
    if (wx.cloud && app.globalData.cloudReady) {
      this.uploadCertImages(cert.certs)
        .then(fileIDs => {
          pkg.certImages = fileIDs;
          return wx.cloud.callFunction({ name: 'submitTeacherCert', data: pkg });
        })
        .then(res => {
          if (!res.result || !res.result.ok) throw new Error('cloud fail');
        })
        .catch(() => this.fallbackSend(pkg));
      return;
    }
    this.fallbackSend(pkg);
  },

  // 证书图片逐个上传到云存储，返回 fileID 列表
  uploadCertImages(paths) {
    const tasks = paths.map((p, i) =>
      wx.cloud.uploadFile({
        cloudPath: 'teacher-cert/' + Date.now() + '-' + i + '.jpg',
        filePath: p
      }).then(r => r.fileID)
    );
    return Promise.all(tasks);
  },

  fallbackSend(pkg) {
    if (REVIEW_URL) {
      wx.request({
        url: REVIEW_URL,
        method: 'POST',
        data: pkg,
        fail: () => this.enqueue(pkg)
      });
    } else {
      this.enqueue(pkg);
    }
  },

  // 本地待审核队列（开发者工具 Storage 面板可查看 certSubmissions）
  enqueue(pkg) {
    const queue = wx.getStorageSync('certSubmissions') || [];
    queue.push(pkg);
    wx.setStorageSync('certSubmissions', queue);
  },

  // 演示用：模拟后台审核通过
  mockApprove() {
    const cert = Object.assign({}, this.data.cert, { status: 'approved' });
    wx.setStorageSync('teacherCert', cert);
    this.setData({ cert });
    wx.showToast({ title: '已通过认证（演示）', icon: 'none' });
  },

  // 演示用：模拟后台审核不通过
  mockReject() {
    const cert = Object.assign({}, this.data.cert, { status: 'rejected' });
    wx.setStorageSync('teacherCert', cert);
    this.setData({ cert });
    wx.showToast({ title: '已驳回（演示）', icon: 'none' });
  }
});
