# 数据库结构说明

## users 集合
存储用户信息

### 字段说明
- `_id`: 用户ID (自动生成)
- `openid`: 微信openid
- `appId`: 微信appId
- `nickName`: 用户昵称
- `avatarUrl`: 用户头像
- `gender`: 性别 (0:未知, 1:男, 2:女)
- `country`: 国家
- `province`: 省份
- `city`: 城市
- `language`: 语言
- `createTime`: 创建时间
- `updateTime`: 更新时间
- `lastLoginTime`: 最后登录时间

## reviews 集合
存储复盘记录

### 字段说明
- `_id`: 记录ID (自动生成)
- `_openid`: 用户openid
- `title`: 复盘标题
- `content`: 复盘内容
  - `highlights`: 亮点
  - `challenges`: 挑战
  - `learnings`: 收获
  - `improvements`: 改进
- `type`: 复盘类型 (daily, weekly, monthly, project)
- `tags`: 标签数组
- `moodScore`: 心情评分 (1-5)
- `createTime`: 创建时间
- `updateTime`: 更新时间