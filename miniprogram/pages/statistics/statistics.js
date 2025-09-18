// statistics.js
const app = getApp();

Page({
  data: {
    // 统计数据
    totalReviews: 0,
    continuousDays: 0,
    completionRate: 0,

    // 图表数据
    chartData: {
      daily: [],
      weekly: [],
      monthly: [],
      project: []
    },

    // 时间范围
    timeRange: 'month', // day, week, month, year

    // 类型分布
    typeDistribution: [],

    // 心情分布
    moodDistribution: [],

    // 标签云
    tagCloud: [],

    // 加载状态
    loading: true,

    // 图表配置
    chartOptions: {
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [],
        type: 'line',
        smooth: true
      }]
    }
  },

  onLoad() {
    console.log('统计页面加载');
    this.loadStatistics();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadStatistics();
  },

  // 加载统计数据
  async loadStatistics() {
    wx.showLoading({ title: '加载中...' });

    try {
      // 获取全局统计数据
      this.setData({
        totalReviews: app.globalData.stats.totalReviews || 0,
        continuousDays: app.globalData.stats.continuousDays || 0,
        completionRate: app.globalData.stats.completionRate || 0
      });

      // 加载详细统计数据
      await this.loadDetailedStats();

      // 加载图表数据
      await this.loadChartData();

      // 加载类型分布
      await this.loadTypeDistribution();

      // 加载心情分布
      await this.loadMoodDistribution();

      // 加载标签云
      await this.loadTagCloud();

    } catch (error) {
      console.error('加载统计数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 加载详细统计数据
  async loadDetailedStats() {
    try {
      const db = wx.cloud.database();

      // 获取最近7天的复盘数量
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentReviews = await db.collection('reviews')
        .where({
          createTime: db.command.gte(sevenDaysAgo)
        })
        .count();

      console.log('最近7天复盘数量:', recentReviews);

    } catch (error) {
      console.error('加载详细统计数据失败:', error);
    }
  },

  // 加载图表数据
  async loadChartData() {
    try {
      const db = wx.cloud.database();
      const now = new Date();

      // 根据时间范围生成数据
      let startDate, endDate, interval, format;

      switch (this.data.timeRange) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          interval = 'day';
          format = 'MM-DD';
          break;
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3);
          interval = 'week';
          format = 'MM-DD';
          break;
        case 'month':
          startDate = new Date(now.getFullYear() - 1, now.getMonth());
          interval = 'month';
          format = 'YYYY-MM';
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 5, 0);
          interval = 'year';
          format = 'YYYY';
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1);
          interval = 'day';
          format = 'MM-DD';
      }

      // 这里应该从数据库查询实际数据
      // 暂时使用模拟数据
      const mockData = this.generateMockChartData(startDate, now, interval);

      this.setData({
        'chartData.daily': mockData
      });

    } catch (error) {
      console.error('加载图表数据失败:', error);
    }
  },

  // 生成模拟图表数据
  generateMockChartData(startDate, endDate, interval) {
    const data = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      data.push({
        date: this.formatDate(current, interval),
        count: Math.floor(Math.random() * 10) + 1
      });

      // 根据间隔递增日期
      switch (interval) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    return data;
  },

  // 格式化日期
  formatDate(date, type) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (type) {
      case 'day':
      case 'week':
        return `${month}-${day}`;
      case 'month':
        return `${year}-${month}`;
      case 'year':
        return `${year}`;
      default:
        return `${month}-${day}`;
    }
  },

  // 加载类型分布
  async loadTypeDistribution() {
    try {
      // 模拟数据
      const typeDistribution = [
        { type: 'daily', name: '每日复盘', count: 45, percent: 45 },
        { type: 'weekly', name: '每周复盘', count: 25, percent: 25 },
        { type: 'monthly', name: '每月复盘', count: 20, percent: 20 },
        { type: 'project', name: '项目复盘', count: 10, percent: 10 }
      ];

      this.setData({ typeDistribution });

    } catch (error) {
      console.error('加载类型分布失败:', error);
    }
  },

  // 加载心情分布
  async loadMoodDistribution() {
    try {
      // 模拟数据
      const moodDistribution = [
        { score: 5, emoji: '🤩', count: 30, percent: 30 },
        { score: 4, emoji: '😊', count: 40, percent: 40 },
        { score: 3, emoji: '😐', count: 20, percent: 20 },
        { score: 2, emoji: '😕', count: 8, percent: 8 },
        { score: 1, emoji: '😢', count: 2, percent: 2 }
      ];

      this.setData({ moodDistribution });

    } catch (error) {
      console.error('加载心情分布失败:', error);
    }
  },

  // 加载标签云
  async loadTagCloud() {
    try {
      // 模拟数据
      const tagCloud = [
        { name: '工作', count: 25, size: 32 },
        { name: '学习', count: 22, size: 30 },
        { name: '生活', count: 18, size: 28 },
        { name: '技术', count: 15, size: 26 },
        { name: '效率', count: 12, size: 24 },
        { name: '成长', count: 10, size: 22 },
        { name: '健康', count: 8, size: 20 },
        { name: '沟通', count: 7, size: 19 },
        { name: '反思', count: 6, size: 18 },
        { name: '目标', count: 5, size: 17 }
      ];

      this.setData({ tagCloud });

    } catch (error) {
      console.error('加载标签云失败:', error);
    }
  },

  // 时间范围切换
  onTimeRangeChange(e) {
    const { range } = e.currentTarget.dataset;
    this.setData({ timeRange: range });
    this.loadChartData();
  },

  // 刷新数据
  onRefresh() {
    this.loadStatistics();
  }
});