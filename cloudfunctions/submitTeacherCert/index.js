// 云函数：接收老师认证材料，写入云数据库 teacher_cert_submissions 集合
// 部署：右键本文件夹 → 上传并部署（云端安装依赖）
const cloud = require('wx-server-sdk');
// 初始化参数（需在 cloud.init 之前定义）
const initOptions = {};

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();

  const data = {
    _openid: OPENID,
    type: 'teacher-cert',
    name: event.name || '',
    major: event.major || '',
    education: event.education || '',
    years: event.years || '',
    examScore: event.examScore || 0,
    examTime: event.examTime || null,
    note: event.note || '',
    certImages: event.certImages || [], // 云存储 fileID 列表
    status: 'pending',                  // pending / approved / rejected
    submitTime: db.serverDate()
  };

  try {
    const res = await db.collection('teacher_cert_submissions').add({ data });
    return { ok: true, id: res._id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};
