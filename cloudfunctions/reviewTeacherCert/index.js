// 云函数：后台审核用（查询待审核列表 / 通过 / 驳回）
// 建议仅在你自己的管理端小程序或 CMS 中调用；生产环境请加管理员鉴权
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const coll = db.collection('teacher_cert_submissions');

  try {
    // 查询待审核列表
    if (event.action === 'list') {
      const res = await coll
        .where({ status: event.status || 'pending' })
        .orderBy('submitTime', 'desc')
        .limit(50)
        .get();
      return { ok: true, list: res.data };
    }

    // 审核：action = approve / reject，需传 id
    if (event.action === 'approve' || event.action === 'reject') {
      if (!event.id) return { ok: false, error: '缺少 id' };
      await coll.doc(event.id).update({
        data: {
          status: event.action === 'approve' ? 'approved' : 'rejected',
          reviewTime: db.serverDate(),
          reviewNote: event.note || ''
        }
      });
      return { ok: true };
    }

    return { ok: false, error: '未知 action' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};
