---
id: plan-mr8ryeb7
title: 项目全量优化
created: 2026-07-06
updated: 2026-07-06
---

## Requirement (What & Why)
> 用户请求：整个项目还有需要进行优化的点吗？

对项目全量代码审查后，发现多个层面的优化机会：架构冗余、性能瓶颈、类型安全缺失、死代码、状态管理混乱等。以下按优先级分类列出。

---

## 发现的优化点

### 一、架构冗余（高优先级）

**1. 双重音频系统并存**
- `src/utils/AudioManager.ts`：单例类，使用 `/assets/audio/` 路径
- `src/store/audioStore.ts`：Zustand store，使用 `/audio/` 路径
- `App.tsx` 只使用 `audioStore`，`AudioManager` 完全未被引用
- 两者路径不同、音效列表不同，维护成本翻倍

**2. 双重碰撞检测系统**
- `src/game/core/Collision.ts`：独立 Collision 类，带 `@ts-nocheck`，引用不存在的 `block.shape`、`grid.width`、`grid.isCellOccupied`
- `src/game/core/Grid.ts`：`Grid.checkCollision()` 方法，实际被 `gameStore` 使用
- `Collision.ts` 是死代码，且类型错误被 `@ts-nocheck` 掩盖

**3. 双重 Ghost 系统**
- `src/game/core/Ghost.ts`：独立 Ghost 类，带 `@ts-nocheck`，调用`collision.checkCollision(block, this.grid, ...)` 但 Collision 类无此签名
- `gameStore.ts`：内联 `getGhostY()` 方法，实际被使用
- `Ghost.ts` 是死代码

**4. ScoreSystem 类未被实际使用**
- `src/game/core/Score.ts`：完整的 `ScoreSystem` 类，有配置化计分、B2B、Combo 管理
- `gameStore.ts`：自己内联实现了计分逻辑（`addScore`、`incrementCombo`、`setB2B`），`scoreSystem` 字段虽然初始化但从未调用其方法
- `LineClear.ts` 也有自己的 `calculateScore()`方法
- 计分逻辑分散在三处，ScoreSystem 被架空

### 二、类型安全缺失（高优先级）

**5. `@ts-nocheck` 掩盖类型错误**
- `Collision.ts:1` 和 `Ghost.ts:1` 顶部均有 `// @ts-nocheck`
- 两个文件都引用了不存在的 API（`block.shape`、`grid.width`、`grid.isCellOccupied`、`collision.checkCollision` 五参数签名）

**6. `types/index.ts` 泛型语法错误**
- `Readonly<T>` 写成 `Readonly`（缺少泛型参数）
- `DeepReadonly<T>` 写成 `DeepReadonly`
- `RecordType<K, V>` 写成 `RecordType`
- `ArrayElement<T>` 写成 `ArrayElement`
- `GameEvent.payload` 类型为裸 `Record`（缺少泛型参数）
- `AudioManager.ts` 中 `Map<string, Howl>` 写成裸 `Map`
- 这些错误在运行时不会报错但 TypeScript 严格模式下会编译失败

**7.GameBoard.tsx 大量 `state: any` 类型断言**
- 第 35–44 行，所有 `useGameStore` selector 返回值都标注为 `any`
- 丧失了 Zustand 的类型推导优势

### 三、性能问题（中优先级）

**8. PixiJS 每帧重建 Graphics 对象**
- `GameBoard.tsx` 的 grid/ghost/block渲染 useEffect 每次都 `removeChildren()` + `new PIXI.Graphics()` + `addChild()`
- 方块每移动一格就销毁并重建所有 Graphics 对象，造成大量GC 压力
- 应使用对象池或更新已有 Graphics 的位置/可见性

**9. `Grid.getCells()` 每次深拷贝整个网格**
- `Grid.ts:60-62`：每次调用返回 200 个 cell 的深拷贝
- `gameStore` 的 `lockPiece`、`moveDown` 等高频操作都调用 `getCells()`
- 对于只读场景可以返回不可变引用，只在需要修改时才拷贝

**10. `useGameStore` 订阅粒度过粗**
- `App.tsx` 解构了 10+ 个字段，任何一个变化都会导致整个 App 重渲染
- 应使用细粒度 selector 或 `useShallow` 避免无关状态变化触发重渲染

**11. InputHandler 的 DAS/ARR 与 App.tsx 键盘处理冲突**
- `InputHandler.ts` 实现了完整的 DAS/ARR 重复逻辑
- `App.tsx` 自己又写了一套 `keydown` 监听，没有 DAS/ARR
- 两套输入系统并存，`InputHandler` 实际未被 App 引用

### 四、状态管理问题（中优先级）

**12. gameStore 职责过重（God Object）**
- 970+ 行，包含游戏逻辑、渲染状态、UI 设置、计时器、localStorage 操作
- 应拆分为：`gameCoreStore`（纯游戏逻辑）、`gameUIStore`（动画/特效状态）、`settingsStore`（设置）

**13. Combo/B2B 状态双重维护**
- `gameStore` 维护 `combo`/`b2b` 状态
- `LineClear` 类内部也维护 `combo`/`backToBack` 状态
- 两套状态可能不同步

**14. `clearEffects` 消费模式脆弱**
- `consumeEffects()` 在 `useEffect` 中调用，但 `clearEffects` 变化时 effect可能被跳过（React 18 并发模式）
- 应改为事件驱动或使用 `useRef` + 同步消费

### 五、死代码 / 未使用代码（低优先级）

**15. `ParticleSystem.emitScreenFlash()` 无调用点**
- 方法存在但整个代码库无任何调用

**16. `Grid.reset()` 与 `Grid.clear()` 完全相同**
- 两个方法实现一模一样

**17. `types/index.ts` 大量未使用类型**
- `GameState`、`ActiveBlock`、`HoldBlock`、`NextBlock`、`TetrominoShape`、`ScoreEvent`、`ScoreStats`、`LevelConfig`、`SpeedSettings`、`KeyMapping`、`InputEvent`、`AudioConfig`（types 中）、`GameSettings`、`UserSettings`、`GameEvent`、`EventListener`、`StorageData`、`HighScore`、`GameStatistics`、`Achievement`、`AchievementCategory`、`RenderConfig`、`AnimationState`、`PlayerState`、`GameRoom`、`AttackEvent`、工具类型等
- 这些类型定义了但从未被实际代码引用，增加了维护负担

**18. `useKeyboardNavigation.ts` 缺少返回类型导出**
- 函数返回 `UseKeyboardNavigationReturn` 但该类型未定义/导出

### 六、代码质量（低优先级）

**19. 注释错位**
- `Grid.ts:51`：`getWidth()` 上方注释写的是"参数 piece 包含方块的形状、位置和旋转状态"
- `Grid.ts:56-57`：`getHeight()` 上方注释写的是"遍历方块形状的每个单元格进行碰撞检测"
- `Grid.ts:67`：`getGrid()` 内注释"检查是否超出左右边界"
- 这些是从别处复制过来的错误注释

**20. `Block.move()` 和 `Block.resetPosition()` 直接修改传入的 Tetromino 对象**
- 违反不可变数据原则，与 React/Zustand 的不可变更新模式冲突

**21. `gameStore` 中 `as any` 类型断言**
- `readyGoTimer`、`lockDelayTimer`等字段使用 `as any` 绕过类型检查

---

## Scope

**Includes**：
- 移除死代码（Collision.ts、Ghost.ts、AudioManager.ts、emitScreenFlash）
-修复类型错误（@ts-nocheck、泛型参数缺失、any 断言）
- 统一音频系统（删除 AudioManager，保留 audioStore）
- 统一计分系统（让 gameStore 实际使用 ScoreSystem 或移除 ScoreSystem）
- 修复注释错位
- 合并 Grid.reset()/clear()

**Excludes**：
- PixiJS 渲染优化（对象池重构，改动大且风险高，建议单独计划）
- gameStore 拆分（God Object 重构，影响面广，建议单独计划）
- InputHandler 与 App.tsx 输入系统统一（需要重新设计输入架构）
- 未使用类型清理（低风险但量大，可渐进处理）

## Approach

**Core idea**：先清理死代码和类型错误，再统一重复系统，降低维护复杂度。

**Key technical choices**：
- 死代码直接删除，不保留"以防万一"
- 类型修复以通过 `tsc --noEmit` 为标准
- 计分系统统一方向：让 gameStore 使用 ScoreSystem 类（它设计更完善、配置化），移除 LineClear 中的重复计分逻辑
- 音频系统保留 audioStore（Zustand 集成更好），删除 AudioManager

**Alternatives considered and rejected**：
- 保留两套系统"兼容"→ 维护成本持续增加，不值得
- 重构 gameStore 为多个 store → 改动面太大，本次不做

## Acceptance (Done When)
- `tsc --noEmit` 无错误
- `npm test` 全部通过
- Collision.ts、Ghost.ts、AudioManager.ts 不再存在于项目中
- GameBoard.tsx 中无 `state: any`断言
- types/index.ts 中所有泛型类型语法正确

## TODO LIST

- [✔] 删除死代码文件：Collision.ts、Ghost.ts、AudioManager.ts
- [✔] 移除 ParticleSystem.emitScreenFlash() 方法
- [✔] 合并 Grid.reset() 和 Grid.clear() 为单一方法
- [✔] 修复 types/index.ts 泛型语法错误（Readonly、DeepReadonly、RecordType、ArrayElement、GameEvent.payload）
- [✔] 修复 GameBoard.tsx 中 useGameStore selector 的 any 类型断言
- [✔] 统一计分系统：让 gameStore 使用 ScoreSystem 类，移除 LineClear.calculateScore() 中的重复逻辑
- [ ] 统一音频系统：确认 App.tsx 只用 audioStore，删除 AudioManager 引用
- [ ] 修复 Grid.ts 中错位的注释
- [ ] 修复 useKeyboardNavigation.ts 缺失的返回类型定义
- [ ] 运行 tsc --noEmit 和 npm test 验证所有改动
