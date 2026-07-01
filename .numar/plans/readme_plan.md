---
id: readme
title: README 内容补充更新
created: 2026-06-17
updated: 2026-06-17
---

## Requirement (What & Why)

> User request: "README.md 中需要补充内容，给个方案"

当前 README.md 与项目实际状态严重脱节：目录结构过时、技术栈版本不准、游戏特性不完整、开发说明缺失多个核心模块。需要全面更新 README，使其准确反映项目现状。

## 现状问题清单

| 问题 | 详情 |
|------|------|
| **项目结构过时** | 缺少`core/`、`hooks/`、`main/`、`renderer/`、`types/`、`utils/` 目录；列出了不存在的文件（GamePanel、InfoPanel、NextPiece、main.tsx） |
|**技术栈版本不准** | Vite 实际 4.x 写成 5.x；缺少 Electron 28、Howler.js |
| **游戏特性不完整** |缺少粒子动画背景、音效系统、难度选择、DAS/ARR 灵敏度、积分历史、键盘导航 |
| **开发说明过时** | 核心模块只提 Block/Grid/gameStore，缺少 Collision、Ghost、Hold、Level、LineClear、Score、ParticleSystem、InputHandler、audioStore、uiStore |
| **已知问题/更新日志过时** | 未反映粒子背景、设置页面、useParticleBackground hook 等新功能 |

## Scope

**Includes**：
- 更新项目结构树为实际目录
-修正技术栈版本与补充缺失技术
- 补全游戏特性列表
- 重写开发说明（核心模块描述）
- 更新已知问题与更新日志

**Excludes**：
- 不改动 DESIGN.md
- 不新增章节（如 API文档、架构图），仅更新现有内容

## Approach

逐节更新 README.md，以项目实际文件结构和代码为依据，确保信息准确。项目结构树按 `getProjectInfo` 返回的实际目录重写，核心模块按 `game/core/`、`store/`、`hooks/`、`utils/` 分组描述。

## Acceptance (Done When)

- README 项目结构树与 `src/` 实际目录一致，无虚构文件
- 技术栈表格版本号与 `package.json` 一致
- 游戏特性覆盖所有已实现功能
- 核心模块描述覆盖 `game/core/` 下全部 9 个文件及 `store/`、`hooks/`、`utils/`

## TODO LIST

- [✔] 更新技术栈表格：修正 Vite 版本为 4.x，补充 Electron 28 和 Howler.js
- [✔] 补全游戏特性列表：粒子动画背景、音效系统、难度选择、DAS/ARR 灵敏度、积分历史、键盘导航
- [✔] 重写项目结构树为实际目录结构
- [✔] 重写开发说明核心模块描述，按 game/core、store、hooks、utils 分组
- [✔] 更新已知问题与更新日志，反映近期新增功能
