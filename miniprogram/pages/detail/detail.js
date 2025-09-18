// detail.js
const app = getApp();

Page({
  data: {
    reviewId: '',
    review: {
      id: '1',
      title: '今日工作复盘',
      type: 'daily',
      typeText: '每日复盘',
      tags: ['工作', '技术'],
      moodScore: 4,
      moodEmoji: '😊',
      createTime: new Date(),
      updateTime: new Date(),
      createTimeFormatted: '2023-08-15 14:30:25',
      updateTimeFormatted: '2023-08-15 14:30:25',
      content: {
        highlights: '今天完成了项目的主要功能开发，解决了几个技术难点，团队协作也很顺利。',
        challenges: '在处理数据同步时遇到了一些性能问题，需要进一步优化。',
        learnings: '学习了新的前端框架特性，可以提升开发效率。',
        improvements: '明天需要优化数据处理逻辑，提升系统性能。'
      }
    },
    loading: false,
    showActionSheet: false,
    showEditModal: false,
    showDeleteModal: false
  },

  onLoad(options) {
    console.log('复盘详情页面加载');
    if (options.id) {
      this.setData({ reviewId: options.id });
      // 使用模拟数据而不是从云数据库加载
      console.log('加载复盘详情 ID:', options.id);
    }
  },

  onShow() {
    console.log('复盘详情页面显示');
  },

  // 显示操作菜单
  onShowActions() {
    console.log('显示操作菜单');
    this.setData({ showActionSheet: true });
  },

  // 关闭操作菜单
  onCloseActions() {
    console.log('关闭操作菜单');
    this.setData({ showActionSheet: false });
  },

  // 处理操作菜单点击
  onActionSelect(e) {
    const { action } = e.currentTarget.dataset;
    console.log('选择操作', action);

    switch (action) {
      case 'edit':
        this.onEdit();
        break;
      case 'delete':
        this.onDelete();
        break;
      case 'share':
        this.onShare();
        break;
    }

    this.setData({ showActionSheet: false });
  },

  // 编辑复盘
  onEdit() {
    console.log('编辑复盘');
    wx.navigateTo({
      url: `/pages/create/create?id=${this.data.reviewId}`
    });
  },

  // 删除复盘
  onDelete() {
    console.log('删除复盘');
    this.setData({ showDeleteModal: true });
  },

  // 关闭删除确认框
  onCloseDeleteModal() {
    console.log('关闭删除确认框');
    this.setData({ showDeleteModal: false });
  },

  // 确认删除
  onConfirmDelete() {
    console.log('确认删除');
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);

    this.setData({ showDeleteModal: false });
  },

  // 分享复盘
  onShare() {
    console.log('分享复盘');
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 复制内容
  onCopyContent() {
    console.log('复制内容');
    wx.showToast({
      title: '已复制到剪贴板',
      icon: 'success'
    });
  }
});