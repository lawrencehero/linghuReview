// history.js
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    timeFilter: 'all',
    activeFilters: [],
    sortOrder: 'desc', // desc: 最新优先, asc: 最旧优先
    
    // 列表数据
    allReviews: [],
    filteredReviews: [],
    displayReviews: [],
    
    // 分页
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    
    // 筛选弹窗
    showFilterModal: false,
    typeFilters: [],
    tagFilters: [],
    moodFilter: 'all',
    
    // 选项数据
    reviewTypes: [
      { value: 'daily', label: '每日复盘' },
      { value: 'weekly', label: '每周复盘' },
      { value: 'monthly', label: '每月复盘' },
      { value: 'project', label: '项目复盘' }
    ],
    
    allTags: [],
    
    moodOptions: [
      { value: 'all', emoji: '😊', label: '全部' },
      { value: '1', emoji: '😢', label: '很差' },
      { value: '2', emoji: '😕', label: '较差' },
      { value: '3', emoji: '😐', label: '一般' },
      { value: '4', emoji: '😊', label: '较好' },
      { value: '5', emoji: '🤩', label: '很好' }
    ]
  },

  onLoad() {
    console.log('历史记录页面加载');
    this.loadReviews();
  },

  onShow() {
    // 刷新数据，可能有新增或修改的记录
    this.loadReviews();
  },

  // 加载复盘记录
  async loadReviews() {
    wx.showLoading({ title: '加载中...' });

    try {
      const db = wx.cloud.database();
      const { data } = await db.collection('reviews')
        .where({
          _openid: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .get();

      // 处理数据
      const processedReviews = data.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content,
        type: item.type,
        typeText: this.getTypeText(item.type),
        tags: item.tags || [],
        moodScore: item.moodScore || 3,
        moodEmoji: this.getMoodEmoji(item.moodScore),
        createTime: item.createTime,
        timeAgo: this.getTimeAgo(item.createTime),

        // 内容预览
        highlights: this.getPreview(item.content?.highlights),
        challenges: this.getPreview(item.content?.challenges),
        learnings: this.getPreview(item.content?.learnings),
        improvements: this.getPreview(item.content?.improvements)
      }));

      // 提取所有标签
      const allTags = [...new Set(processedReviews.flatMap(item => item.tags))];

      this.setData({
        allReviews: processedReviews,
        allTags
      });

      // 应用筛选
      this.applyFilters();

    } catch (error) {
      console.error('加载复盘记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
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

  // 获取内容预览
  getPreview(content, maxLength = 50) {
    if (!content) return '';
    return content.length > maxLength ? 
           content.substring(0, maxLength) + '...' : 
           content;
  },

  // 获取相对时间
  getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else if (weeks < 4) {
      return `${weeks}周前`;
    } else if (months < 12) {
      return `${months}个月前`;
    } else {
      return past.toLocaleDateString();
    }
  },

  // 应用筛选
  applyFilters() {
    let filtered = [...this.data.allReviews];

    // 搜索关键词筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        (item.content.highlights && item.content.highlights.toLowerCase().includes(keyword)) ||
        (item.content.challenges && item.content.challenges.toLowerCase().includes(keyword)) ||
        (item.content.learnings && item.content.learnings.toLowerCase().includes(keyword)) ||
        (item.content.improvements && item.content.improvements.toLowerCase().includes(keyword)) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }

    // 时间筛选
    if (this.data.timeFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (this.data.timeFilter) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
      }
      
      if (startDate) {
        filtered = filtered.filter(item => new Date(item.createTime) >= startDate);
      }
    }

    // 类型筛选
    if (this.data.typeFilters.length > 0) {
      filtered = filtered.filter(item => this.data.typeFilters.includes(item.type));
    }

    // 标签筛选
    if (this.data.tagFilters.length > 0) {
      filtered = filtered.filter(item => 
        this.data.tagFilters.some(tag => item.tags.includes(tag))
      );
    }

    // 心情筛选
    if (this.data.moodFilter !== 'all') {
      filtered = filtered.filter(item => item.moodScore === parseInt(this.data.moodFilter));
    }

    // 排序
    filtered.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      return this.data.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    this.setData({ filteredReviews: filtered });
    this.updateDisplayReviews();
  },
  // 更新显示的记录
  updateDisplayReviews() {
    const startIndex = 0;
    const endIndex = this.data.currentPage * this.data.pageSize;
    const displayReviews = this.data.filteredReviews.slice(startIndex, endIndex);
    
    this.setData({
      displayReviews,
      hasMore: endIndex < this.data.filteredReviews.length
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    
    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.resetPagination();
      this.applyFilters();
    }, 500);
  },

  // 搜索确认
  onSearch() {
    this.resetPagination();
    this.applyFilters();
  },

  // 时间筛选
  onTimeFilter(e) {
    const { filter } = e.currentTarget.dataset;
    this.setData({ timeFilter: filter });
    this.resetPagination();
    this.applyFilters();
  },

  // 切换排序
  onToggleSort() {
    const newOrder = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
    this.setData({ sortOrder: newOrder });
    this.resetPagination();
    this.applyFilters();
  },

  // 显示筛选弹窗
  onShowFilter() {
    this.setData({ showFilterModal: true });
  },

  // 关闭筛选弹窗
  onCloseFilter() {
    this.setData({ showFilterModal: false });
  },

  // 切换类型筛选
  onToggleTypeFilter(e) {
    const { type } = e.currentTarget.dataset;
    const { typeFilters } = this.data;
    
    let newFilters;
    if (typeFilters.includes(type)) {
      newFilters = typeFilters.filter(t => t !== type);
    } else {
      newFilters = [...typeFilters, type];
    }
    
    this.setData({ typeFilters: newFilters });
  },

  // 切换标签筛选
  onToggleTagFilter(e) {
    const { tag } = e.currentTarget.dataset;
    const { tagFilters } = this.data;
    
    let newFilters;
    if (tagFilters.includes(tag)) {
      newFilters = tagFilters.filter(t => t !== tag);
    } else {
      newFilters = [...tagFilters, tag];
    }
    
    this.setData({ tagFilters: newFilters });
  },

  // 心情筛选
  onMoodFilter(e) {
    const { mood } = e.currentTarget.dataset;
    this.setData({ moodFilter: mood });
  },

  // 重置筛选
  onResetFilter() {
    this.setData({
      typeFilters: [],
      tagFilters: [],
      moodFilter: 'all',
      activeFilters: []
    });
  },

  // 应用筛选
  onApplyFilter() {
    // 生成活跃筛选标签
    const activeFilters = [];
    
    // 添加类型筛选标签
    this.data.typeFilters.forEach(type => {
      const typeObj = this.data.reviewTypes.find(t => t.value === type);
      if (typeObj) {
        activeFilters.push(typeObj.label);
      }
    });
    
    // 添加标签筛选
    activeFilters.push(...this.data.tagFilters);
    
    // 添加心情筛选
    if (this.data.moodFilter !== 'all') {
      const moodObj = this.data.moodOptions.find(m => m.value === this.data.moodFilter);
      if (moodObj) {
        activeFilters.push(`心情${moodObj.label}`);
      }
    }
    
    this.setData({ 
      activeFilters,
      showFilterModal: false 
    });
    
    this.resetPagination();
    this.applyFilters();
  },

  // 移除筛选条件
  onRemoveFilter(e) {
    const { filter } = e.currentTarget.dataset;
    
    // 从对应的筛选数组中移除
    const typeLabels = this.data.reviewTypes.map(t => t.label);
    if (typeLabels.includes(filter)) {
      const type = this.data.reviewTypes.find(t => t.label === filter);
      const newTypeFilters = this.data.typeFilters.filter(t => t !== type.value);
      this.setData({ typeFilters: newTypeFilters });
    } else if (this.data.allTags.includes(filter)) {
      const newTagFilters = this.data.tagFilters.filter(t => t !== filter);
      this.setData({ tagFilters: newTagFilters });
    } else if (filter.startsWith('心情')) {
      this.setData({ moodFilter: 'all' });
    }
    
    // 更新活跃筛选
    const newActiveFilters = this.data.activeFilters.filter(f => f !== filter);
    this.setData({ activeFilters: newActiveFilters });
    
    this.resetPagination();
    this.applyFilters();
  },

  // 清除所有筛选
  onClearFilters() {
    this.setData({
      typeFilters: [],
      tagFilters: [],
      moodFilter: 'all',
      activeFilters: []
    });
    
    this.resetPagination();
    this.applyFilters();
  },

  // 重置分页
  resetPagination() {
    this.setData({
      currentPage: 1,
      hasMore: true
    });
  },

  // 加载更多
  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ 
      loading: true,
      currentPage: this.data.currentPage + 1 
    });
    
    setTimeout(() => {
      this.updateDisplayReviews();
      this.setData({ loading: false });
    }, 500);
  },

  // 查看详情
  onViewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 编辑复盘
  onEditReview(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/create/create?id=${id}&mode=edit`
    });
  },

  // 删除复盘
  onDeleteReview(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条复盘记录吗？',
      confirmText: '删除',
      confirmColor: '#ff4757',
      success: async (res) => {
        if (res.confirm) {
          await this.deleteReview(id);
        }
      }
    });
  },

  // 执行删除
  async deleteReview(id) {
    wx.showLoading({ title: '删除中...' });
    
    try {
      const db = wx.cloud.database();
      await db.collection('reviews').doc(id).remove();
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 重新加载数据
      this.loadReviews();
      
      // 更新全局统计
      if (app.globalData.stats.totalReviews > 0) {
        app.globalData.stats.totalReviews--;
      }
      
    } catch (error) {
      console.error('删除复盘失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 创建新复盘
  onCreateReview() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  // 导航到首页
  onGoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.loadReviews();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  // 页面卸载时清除定时器
  onUnload() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }
});

