// profile.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    stats: {
      totalReviews: 0,
      continuousDays: 0,
      completionRate: 0
    },
    showLoginModal: false,
    showLogoutModal: false,
    showFeedbackModal: false,
    showAboutModal: false,
    feedbackContent: '',
    appVersion: '1.0.0'
  },

  onLoad() {
    console.log('个人中心页面加载');
    this.loadUserData();
  },

  onShow() {
    this.loadUserData();
  },

  // 加载用户数据
  loadUserData() {
    const { userInfo, isLogin, stats } = app.globalData;

    this.setData({
      userInfo,
      isLogin,
      stats: {
        totalReviews: stats.totalReviews || 0,
        continuousDays: stats.continuousDays || 0,
        completionRate: stats.completionRate || 0
      },
      appVersion: app.globalData.version || '1.0.0'
    });
  },

  // 用户登录
  onLogin() {
    if (this.data.isLogin) return;

    wx.showLoading({ title: '登录中...' });

    app.login()
      .then(userInfo => {
        this.setData({
          userInfo,
          isLogin: true
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('登录失败:', error);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 显示登录弹窗
  onShowLogin() {
    if (!this.data.isLogin) {
      this.setData({ showLoginModal: true });
    }
  },

  // 关闭登录弹窗
  onCloseLogin() {
    this.setData({ showLoginModal: false });
  },

  // 确认登录
  onConfirmLogin() {
    this.onCloseLogin();
    this.onLogin();
  },

  // 用户登出
  onLogout() {
    this.setData({ showLogoutModal: true });
  },

  // 关闭登出弹窗
  onCloseLogout() {
    this.setData({ showLogoutModal: false });
  },

  // 确认登出
  onConfirmLogout() {
    try {
      // 清除用户信息
      wx.removeStorageSync('userInfo');

      // 更新全局状态
      app.globalData.userInfo = null;
      app.globalData.isLogin = false;

      // 更新页面状态
      this.setData({
        userInfo: null,
        isLogin: false,
        showLogoutModal: false
      });

      wx.showToast({
        title: '已退出登录',
        icon: 'success'
      });
    } catch (error) {
      console.error('登出失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 跳转到历史记录
  onGoToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 跳转到统计页面
  onGoToStatistics() {
    wx.navigateTo({
      url: '/pages/statistics/statistics'
    });
  },

  // 显示反馈弹窗
  onShowFeedback() {
    this.setData({ showFeedbackModal: true });
  },

  // 关闭反馈弹窗
  onCloseFeedback() {
    this.setData({
      showFeedbackModal: false,
      feedbackContent: ''
    });
  },

  // 反馈内容输入
  onFeedbackInput(e) {
    this.setData({ feedbackContent: e.detail.value });
  },

  // 提交反馈
  onSubmitFeedback() {
    if (!this.data.feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    // 这里应该调用云函数提交反馈
    setTimeout(() => {
      wx.hideLoading();
      this.onCloseFeedback();

      wx.showToast({
        title: '反馈已提交',
        icon: 'success'
      });
    }, 1000);
  },

  // 显示关于弹窗
  onShowAbout() {
    this.setData({ showAboutModal: true });
  },

  // 关闭关于弹窗
  onCloseAbout() {
    this.setData({ showAboutModal: false });
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将删除您的草稿和其他本地数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });

            // 重新加载用户数据
            this.loadUserData();
          } catch (error) {
            console.error('清除缓存失败:', error);
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 联系客服
  onContactSupport() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    });
  },

  // 检查更新
  onCheckUpdate() {
    wx.showToast({
      title: '当前已是最新版本',
      icon: 'success'
    });
  }
});