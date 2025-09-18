// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户信息
    const userInfo = {
      openid: wxContext.OPENID,
      appId: wxContext.APPID,
      unionId: wxContext.UNIONID
    }

    // 检查用户是否已存在
    const userResult = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get()

    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      const newUser = {
        openid: wxContext.OPENID,
        appId: wxContext.APPID,
        nickName: event.nickName || '',
        avatarUrl: event.avatarUrl || '',
        gender: event.gender || 0,
        country: event.country || '',
        province: event.province || '',
        city: event.city || '',
        language: event.language || '',
        createTime: new Date(),
        updateTime: new Date(),
        lastLoginTime: new Date()
      }

      const createResult = await db.collection('users').add({
        data: newUser
      })

      userInfo.userId = createResult._id
      userInfo.isNewUser = true
    } else {
      // 老用户，更新最后登录时间
      const existingUser = userResult.data[0]
      userInfo.userId = existingUser._id
      userInfo.isNewUser = false
      userInfo.nickName = existingUser.nickName
      userInfo.avatarUrl = existingUser.avatarUrl

      // 更新最后登录时间
      await db.collection('users').doc(existingUser._id).update({
        data: {
          lastLoginTime: new Date(),
          updateTime: new Date()
        }
      })
    }

    return {
      success: true,
      userInfo: userInfo
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}