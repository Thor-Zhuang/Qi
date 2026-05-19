# 炁（Qi）— 开发进度追踪

> 最后更新：2026-05-19

## Phase 1: 地基 ✅ 已完成

- [x] 项目搭建：Cocos Creator 3.8 + 抖音小游戏配置
- [x] 事件系统 `core/EventBus.ts`
- [x] 存档系统 `core/SaveManager.ts`
- [x] 时间工具 `utils/TimeUtils.ts`
- [x] 数值格式化 `utils/NumberUtils.ts`
- [x] 玩家数据模型 `core/PlayerData.ts`
- [x] 境界配置 `config/RealmConfig.ts`（5大境界×4阶段=20节点）
- [x] 功法配置 `config/TechniqueConfig.ts`（3本功法）
- [x] 秘境配置 `config/DungeonConfig.ts`（22关+2Boss）
- [x] 数值常量 `config/GameConstants.ts`
- [x] 修炼系统 `systems/CultivationSystem.ts`
- [x] 功法系统 `systems/TechniqueSystem.ts`
- [x] 秘境系统 `systems/DungeonSystem.ts`
- [x] 战力计算 `systems/CombatCalculator.ts`
- [x] 离线收益系统（集成在 CombatCalculator）
- [x] 游戏主控制器 `GameManager.ts`
- [x] UI管理器 `UIManager.ts`
- [x] 抖音适配 `DouyinAdapter.ts`
- [x] 离线弹窗 `ui/OfflinePopup.ts`

## Phase 2: 核心循环 🔄 进行中

- [ ] 主界面场景 `MainScene` 搭建
  - [ ] AI生成主界面参考图 → `docs/design/references/ui-main.png`
  - [ ] Cocos MCP 创建场景节点树
  - [ ] 顶部资源栏（修为/灵石/境界显示）
  - [ ] 中央区域（角色立绘+境界名+修为进度条）
  - [ ] 操作按钮区（修炼/突破/加速）
  - [ ] 底部Tab栏（修炼/功法/秘境/我的）
- [ ] 修炼面板 `CultivationPanel`
  - [ ] AI生成修炼面板参考图 → `docs/design/references/ui-cultivation.png`
  - [ ] 修炼速度详情展示
  - [ ] 加速按钮（激励视频）
  - [ ] 修为飘字特效
- [ ] 功法面板 `TechniquePanel`
  - [ ] AI生成功法面板参考图 → `docs/design/references/ui-technique.png`
  - [ ] 3本功法展示卡片
  - [ ] 升级按钮+消耗显示
- [ ] 突破弹窗 `BreakthroughPopup`
  - [ ] 全屏动画（白光→境界名渐显→粒子爆发）
  - [ ] 震屏效果
- [ ] 修炼循环完整跑通（挂机→修为增长→突破→新境界）

## Phase 3: 扩展系统 ⬜ 待开始

- [ ] 秘境面板 `DungeonPanel`
  - [ ] AI生成秘境面板参考图 → `docs/design/references/ui-dungeon.png`
  - [ ] 关卡列表滚动展示
  - [ ] 挑战按钮+战力对比
  - [ ] 战斗结果弹窗
  - [ ] 战斗特效（闪光+伤害数字）
- [ ] 个人面板 `ProfilePanel`
  - [ ] AI生成个人面板参考图 → `docs/design/references/ui-profile.png`
  - [ ] 角色信息+战力展示
  - [ ] 设置入口
- [ ] 离线弹窗UI完善
- [ ] 存档完整性校验
- [ ] 异常数值检测（防修改器）
- [ ] 存档损坏时"重新开始"选项

## Phase 4: 美术与表现 ⬜ 待开始

- [ ] 主界面背景（仙山云雾 720×1280）
- [ ] 灵石图标（64×64 发光蓝石头）
- [ ] 修为图标（64×64 金色气旋）
- [ ] 5个境界图标（128×128 不同颜色光晕）
- [ ] 3本功法图标（128×128 古卷轴）
- [ ] 4个Tab图标（64×64 修炼/功法/秘境/我的）
- [ ] 修仙者立绘（256×512 3个阶段半身像透明底）
- [ ] 突破光效动画
- [ ] 修为飘字特效素材
- [ ] 秘境战斗特效素材
- [ ] 数字跳动动画
- [ ] 进度条平滑动画

## Phase 5: 音效 ⬜ 待开始

- [ ] 古风修仙BGM 1首（循环）
- [ ] 突破音效 1个（震撼感）
- [ ] 按钮点击音效 1个（清脆）
- [ ] 修炼脉动音效 1个（柔和循环）

## Phase 6: 抖音集成与上线 ⬜ 待开始

- [ ] 广告点位接入（离线翻倍/加速修炼/秘境复活）
- [ ] Cocos构建抖音小游戏
- [ ] 抖音开放平台创建应用+上传代码包
- [ ] 数值调优
  - [ ] 20个境界修为需求验证
  - [ ] 修炼速度增长曲线验证
  - [ ] 战力计算公式参数调优
  - [ ] 灵石产出与消耗平衡
  - [ ] 模拟8小时挂机验证
  - [ ] 前三天每天至少突破1次
- [ ] 完整测试
  - [ ] 修炼循环完整走通（练气→化神）
  - [ ] 离线收益正确计算
  - [ ] 功法升级路径正常
  - [ ] 秘境22关全部可通关
  - [ ] 存档/读档正常
  - [ ] 广告点位触发正常
  - [ ] 修为每秒更新不卡顿
  - [ ] 内存占用 < 150MB
  - [ ] 首屏加载 < 3秒
  - [ ] 包体 < 4MB
- [ ] 软著申请
- [ ] 提交审核 → 发布
