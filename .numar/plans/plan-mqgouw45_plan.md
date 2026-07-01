---
id: plan-mqgouw45
title: 是的，给个方案；
created: 2026-06-16
updated: 2026-06-16
---

## Requirement (What & Why)
> User request: 给设置页面也加上粒子动画背景效果

当前MainMenu 有炫酷的青蓝色粒子漂浮动画（Canvas 2D + requestAnimationFrame），但 Settings 页面只有纯黑半透明遮罩 `rgba(0,0,0,0.8)`，打开设置时视觉体验从动态骤变为死黑，落差明显。

## Scope
**Includes**:
- 将粒子动画逻辑提取为可复用的自定义 Hook `useParticleBackground`
- Settings 页面集成粒子背景
- Settings CSS 适配（overlay背景调整、canvas 定位、panel 层级）
- MainMenu 改用新 Hook，消除重复代码
- 顺带清理 MainMenu.css 中已确认的重复 CSS 规则块（第 123–169 行）

**Excludes**:
- 粒子效果本身的视觉参数调整（颜色、数量、速度保持不变）
- 其他页面（GameOver、PauseMenu 等）的背景改造（可后续扩展）

## Approach
**核心思路**：将 MainMenu 中内嵌的粒子动画逻辑（Canvas 创建、粒子系统、resize 监听、requestAnimationFrame 循环、清理）提取为 `useParticleBackground` Hook，Settings 和 MainMenu 共用同一套逻辑。

**技术选择**：
- Hook 接收一个 `canvasRef: RefObject<HTMLCanvasElement>`，在`useEffect` 中完成全部动画生命周期管理
- 粒子参数（数量、颜色、速度范围等）作为可选配置传入，默认值与当前 MainMenu 一致
- Settings 的 overlay 背景从纯黑半透明改为径向渐变（与 MainMenu风格统一），canvas 绝对定位在 overlay 内、panel 之下

**Settings层级结构**：
```
.settings-overlay (z-index: 1000, 径向渐变背景)
  ├── canvas.particle-canvas (z-index: 0, 绝对定位, pointer-events: none)
  └── .settings-panel (z-index: 1, 相对定位, 保持现有样式)
```

## Affected Files
- `src/hooks/useParticleBackground.ts` — **新建**，提取粒子动画 Hook
- `src/components/ui/MainMenu.tsx` — 改用 `useParticleBackground`，删除内嵌动画代码
- `src/components/ui/MainMenu.css` — 删除重复 CSS 规则块（第 123–169 行）
- `src/components/ui/Settings.tsx` — 添加 canvas ref + `useParticleBackground`，JSX 中插入 canvas元素
- `src/components/ui/Settings.css` — overlay 背景改为径向渐变，新增 `.particle-canvas` 样式，panel 加 `position: relative; z-index: 1`

## TODO LIST
- [✔] 新建 `src/hooks/useParticleBackground.ts`，从 MainMenu 提取粒子动画逻辑为可配置 Hook
- [✔] 重构 `MainMenu.tsx`，改用 `useParticleBackground` Hook 替换内嵌动画代码
- [✔] 清理 `MainMenu.css` 第 123–169 行的重复 CSS 规则块
- [✔] 修改 `Settings.tsx`，添加 canvas ref、引入 `useParticleBackground`、在 overlay 内插入 canvas 元素
- [✔] 修改 `Settings.css`，overlay 背景改为径向渐变、新增 canvas 样式、panel加层级定位
- [✔] 验证两个页面粒子动画均正常渲染，Settings 面板可交互且关闭正常

## Acceptance (Done When)
- [ ] Settings 页面打开后可见与 MainMenu 一致的青蓝色粒子漂浮动画
- [ ] MainMenu 粒子效果与改动前视觉无差异
- [ ] Settings 面板内所有控件（滑块、开关、按钮）交互正常，canvas 不拦截鼠标事件
- [ ] `MainMenu.css` 无重复规则块
- [ ] 粒子动画逻辑仅存在于 `useParticleBackground.ts`，无内嵌重复代码
