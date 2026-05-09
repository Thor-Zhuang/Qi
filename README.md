# 抖音小游戏 - AI 开发项目

Cocos Creator 3.8 + AI 辅助开发的抖音小游戏项目。

## 项目结构

```
douyin-mini-game/
├── assets/
│   ├── scripts/        # TypeScript 游戏脚本
│   ├── scenes/         # 场景文件
│   ├── textures/       # 图片资源
│   ├── audio/          # 音效资源
│   └── prefabs/        # 预制体
├── extensions/         # 编辑器扩展（MCP 插件放这里）
├── settings/           # 项目设置
└── package.json        # 项目配置
```

## 开发流程

1. 在服务器上用 AI 编写代码
2. 推送到 GitHub
3. 本地拉取，用 Cocos Creator 3.8.6+ 打开
4. 在编辑器中关联脚本和场景
5. 构建发布为抖音小游戏

## 本地环境要求

- Cocos Creator 3.8.6+
- 抖音开发者工具 >= 2.0.6
- 调试基础库 >= 1.88.0

## 已实现的脚本

| 脚本 | 说明 |
|------|------|
| GameManager.ts | 游戏主控制器，状态管理 |
| UIManager.ts | UI 管理器，面板切换 |
| DouyinAdapter.ts | 抖音平台适配（登录/分享/广告/振动）|

## 抖音小游戏发布

1. Cocos Creator → 项目 → 构建发布 → 抖音小游戏
2. 用抖音开发者工具打开构建产物
3. 调试 → 提交审核 → 上架
