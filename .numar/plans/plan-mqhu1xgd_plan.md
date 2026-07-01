---
id: plan-mqhu1xgd
title: 游戏趣味性增强方案
created: 2026-06-17
updated: 2026-06-17
---

## Requirement (What & Why)

> 用户请求：「我想提高游戏的趣味性，给一个方案」

当前游戏已实现完整的俄罗斯方块核心玩法（SRS 旋转、T-Spin、B2B、Combo、Hold、Ghost），但缺少现代方块游戏的「爽感」和「反馈感」——消行时视觉冲击不足、没有连击奖励的正反馈循环、缺少随机事件打破单调节奏、没有成就目标驱动长期游玩。

## Scope

**Includes**：
- 6 项趣味性增强功能（详见下方），覆盖视觉反馈、玩法机制、长期目标三个维度
- 每项功能独立可交付，按优先级排序

**Excludes**：
- 多人对战 /排行榜（需要后端服务，超出当前架构）
- 移动端触摸控制（独立课题）
- 自定义皮肤 / 主题商店

## 方案总览

基于对 `gameStore.ts`、`Score.ts`、`Level.ts`、`LineClear.ts`、`ParticleSystem.ts` 等核心模块的分析，提出 6 项增强，按实现优先级排序：

| # | 功能 | 维度 | 核心改动 | 影响范围 |
|---|------|------|---------|---------|
| 1 | 消行震屏 + 闪光特效 | 视觉反馈 | GameBoard 渲染层 | `GameBoard.tsx/css` |
| 2 | 连击里程碑提示| 视觉反馈 | 新增 ComboPopup 组件 | 新文件 + `gameStore` |
| 3 | 道具系统（炸弹 / 减速/ 洗牌） | 玩法机制 | 新增 ItemSystem + UI | 新文件 + `gameStore` |
| 4 | 垃圾行机制 | 玩法机制 | Grid + LineClear扩展 | `Grid.ts` + `gameStore` |
| 5 | 成就系统 | 长期目标 | 新增 AchievementSystem | 新文件 + `gameStore` |
| 6 | 限时挑战模式 | 玩法机制 | 新增 ChallengeMode | 新文件 + `gameStore` |---

### 功能 1：消行震屏 + 闪光特效

**现状**：消行仅有 `clearAnimationActive` 控制的简单行闪烁，Tetris/T-Spin 等高光时刻缺乏视觉冲击。

**方案**：
- 消行时根据消除类型触发不同强度的屏幕震动（CSS `transform: translate` + `transition`）
  - Single：无震动
  - Double/Triple：轻微震动 2-3px
  - Tetris：强震 5px + 白色闪光叠加层- T-Spin：紫色脉冲闪光
  - B2B：额外金色边框闪烁
- 震动通过 `GameBoard` 外层容器的 CSS class 切换实现，`requestAnimationFrame` 驱动衰减
- 闪光叠加层用绝对定位的 `div`，`opacity` 从 0.6 渐变到 0

**改动文件**：`GameBoard.tsx`、`GameBoard.css`、`gameStore.ts`（新增 `screenShake` 状态字段）

---

### 功能 2：连击里程碑提示

**现状**：Combo计数仅在 `clearLabel` 中以文字显示（如 "3 Combo"），没有独立的视觉强调。

**方案**：- 新增 `ComboPopup` 组件，在游戏区域中央弹出连击里程碑提示
- 里程碑阈值：3 Combo→ "Nice!"、5 → "Great!"、8 → "Amazing!"、12 → "GODLIKE!"
- 每个里程碑有不同颜色和缩放动画（CSS `@keyframes` 弹出 → 缩小消失）
- B2B Tetris 额外显示 "BACK-TO-BACK!"金色提示
- 组件自动在 1.5s 后消失，不阻塞游戏操作

**改动文件**：新建 `src/components/game/ComboPopup.tsx` + `.css`，修改 `App.tsx` 挂载，`gameStore.ts` 新增 `comboPopup` 状态

---

### 功能 3：道具系统**现状**：游戏没有任何主动技能或道具，纯被动消行，策略维度单一。

**方案**：
-每消 4 行获得 1 个道具（随机三选一）：
  - **💣 炸弹**：清除当前最低 3 行所有方块
  - **⏳ 减速**：接下来 10 秒下落速度降为 50%
  - **🔄 洗牌**：重新生成 Next 队列中方块
- 道具栏显示在游戏区域右侧，最多持有 3 个- 按键 `1/2/3` 使用对应槽位道具
- 道具使用有简短动画反馈（炸弹爆炸粒子、减速时钟图标、洗牌旋转）

**改动文件**：新建 `src/game/core/ItemSystem.ts`、`src/components/game/ItemBar.tsx` + `.css`，修改 `gameStore.ts`（道具状态 + 使用逻辑）、`InputHandler.ts`（按键绑定）

---

### 功能 4：垃圾行机制

**现状**：没有垃圾行压力，玩家可以无限等待，缺乏紧迫感。

**方案**：
- 每隔一定时间（随等级递减）从底部推入 1 行垃圾行（随机留 1 个空位）
- 消行可以抵消垃圾行：每消 1 行抵消 1 行待推入垃圾
-垃圾行用灰色显示，与正常方块视觉区分
- 新增「垃圾行预警」指示器：显示在游戏区域左侧，预告接下来几行垃圾- 仅在普通和困难难度启用，简单难度关闭

**改动文件**：修改 `Grid.ts`（新增 `addGarbageLine` 方法）、`LineClear.ts`（消行抵消逻辑）、`gameStore.ts`（垃圾行定时器 +状态）、新建 `src/components/game/GarbageIndicator.tsx` + `.css`

---

### 功能 5：成就系统

**现状**：没有长期目标，玩家缺少持续游玩动力。

**方案**：
- 定义成就列表（持久化到 localStorage）：

| 成就 | 条件 ||------|------|
| 初次消行 | 消除第 1 行 |
| Tetris 大师 | 累计完成 10 次 Tetris |
| T-Spin 之王 | 累计完成 5 次 T-Spin || 连击狂人 | 单局达到 8 Combo |
| 速度恶魔 | 在 15 级以上存活 30 秒 |
|马拉松选手 | 单局消除 100 行 |
| 完美开局 | 前 20 行零垃圾行（困难模式） |
| 道具收藏家 | 单局使用 5 个道具 |

- 成就解锁时弹出金色通知卡片（右上角滑入，3s 后滑出）
- 主菜单新增「成就」入口，展示已解锁/未解锁成就列表及进度

**改动文件**：新建 `src/game/core/AchievementSystem.ts`、`src/components/ui/AchievementPanel.tsx` + `.css`、`src/components/game/AchievementNotification.tsx` + `.css`，修改 `gameStore.ts`（成就检查钩子）、`MainMenu.tsx`（新增菜单项）

---

### 功能 6：限时挑战模式

**现状**：只有无限马拉松模式，缺少短平快的刺激玩法。

**方案**：
- 新增「挑战模式」，主菜单增加模式选择：
  - **40 行竞速**：尽快消除 40 行，计时排名
  - **极限生存**：垃圾行速度 2 倍，看能撑多久
  - **得分冲刺**：3 分钟内拿最高分
- 挑战模式有独立的计分板和最佳记录（localStorage）
- 挑战结束后显示成绩卡片（用时/得分/评级 S/A/B/C）

**改动文件**：新建 `src/game/core/ChallengeMode.ts`、`src/components/ui/ModeSelect.tsx` + `.css`、`src/components/ui/ChallengeResult.tsx` + `.css`，修改 `gameStore.ts`（模式状态 + 挑战逻辑）、`MainMenu.tsx`（模式选择入口）

---

## 实现优先级建议

功能 1-2 是「低投入高回报」的视觉增强，可立即提升爽感；功能3-4 增加策略深度；功能 5-6 提供长期目标。建议按编号顺序分批实现，每批 2个功能。

## Acceptance (Done When)

-消行时根据类型触发对应强度的震屏和闪光，Tetris/T-Spin 有明显视觉区分
- Combo 达到 3/5/8/12 时弹出里程碑提示，B2B Tetris 显示金色 BACK-TO-BACK
- 道具栏显示在游戏右侧，按 1/2/3 使用道具，炸弹/减速/洗牌各有对应效果和动画
- 普通/困难难度下垃圾行定时推入，消行可抵消，左侧显示预警指示器
- 成就解锁时弹出通知，主菜单可查看成就列表和进度，数据持久化到 localStorage
- 主菜单可选择挑战模式，挑战结束后显示成绩评级，最佳记录持久化

## TODO LIST

- [ ] 实现消行震屏 + 闪光特效：GameBoard 新增震动/闪光 CSS 动画，gameStore 新增 screenShake 状态，按消行类型触发不同强度
- [ ] 实现连击里程碑提示：新建 ComboPopup 组件，定义里程碑阈值与动画，gameStore 新增 comboPopup 状态，B2B Tetris 金色提示
- [ ] 实现道具系统：新建 ItemSystem 核心逻辑（炸弹/减速/洗牌），新建 ItemBar 组件，gameStore 集成道具状态与使用逻辑，InputHandler 绑定 1/2/3 按键
- [ ] 实现垃圾行机制：Grid 新增 addGarbageLine 方法，LineClear 新增消行抵消逻辑，gameStore 新增垃圾行定时器，新建 GarbageIndicator 组件，简单难度关闭
- [ ] 实现成就系统：新建 AchievementSystem 核心逻辑与成就定义，新建 AchievementPanel + AchievementNotification 组件，gameStore 集成成就检查钩子，MainMenu 新增成就入口
- [ ] 实现限时挑战模式：新建 ChallengeMode 核心逻辑（40行竞速/极限生存/得分冲刺），新建 ModeSelect + ChallengeResult 组件，gameStore 集成模式状态，MainMenu 新增模式选择入口
