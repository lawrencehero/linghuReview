// create.js
const app = getApp();

Page({
  data: {
    reviewType: 'daily',
    title: '',
    content: {
      highlights: '',
      challenges: '',
      learnings: '',
      improvements: ''
    },
    selectedTags: [],
    customTag: '',
    moodScore: 3,
    canSave: false,
    showTemplates: false,
    showTemplateModal: false,
    
    // 预设标签
    presetTags: [
      '工作', '学习', '生活', '健康', '技术', '管理', 
      '沟通', '效率', '创新', '反思', '目标', '成长'
    ],
    
    // 模板数据
    templates: [
      {
        id: 1,
        name: '每日复盘模板',
        description: '适合日常工作生活复盘',
        sections: ['今日亮点', '遇到问题', '学习收获', '明日计划']
      },
      {
        id: 2,
        name: '项目复盘模板',
        description: '适合项目结束后的总结',
        sections: ['项目成果', '问题分析', '经验总结', '改进建议']
      }
    ],
    
    allTemplates: []
  },

  onLoad(options) {
    console.log('创建复盘页面加载');
    
    // 如果有传入的类型，设置默认类型
    if (options.type) {
      this.setData({ reviewType: options.type });
    }
    
    // 加载草稿
    this.loadDraft();
    
    // 加载模板
    this.loadTemplates();
  },

  onShow() {
    // 检查是否可以保存
    this.checkCanSave();
  },

  // 加载草稿
  loadDraft() {
    try {
      const draft = wx.getStorageSync('reviewDraft');
      if (draft) {
        this.setData({
          title: draft.title || '',
          content: draft.content || {
            highlights: '',
            challenges: '',
            learnings: '',
            improvements: ''
          },
          selectedTags: draft.selectedTags || [],
          moodScore: draft.moodScore || 3,
          reviewType: draft.reviewType || 'daily'
        });
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  },

  // 加载模板
  async loadTemplates() {
    try {
      // 这里可以从云数据库加载更多模板
      const allTemplates = [
        {
          id: 1,
          name: '每日复盘',
          description: '记录每天的工作和生活',
          sections: ['今日亮点', '遇到问题', '学习收获', '明日计划'],
          content: {
            highlights: '今天完成了...',
            challenges: '遇到的主要问题是...',
            learnings: '学到了...',
            improvements: '明天要改进...'
          }
        },
        {
          id: 2,
          name: '项目复盘',
          description: '项目结束后的深度总结',
          sections: ['项目成果', '问题分析', '经验总结', '改进建议'],
          content: {
            highlights: '项目取得的主要成果...',
            challenges: '项目中遇到的主要问题...',
            learnings: '从项目中学到的经验...',
            improvements: '下次项目的改进建议...'
          }
        },
        {
          id: 3,
          name: '学习复盘',
          description: '学习过程的反思总结',
          sections: ['学习内容', '理解难点', '知识收获', '应用计划'],
          content: {
            highlights: '今天学习的主要内容...',
            challenges: '学习中的难点和困惑...',
            learnings: '掌握的新知识和技能...',
            improvements: '如何应用和深化学习...'
          }
        }
      ];
      
      this.setData({ allTemplates });
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  },

  // 检查是否可以保存
  checkCanSave() {
    const { title, content } = this.data;
    const hasContent = title.trim() || 
                      content.highlights.trim() || 
                      content.challenges.trim() || 
                      content.learnings.trim() || 
                      content.improvements.trim();
    
    this.setData({ canSave: hasContent });
  },

  // 事件处理
  onBack() {
    // 检查是否有未保存的内容
    if (this.data.canSave) {
      wx.showModal({
        title: '提示',
        content: '当前有未保存的内容，是否保存为草稿？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            this.saveDraft();
          }
          wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  onTypeChange(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ reviewType: type });
    this.saveDraft();
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
    this.checkCanSave();
    this.saveDraft();
  },

  onContentInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`content.${field}`]: value
    });
    
    this.checkCanSave();
    this.saveDraft();
  },

  onTagToggle(e) {
    const { tag } = e.currentTarget.dataset;
    const { selectedTags } = this.data;
    
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    
    this.setData({ selectedTags: newTags });
    this.saveDraft();
  },

  onCustomTagInput(e) {
    this.setData({ customTag: e.detail.value });
  },

  onAddCustomTag() {
    const { customTag, selectedTags } = this.data;
    const trimmedTag = customTag.trim();
    
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      this.setData({
        selectedTags: [...selectedTags, trimmedTag],
        customTag: ''
      });
      this.saveDraft();
    }
  },

  onRemoveTag(e) {
    const { tag } = e.currentTarget.dataset;
    const newTags = this.data.selectedTags.filter(t => t !== tag);
    this.setData({ selectedTags: newTags });
    this.saveDraft();
  },

  onMoodChange(e) {
    this.setData({ moodScore: e.detail.value });
    this.saveDraft();
  },

  onToggleTemplates() {
    this.setData({ showTemplates: !this.data.showTemplates });
  },

  onSelectTemplate(e) {
    this.setData({ showTemplateModal: true });
  },

  onCloseTemplateModal() {
    this.setData({ showTemplateModal: false });
  },

  onApplyTemplate(e) {
    const { template } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '应用模板',
      content: `确定要应用"${template.name}"模板吗？这将覆盖当前内容。`,
      success: (res) => {
        if (res.confirm) {
          this.setData({
            content: template.content,
            showTemplateModal: false
          });
          this.checkCanSave();
          this.saveDraft();
        }
      }
    });
  },

  // 保存草稿
  saveDraft() {
    try {
      const draft = {
        title: this.data.title,
        content: this.data.content,
        selectedTags: this.data.selectedTags,
        moodScore: this.data.moodScore,
        reviewType: this.data.reviewType,
        updateTime: new Date()
      };
      
      wx.setStorageSync('reviewDraft', draft);
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  },

  // 保存草稿按钮
  onSaveDraft() {
    this.saveDraft();
    wx.showToast({
      title: '草稿已保存',
      icon: 'success'
    });
  },

  // 保存复盘
  async onSave() {
    if (!this.data.canSave) {
      wx.showToast({
        title: '请填写内容后再保存',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const reviewData = {
        title: this.data.title || this.getDefaultTitle(),
        content: this.data.content,
        type: this.data.reviewType,
        tags: this.data.selectedTags,
        moodScore: this.data.moodScore,
        createTime: new Date(),
        updateTime: new Date()
      };

      // 保存到云数据库
      const db = wx.cloud.database();
      const result = await db.collection('reviews').add({
        data: reviewData
      });

      console.log('复盘保存成功:', result);

      // 清除草稿
      wx.removeStorageSync('reviewDraft');

      // 更新全局统计数据
      const app = getApp();
      app.globalData.stats.totalReviews = (app.globalData.stats.totalReviews || 0) + 1;

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存复盘失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取默认标题
  getDefaultTitle() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    const typeMap = {
      daily: '每日复盘',
      weekly: '每周复盘',
      monthly: '每月复盘',
      project: '项目复盘'
    };
    
    return `${dateStr} ${typeMap[this.data.reviewType]}`;
  },

  // 页面卸载时保存草稿
  onUnload() {
    if (this.data.canSave) {
      this.saveDraft();
    }
  }
});

