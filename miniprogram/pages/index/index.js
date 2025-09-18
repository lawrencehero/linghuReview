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
    this.initPage();
  },

  onShow() {
    this.refreshData();
  },

  // 初始化页面
  async initPage() {
    try {
      // 加载用户信息
      this.loadUserInfo();

      // 加载数据
      await this.loadData();

    } catch (error) {
      this.showError('页面加载失败，请稍后重试');
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
    const totalReviews = app.globalData.stats.totalReviews || 0;
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
      // 获取全局统计数据
      const stats = app.globalData.stats || {};

      this.setData({
        'stats.continuousDays': stats.continuousDays || 0,
        'stats.completionRate': stats.completionRate || 0
      });

      // 计算本周进度
      const weekProgress = await this.calculateWeekProgress();

      this.setData({ weekProgress });

    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 计算本周进度
  async calculateWeekProgress() {
    try {
      const completed = app.globalData.stats.totalReviews || 0;
      const total = 7;
      const percentage = Math.round((completed / total) * 100);

      return {
        completed,
        total,
        percentage: isNaN(percentage) ? 0 : percentage
      };
    } catch (error) {
      console.error('计算本周进度失败:', error);
      return { completed: 0, total: 7, percentage: 0 };
    }
  },

  // 加载最近复盘
  async loadRecentReviews() {
    try {
      // 使用模拟数据
      const recentReviews = [
        {
          id: '1',
          title: '今日工作复盘',
          preview: '今天完成了项目的主要功能开发，遇到了一些技术难点...',
          timeAgo: '2小时前',
          tags: ['工作', '技术']
        },
        {
          id: '2',
          title: '学习心得分享',
          preview: '学习了新的前端框架，感觉非常实用，可以提升开发效率...',
          timeAgo: '1天前',
          tags: ['学习', '前端']
        }
      ];

      this.setData({ recentReviews });
    } catch (error) {
      console.error('加载最近复盘失败:', error);
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
    const continuousDays = this.data.stats.continuousDays || 0;
    this.setData({
      todayReminder: randomReminder.replace('{{days}}', continuousDays)
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