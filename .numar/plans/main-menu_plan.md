---
id: main-menu
title: 启动报错问题解决了，但是Main Menu页面的布局又乱了；
created: 2026-06-15
updated: 2026-06-15
---

## Requirement (What & Why)
> User request: "Main Menu 页面布局又乱了"

添加粒子 Canvas 后，菜单内容（标题、按钮、控制说明等）失去了纵向居中排列，挤在一起。根本原因是 TSX 中缺少 `.menu-container` 布局包裹层，同时 CSS 中有重复规则需清理。

## Root Cause
1. **TSX 缺少 `.menu-container`**：CSS 定义了 `.menu-container`（`flex-direction: column; align-items: center; gap: 1.2rem`）负责纵向排列菜单内容，但 TSX 中所有内容直接放在 `.main-menu` 下，没有 `.menu-container` 包裹，导致 `flex-direction` 默认为 `row`，内容横向堆叠。
2. **CSS 重复规则**：`.controls-info h3::after`、`.controls-content`、`.controls-info.expanded .controls-content` 各定义了两次（第 123-145 行和第 147-169 行），需删除重复。

## Affected Files
- `src/components/ui/MainMenu.tsx` — 添加 `.menu-container` 包裹层
- `src/components/ui/MainMenu.css` — 删除重复 CSS 规则

## TODO LIST
- [✔] 在MainMenu.tsx 中用 `<div className="menu-container">` 包裹 canvas 之后的所有菜单内容（h1、menu-score、menu-buttons、controls-info、version-info）
- [ ]删除 MainMenu.css 第 147-169 行的重复 CSS 规则（`.controls-info h3::after`、`.controls-content`、`.controls-info.expanded .controls-content` 的重复定义）

## Acceptance (Done When)
- [ ] Main Menu 页面标题、分数、按钮、控制说明、版本信息纵向居中排列，间距正常
- [ ] 粒子动画正常显示在背景层
- [ ] CSS无重复规则
