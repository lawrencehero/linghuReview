// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data, id } = event

  try {
    switch (action) {
      case 'create':
        return await createReview(data, wxContext)
      case 'update':
        return await updateReview(id, data, wxContext)
      case 'delete':
        return await deleteReview(id, wxContext)
      case 'get':
        return await getReview(id, wxContext)
      case 'list':
        return await listReviews(data, wxContext)
      case 'stats':
        return await getStats(wxContext)
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 创建复盘记录
async function createReview(reviewData, wxContext) {
  const review = {
    ...reviewData,
    _openid: wxContext.OPENID,
    createTime: new Date(),
    updateTime: new Date()
  }

  const result = await db.collection('reviews').add({
    data: review
  })

  return {
    success: true,
    data: {
      id: result._id,
      ...review
    }
  }
}

// 更新复盘记录
async function updateReview(id, reviewData, wxContext) {
  const updateData = {
    ...reviewData,
    updateTime: new Date()
  }

  const result = await db.collection('reviews').doc(id).update({
    data: updateData
  })

  return {
    success: true,
    data: result
  }
}

// 删除复盘记录
async function deleteReview(id, wxContext) {
  const result = await db.collection('reviews').doc(id).remove()

  return {
    success: true,
    data: result
  }
}

// 获取单个复盘记录
async function getReview(id, wxContext) {
  const result = await db.collection('reviews').doc(id).get()

  return {
    success: true,
    data: result.data
  }
}

// 获取复盘记录列表
async function listReviews(queryParams, wxContext) {
  const { page = 1, limit = 10, type, tag, keyword } = queryParams
  const offset = (page - 1) * limit

  let query = db.collection('reviews').where({
    _openid: wxContext.OPENID
  })

  // 类型筛选
  if (type) {
    query = query.where({
      type: type
    })
  }

  // 标签筛选
  if (tag) {
    query = query.where({
      tags: _.in([tag])
    })
  }

  // 关键词搜索
  if (keyword) {
    query = query.where(
      _.or([
        { title: db.RegExp({ regexp: keyword, options: 'i' }) },
        { 'content.highlights': db.RegExp({ regexp: keyword, options: 'i' }) },
        { 'content.challenges': db.RegExp({ regexp: keyword, options: 'i' }) },
        { 'content.learnings': db.RegExp({ regexp: keyword, options: 'i' }) },
        { 'content.improvements': db.RegExp({ regexp: keyword, options: 'i' }) }
      ])
    )
  }

  // 排序和分页
  const result = await query
    .orderBy('createTime', 'desc')
    .skip(offset)
    .limit(limit)
    .get()

  // 获取总数
  const countResult = await query.count()

  return {
    success: true,
    data: {
      list: result.data,
      total: countResult.total,
      page,
      limit
    }
  }
}

// 获取统计信息
async function getStats(wxContext) {
  // 获取总复盘数
  const totalResult = await db.collection('reviews')
    .where({ _openid: wxContext.OPENID })
    .count()

  // 获取各类型统计
  const typeStats = {}
  const types = ['daily', 'weekly', 'monthly', 'project']

  for (const type of types) {
    const countResult = await db.collection('reviews')
      .where({
        _openid: wxContext.OPENID,
        type: type
      })
      .count()
    typeStats[type] = countResult.total
  }

  // 获取最近7天的数据
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentResult = await db.collection('reviews')
    .where({
      _openid: wxContext.OPENID,
      createTime: _.gte(sevenDaysAgo)
    })
    .count()

  return {
    success: true,
    data: {
      total: totalResult.total,
      types: typeStats,
      recent: recentResult.total
    }
  }
}