---
id: requirement-what-why
title: Requirement (What & Why)
created: 2026-06-15
updated: 2026-06-15
---

## Requirement (What & Why)
> User request: "Main Menu 页面布局又乱了"

添加粒子 Canvas 后，MainMenu 的菜单内容（标题、按钮、控制说明等）横向排列而非纵向居中。原因是JSX 中缺少 `.menu-container` 包裹层，所有内容直接放在 `.main-menu`（水平 flex 居中）内，导致布局错乱。同时 CSS 中存在重复规则需清理。

## Affected Files
- `src/components/ui/MainMenu.tsx` — JSX 结构修复
- `src/components/ui/MainMenu.css` — 删除重复 CSS规则

## TODO LIST
- [ ] 在 `MainMenu.tsx` 中，用 `<div className="menu-container">` 包裹 `<canvas>` 之后的所有菜单内容（h1、menu-score、menu-buttons、controls-info、version-info），使 `.menu-container` 的 `flex-direction: column; align-items: center; gap: 1.2rem` 样式生效- [ ] 在 `MainMenu.css` 中，删除第 123-169 行重复的 CSS 规则（`.controls-info h3::after`、`.controls-info.expanded h3::after`、`.controls-content`、`.controls-info.expanded .controls-content` 各出现两次，保留第一份即可）

## Acceptance (Done When)
- [ ] Main Menu 页面菜单内容纵向居中排列，布局恢复正常- [ ] 粒子 Canvas 背景效果正常显示
- [ ] CSS 中无重复规则
