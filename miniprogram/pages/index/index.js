// index.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    userLevel: 1,
    stats: {
      continuousDays: 0,
      completionRate: 0
    },
    weekProgress: {
      completed: 0,
      total: 7,
      percentage: 0
    },
    recentReviews: [],
    todayReminder: '',
    dailyQuote: {
      content: '每日三省吾身，不断成长进步',
      author: '灵狐复盘'
    }
  },

  onLoad() {
    console.log('灵狐复盘首页加载');
    this.initPage();
  },

  onShow() {
    this.refreshData();
  },

  // 初始化页面
  async initPage() {
    try {
      // 检查登录状态
      if (!app.globalData.isLogin) {
        await this.checkLogin();
      }
      
      // 加载用户信息
      this.loadUserInfo();
      
      // 加载数据
      await this.loadData();
      
    } catch (error) {
      console.error('页面初始化失败:', error);
      this.showError('页面加载失败，请稍后重试');
    }
  },

  // 检查登录状态
  async checkLogin() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        app.globalData.userInfo = userInfo;
        app.globalData.isLogin = true;
        return;
      }

      // 获取用户信息
      const { userInfo: newUserInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      app.globalData.userInfo = newUserInfo;
      app.globalData.isLogin = true;
      wx.setStorageSync('userInfo', newUserInfo);

    } catch (error) {
      console.log('用户取消授权或授权失败');
    }
  },

  // 加载用户信息
  loadUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo || {},
      userLevel: this.calculateUserLevel()
    });
  },

  // 计算用户等级
  calculateUserLevel() {
    const totalReviews = app.globalData.stats.totalReviews;
    if (totalReviews < 10) return 1;
    if (totalReviews < 30) return 2;
    if (totalReviews < 60) return 3;
    if (totalReviews < 100) return 4;
    return 5;
  },

  // 加载数据
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      await Promise.all([
        this.loadStats(),
        this.loadRecentReviews(),
        this.loadTodayReminder(),
        this.loadDailyQuote()
      ]);
    } catch (error) {
      console.error('数据加载失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const db = wx.cloud.database();
      
      // 获取总复盘数
      const { total } = await db.collection('reviews').where({
        _openid: '{openid}'
      }).count();

      // 计算连续天数
      const continuousDays = await this.calculateContinuousDays();
      
      // 计算完成率
      const completionRate = await this.calculateCompletionRate();

      // 计算本周进度
      const weekProgress = await this.calculateWeekProgress();

      this.setData({
        'stats.continuousDays': continuousDays,
        'stats.completionRate': completionRate,
        weekProgress
      });

      // 更新全局数据
      app.globalData.stats = {
        totalReviews: total,
        continuousDays,
        completionRate
      };

    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 计算连续天数
  async calculateContinuousDays() {
    try {
      const db = wx.cloud.database();
      const now = new Date();
      let continuousDays = 0;
      
      // 从今天开始往前查找
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
        
        const { total } = await db.collection('reviews').where({
          _openid: '{openid}',
          createTime: db.command.gte(startOfDay).and(db.command.lte(endOfDay))
        }).count();
        
        if (total > 0) {
          continuousDays++;
        } else {
          break;
        }
      }
      
      return continuousDays;
    } catch (error) {
      console.error('计算连续天数失败:', error);
      return 0;
    }
  },

  // 计算完成率
  async calculateCompletionRate() {
    // 这里可以根据具体业务逻辑计算完成率
    // 比如：本月应该复盘的天数 vs 实际复盘的天数
    return 87; // 示例数据
  },

  // 计算本周进度
  async calculateWeekProgress() {
    try {
      const db = wx.cloud.database();
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { total } = await db.collection('reviews').where({
        _openid: '{openid}',
        createTime: db.command.gte(startOfWeek)
      }).count();
      
      const completed = total;
      const totalDays = 7;
      const percentage = Math.round((completed / totalDays) * 100);
      
      return {
        completed,
        total: totalDays,
        percentage
      };
    } catch (error) {
      console.error('计算本周进度失败:', error);
      return { completed: 0, total: 7, percentage: 0 };
    }
  },

  // 加载最近复盘
  async loadRecentReviews() {
    try {
      const db = wx.cloud.database();
      const { data } = await db.collection('reviews')
        .where({
          _openid: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .limit(3)
        .get();

      const recentReviews = data.map(item => ({
        id: item._id,
        title: item.title,
        preview: this.getPreview(item.content),
        timeAgo: this.getTimeAgo(item.createTime),
        tags: item.tags || []
      }));

      this.setData({ recentReviews });
    } catch (error) {
      console.error('加载最近复盘失败:', error);
    }
  },

  // 获取预览文本
  getPreview(content) {
    if (!content) return '暂无内容';
    
    // 提取主要内容的前50个字符
    let preview = '';
    if (content.highlights) {
      preview = content.highlights.substring(0, 50);
    } else if (content.improvements) {
      preview = content.improvements.substring(0, 50);
    } else if (content.learnings) {
      preview = content.learnings.substring(0, 50);
    }
    
    return preview + (preview.length >= 50 ? '...' : '');
  },

  // 获取相对时间
  getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return past.toLocaleDateString();
    }
  },

  // 加载今日提醒
  async loadTodayReminder() {
    // 这里可以根据用户的复盘习惯生成个性化提醒
    const reminders = [
      '今天还没有进行复盘，记录一下今天的收获吧',
      '坚持复盘第{{days}}天，继续保持！',
      '回顾今天的目标完成情况如何？',
      '今天学到了什么新知识？',
      '有什么地方可以改进的吗？'
    ];
    
    const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
    this.setData({
      todayReminder: randomReminder.replace('{{days}}', this.data.stats.continuousDays)
    });
  },

  // 加载每日一句
  async loadDailyQuote() {
    const quotes = [
      { content: '每日三省吾身，不断成长进步', author: '灵狐复盘' },
      { content: '反思是成长的阶梯', author: '灵狐复盘' },
      { content: '今日的反思，是明日的智慧', author: '灵狐复盘' },
      { content: '复盘不是为了后悔，而是为了更好', author: '灵狐复盘' },
      { content: '每一次复盘，都是一次成长的机会', author: '灵狐复盘' }
    ];
    
    const today = new Date().getDate();
    const todayQuote = quotes[today % quotes.length];
    
    this.setData({ dailyQuote: todayQuote });
  },

  // 刷新数据
  async refreshData() {
    await this.loadData();
  },

  // 事件处理
  onNotificationTap() {
    wx.showToast({
      title: '暂无新通知',
      icon: 'none'
    });
  },

  onCreateReview() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  onViewStats() {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    });
  },

  onViewHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  onViewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 错误处理
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.refreshData();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      this.showError('刷新失败');
    } finally {
      wx.stopPullDownRefresh();
    }
  }
});

