# 项目导入说明

## 正确的导入方式

在微信开发者工具中导入项目时，请注意以下几点：

1. **选择正确的目录**：请选择 `miniprogram` 目录作为项目根目录，而不是项目根目录
2. **项目配置**：确保在开发者工具中正确配置了云开发环境

## 项目结构

```
linghuReview/                  # 项目根目录
├── cloudfunctions/            # 云函数目录
│   ├── login/                 # 登录云函数
│   └── reviews/               # 复盘记录云函数
├── miniprogram/               # 小程序代码目录（开发者工具应导入此目录）
│   ├── pages/                 # 页面目录
│   ├── utils/                 # 工具类目录
│   ├── app.js                 # 应用入口文件
│   ├── app.json               # 应用配置文件
│   ├── app.wxss               # 应用样式文件
│   └── sitemap.json           # 站点地图配置
├── project.config.json        # 项目配置文件
└── README.md                  # 项目说明文件
```

## 常见问题解决

如果遇到 "在项目根目录未找到 app.json" 错误，请检查：

1. 确认在微信开发者工具中选择的是 `miniprogram` 目录
2. 确认 `miniprogram/app.json` 文件存在且格式正确
3. 重启微信开发者工具后重新导入项目