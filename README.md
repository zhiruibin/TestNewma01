# Tetris Game

一款基于 React + TypeScript + Pixi.js 的现代俄罗斯方块游戏。

## 🎮 游戏特性

- **经典玩法**：传统俄罗斯方块游戏规则
- **现代界面**：简洁美观的 UI 设计
- **流畅动画**：基于 Pixi.js 的高性能渲染
- **完整功能**：
  - 方块预览（Next）
  - 方块暂存（Hold）
  - 幽灵方块（Ghost）
  - 分数和等级系统
  - 碰撞检测
  - 行消除动画

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Pixi.js | 8.x | 2D 渲染引擎 |
| Vite | 5.x | 构建工具 |
| Zustand | 4.x | 状态管理 |
| CSS3 | - | 样式设计 |

## 📦 安装指南

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd TestNewma

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🚀 启动方式

- **`python3 run.py`** — 一键启动（推荐，自动清理 5173 端口 + 启动 Electron 桌面模式）
- **`npm run electron:dev`** — 手动启动 Electron 桌面模式
- **`npm run dev`** — 仅启动 Vite 开发服务器（浏览器预览）

## 🎯 游戏操作

| 按键 | 功能 |
|------|------|
| ← / A | 左移 |
| → / D | 右移 |
| ↓ / S | 加速下落 |
| ↑ / W | 旋转 |
| Space | 硬降落（直接到底） |
| C / Shift | 暂存方块 |
| P | 暂停游戏 |
| R | 重新开始 |

## 📁 项目结构

```
src/
├── game/
│   ├── core/
│   │   ├── Block.ts        # 方块逻辑类
│   │   ├── Grid.ts         # 网格系统
│   │   ├── Tetromino.ts    # 方块类型定义
│   │   └── constants.ts    # 游戏常量
│   └── renderer/
│       └── GameBoard.tsx   # Pixi.js 渲染组件
├── store/
│   └── gameStore.ts        # 游戏状态管理
├── components/
│   ├── GamePanel.tsx       # 游戏主面板
│   ├── InfoPanel.tsx       # 信息面板（分数/等级）
│   └── NextPiece.tsx       # 下一个方块预览
├── styles/
│   └── App.css             # 全局样式
├── App.tsx                 # 应用入口
└── main.tsx                # React 入口
```

## 🔧 开发说明

### 核心模块

**Block.ts** - 方块控制
- 处理方块的移动、旋转
- 碰撞检测协调
- 幽灵方块计算

**Grid.ts** - 网格系统
- 游戏网格管理
- 方块锁定
- 行消除检测
- 游戏结束判断

**gameStore.ts** - 状态管理
- 游戏状态（运行/暂停/结束）
- 分数和等级
- 当前/下一个/暂存方块
- 游戏循环控制

### 添加新方块类型

1. 在 `Tetromino.ts` 中定义新形状
2. 在 `constants.ts` 中添加颜色配置
3. 更新随机生成逻辑

### 修改游戏规则

1. 调整 `constants.ts` 中的游戏参数
2. 修改 `Grid.ts` 中的碰撞检测逻辑
3. 更新 `gameStore.ts` 中的计分规则

## 🐛 已知问题

- 某些浏览器下 Pixi.js 渲染可能有性能差异
- 移动端触摸控制尚未实现

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 完整游戏功能实现
- 响应式布局支持

## 📄 许可证

MIT License

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

**Enjoy Playing! 🎮**