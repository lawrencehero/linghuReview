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
    
    // 初始化云开发
    this.initCloud();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 初始化用户数据
    this.initUserData();
  },

  // 初始化云开发
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true,
    });

    console.log('云开发初始化完成，环境ID:', CLOUD_ENV_ID);
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  // 初始化用户数据
  initUserData() {
    // 获取用户统计数据
    this.getUserStats();
  },

  // 获取用户统计数据
  async getUserStats() {
    try {
      const db = wx.cloud.database();
      const { data } = await db.collection('reviews').where({
        _openid: '{openid}'
      }).count();
      
      this.globalData.stats.totalReviews = data.total;
      
      // 计算连续天数等其他统计数据
      this.calculateStats();
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
    }
  },

  // 计算统计数据
  calculateStats() {
    // 这里可以添加更复杂的统计计算逻辑
    console.log('统计数据计算完成');
  },

  // 用户登录
  async login() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      });
      
      this.globalData.userInfo = result.userInfo;
      this.globalData.isLogin = true;
      
      wx.setStorageSync('userInfo', result.userInfo);
      
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }
});

