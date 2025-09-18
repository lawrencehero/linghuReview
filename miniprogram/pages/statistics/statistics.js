// statistics.js
const app = getApp();

Page({
  data: {
    // 统计数据
    totalReviews: 12,
    continuousDays: 5,
    completionRate: 87,

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
    typeDistribution: [
      { type: 'daily', name: '每日复盘', count: 8, percent: 67 },
      { type: 'weekly', name: '每周复盘', count: 3, percent: 25 },
      { type: 'monthly', name: '每月复盘', count: 1, percent: 8 },
      { type: 'project', name: '项目复盘', count: 0, percent: 0 }
    ],

    // 心情分布
    moodDistribution: [
      { score: 5, emoji: '🤩', count: 4, percent: 33 },
      { score: 4, emoji: '😊', count: 5, percent: 42 },
      { score: 3, emoji: '😐', count: 2, percent: 17 },
      { score: 2, emoji: '😕', count: 1, percent: 8 },
      { score: 1, emoji: '😢', count: 0, percent: 0 }
    ],

    // 标签云
    tagCloud: [
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
    ],

    // 加载状态
    loading: false,

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
    this.loadChartData();
  },

  onShow() {
    // 页面显示时刷新数据
    console.log('统计页面显示');
  },

  // 加载图表数据
  loadChartData() {
    console.log('加载图表数据');
    // 使用模拟数据
    const mockData = [
      { date: '08-01', count: 2 },
      { date: '08-02', count: 1 },
      { date: '08-03', count: 3 },
      { date: '08-04', count: 2 },
      { date: '08-05', count: 1 },
      { date: '08-06', count: 2 },
      { date: '08-07', count: 3 }
    ];

    this.setData({
      'chartData.daily': mockData
    });
  },

  // 时间范围切换
  onTimeRangeChange(e) {
    const { range } = e.currentTarget.dataset;
    console.log('切换时间范围', range);
    this.setData({ timeRange: range });
    this.loadChartData();
  },

  // 刷新数据
  onRefresh() {
    console.log('刷新统计数据');
    this.loadChartData();
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    });
  }
});