// detail.js
const app = getApp();

Page({
  data: {
    reviewId: '',
    review: null,
    loading: true,
    showActionSheet: false,
    showEditModal: false,
    showDeleteModal: false
  },

  onLoad(options) {
    console.log('复盘详情页面加载');
    if (options.id) {
      this.setData({ reviewId: options.id });
      this.loadReview(options.id);
    }
  },

  onShow() {
    // 如果是从编辑页面返回，重新加载数据
    const needRefresh = wx.getStorageSync('needRefreshDetail');
    if (needRefresh) {
      this.loadReview(this.data.reviewId);
      wx.removeStorageSync('needRefreshDetail');
    }
  },

  // 加载复盘详情
  async loadReview(id) {
    wx.showLoading({ title: '加载中...' });

    try {
      const db = wx.cloud.database();
      const result = await db.collection('reviews').doc(id).get();

      if (result.data) {
        const review = {
          ...result.data,
          createTimeFormatted: this.formatDate(result.data.createTime),
          updateTimeFormatted: this.formatDate(result.data.updateTime),
          moodEmoji: this.getMoodEmoji(result.data.moodScore),
          typeText: this.getTypeText(result.data.type)
        };

        this.setData({ review });
      }
    } catch (error) {
      console.error('加载复盘详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('zh-CN');
  },

  // 获取类型文本
  getTypeText(type) {
    const typeMap = {
      daily: '每日复盘',
      weekly: '每周复盘',
      monthly: '每月复盘',
      project: '项目复盘'
    };
    return typeMap[type] || '复盘';
  },

  // 获取心情表情
  getMoodEmoji(score) {
    const emojiMap = {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '🤩'
    };
    return emojiMap[score] || '😐';
  },

  // 显示操作菜单
  onShowActions() {
    this.setData({ showActionSheet: true });
  },

  // 关闭操作菜单
  onCloseActions() {
    this.setData({ showActionSheet: false });
  },

  // 处理操作菜单点击
  onActionSelect(e) {
    const { action } = e.currentTarget.dataset;

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
    wx.navigateTo({
      url: `/pages/create/create?id=${this.data.reviewId}`
    });
  },

  // 删除复盘
  onDelete() {
    this.setData({ showDeleteModal: true });
  },

  // 关闭删除确认框
  onCloseDeleteModal() {
    this.setData({ showDeleteModal: false });
  },

  // 确认删除
  async onConfirmDelete() {
    wx.showLoading({ title: '删除中...' });

    try {
      const db = wx.cloud.database();
      await db.collection('reviews').doc(this.data.reviewId).remove();

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      // 更新全局统计数据
      app.globalData.stats.totalReviews = Math.max(0, app.globalData.stats.totalReviews - 1);

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('删除失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.setData({ showDeleteModal: false });
    }
  },

  // 分享复盘
  onShare() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 复制内容
  onCopyContent() {
    const { review } = this.data;
    if (!review) return;

    const content = `
标题：${review.title}
类型：${this.getTypeText(review.type)}
心情：${this.getMoodEmoji(review.moodScore)}

亮点：
${review.content.highlights || '无'}

挑战：
${review.content.challenges || '无'}

收获：
${review.content.learnings || '无'}

改进：
${review.content.improvements || '无'}

标签：${review.tags ? review.tags.join(', ') : '无'}
创建时间：${this.formatDate(review.createTime)}
    `;

    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  }
});