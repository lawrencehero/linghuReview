// 🔥 配置位置1：在这里填写您的云开发环境ID
const CLOUD_ENV_ID = 'cloud1-5gkfmzaud0b175ac'; // 替换为您的云开发环境ID，例如：'linghu-review-7g2h3j4k'

App({
  globalData: {
    userInfo: null,
    cloudEnvId: CLOUD_ENV_ID,
    isLogin: false,
    appName: '灵狐复盘',
    version: '1.0.0',
    // 统计数据
    stats: {
      totalReviews: 0,
      continuousDays: 0,
      completionRate: 0
    }
  },

  onLaunch: function () {
    console.log('灵狐复盘小程序启动');

    // 尝试初始化云开发（如果可用）
    this.initCloud();

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 初始化云开发
  initCloud() {
    // 检查云开发是否可用
    if (typeof wx.cloud !== 'undefined') {
      try {
        wx.cloud.init({
          env: CLOUD_ENV_ID,
          traceUser: true,
        });
        console.log('云开发初始化完成，环境ID:', CLOUD_ENV_ID);
      } catch (error) {
        console.log('云开发初始化失败:', error);
      }
    } else {
      console.log('云开发不可用');
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  // 用户登录 (简化版本，不依赖云函数)
  login() {
    return new Promise((resolve, reject) => {
      // 模拟登录成功
      const userInfo = {
        nickName: '灵狐用户',
        avatarUrl: '/images/default-avatar.png'
      };

      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;

      wx.setStorageSync('userInfo', userInfo);

      resolve({
        success: true,
        userInfo: userInfo
      });
    });
  }
});