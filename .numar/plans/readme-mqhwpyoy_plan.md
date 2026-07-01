---
id: readme-mqhwpyoy
title: README 内容补充
created: 2026-06-17
updated: 2026-06-17
---

## Requirement (What & Why)

> 用户请求：README.md 需要补充内容

当前 README 内容已经比较完整，但经过审查发现以下问题：

1. **已知问题过时**：第 230 行提到 `MainMenu.css` 重复 CSS 规则块，但该问题已在上一轮重构中修复（删除了第 147–169 行的重复块）；第 231 行的 Canvas 层级注意事项属于实现细节，不应作为"已知问题"长期保留
2. **缺少架构概览**：没有说明游戏循环、状态流、UI 与渲染层的关系，新开发者难以快速理解整体设计
3. **缺少 `useParticleBackground` Hook API 文档**：README 第 204–206 行只写了功能描述，没有列出可配置参数（`maxParticles`、`color`、`speedY`、`speedX`、`size`、`life`），而这是该Hook 的核心价值
4. **缺少 Electron 打包命令**：`package.json` 有 `electron:build` 和 `electron:pack`，但 README 启动方式部分未提及
5. **缺少代码规范 / 开发工具链说明**：有 `lint`、`lint:fix`、`type-check` 命令但未在README 中说明

## Scope

**Includes**：
- 修正已知问题章节（移除已定位问题并给出修复思路项、保留真实未解决问题）
- 新增架构概览章节（游戏循环 +状态流 + 渲染分层）
- 补充 `useParticleBackground` Hook 参数文档
- 补充 Electron 打包命令- 补充代码规范与开发工具链说明

**Excludes**：
- 不改动项目结构树（已准确）
- 不改动技术栈版本表格（已准确）
- 不改动游戏操作表（已准确）

## Approach**核心思路**：在现有 README 框架内补充缺失内容，修正过时信息，不大幅重组结构。

**关键决策**：
- 架构概览用文字 + 简要分层描述，不引入 Mermaid 图（README 静态渲染兼容性更好）
- Hook API 文档用表格列出参数、类型、默认值，与项目结构章节风格一致
- 已知问题只保留真实未解决项（移动端触摸控制、浏览器性能差异）

## Acceptance (DoneWhen)

- README 中不再包含已定位问题并给出修复思路的 CSS 重复和 Canvas 层级"已知问题"
- 架构概览章节清晰描述游戏循环、状态流、渲染分层
- `useParticleBackground` 的 6 个可配置参数均有类型和默认值说明
- 启动方式章节包含 `electron:build`和 `electron:pack`
- 开发工具链章节包含 lint / lint:fix / type-check 说明

## TODO LIST

- [✔] 修正「已知问题」章节：移除已修复的 CSS 重复和 Canvas 层级条目，保留移动端触摸和浏览器性能差异
- [✔] 新增「架构概览」章节：描述游戏循环机制、Zustand 状态流、Pixi.js 渲染层与 React UI 层的分层关系
- [✔] 补充 useParticleBackground Hook 参数文档：列出所有可配置项（maxParticles / color / speedY / speedX / size / life）的类型与默认值
- [✔] 补充 Electron 打包命令（electron:build / electron:pack）到启动方式章节
- [✔] 补充代码规范章节：lint / lint:fix / type-check 命令说明
