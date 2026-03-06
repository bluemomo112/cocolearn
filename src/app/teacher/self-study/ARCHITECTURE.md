# Self-Study 模块架构文档

> 最后更新：2026-03-06

## 目录结构

```
src/app/teacher/self-study/
├── page.tsx                          # 路由入口，传递 config 给 SelfStudyWorkbench
├── [spaceId]/
│   ├── page.tsx                      # 学生模式入口（按 spaceId 加载）
│   └── results/page.tsx              # 班级结果分析页
├── constants/
│   └── mockData.ts                   # 全局 Mock 数据（暂未大量使用）
├── utils/
│   └── storage.ts                    # usePersistedState hook（localStorage 持久化）
└── components/                       # 所有 UI 组件
    ├── SelfStudyWorkbench.tsx         # ⭐ 主组件（状态中枢 + 编排层）
    ├── SpaceResults.tsx               # 班级学习结果数据分析页（2745行，独立大组件）
    │
    ├── workbench/                     # 主工作台拆分子组件
    │   ├── shared/                    # 共享工具
    │   │   ├── types.ts               # 类型定义（SelfStudyWorkbenchProps / ChatMessage / Note 等）
    │   │   ├── constants.ts           # 主题色 THEME / 折叠宽度 COLLAPSED_WIDTH
    │   │   ├── utils.ts               # getIconComponent 等工具函数
    │   │   └── Resizer.tsx            # 拖拽调整面板宽度组件
    │   ├── header/
    │   │   └── WorkbenchHeader.tsx    # 顶部标题栏（标题编辑 / 设置 / 发布 / 分析按钮）
    │   ├── resource/
    │   │   └── LeftPanel.tsx          # 左侧面板（资源列表 + 任务列表 + 上传/筛选，1168行）
    │   ├── chat/
    │   │   └── ChatPanel.tsx          # 中间 AI 对话区（消息流 / 快捷回复 / 学习路径）
    │   └── workspace/
    │       ├── RightPanel.tsx         # 右侧容器（「工作区」/「学习状态」两个 tab）
    │       ├── EnhancedNotesPanel.tsx # 笔记编辑器（Markdown / 图片 / 语音）
    │       └── LearningStatusPanel.tsx # 学习状态 / 能力画像展示
    │
    ├── task/                          # 任务相关组件
    │   ├── TaskExpandedCard.tsx       # 任务全屏做题界面
    │   ├── TaskResultReview.tsx       # 任务批改结果展示
    │   ├── SubmissionToolbar.tsx      # 任务提交工具栏
    │   └── taskTypes.ts               # 任务相关类型（QuickResultData / ExamProcessingStep 等）
    │
    └── Modal 组件（弹窗/浮窗）
        ├── UnifiedResourceLibraryModal.tsx  # 统一资源库导入（多标签：资源/错题/历史测验/笔记/网页）
        ├── ResourceLibraryModal.tsx         # 简版资源库选择弹窗
        ├── InteractiveViewerModal.tsx       # 资源全屏查看器（闪卡 / 文本 / 互动网页）
        ├── ResourceInlineViewer.tsx         # 资源侧边栏内嵌查看器
        ├── ResourceSettingsPopover.tsx      # 资源可见性设置气泡（始终/完成后/隐藏）
        ├── ExamDetectedModal.tsx            # 试卷识别配置弹窗
        ├── GuidedModeConfigModal.tsx        # 引导学习模式配置弹窗
        ├── FreeModeConfigModal.tsx          # 自由对话模式配置弹窗
        ├── AIGenerateFormModal.tsx          # AI 生成参数表单弹窗
        ├── MetaConfigModal.tsx              # 学情监控配置弹窗
        ├── CreationMethodModal.tsx          # 创建方式选择弹窗（AI/上传/资源库/空白）
        └── KnowledgeBaseModal.tsx           # 知识库导入弹窗（错题 + 历史测验）
```

---

## 主组件 SelfStudyWorkbench.tsx 内部结构

> 主文件是**状态中枢 + 逻辑编排层**，子组件只负责渲染。
> 当前行数 ~3013 行，分区如下：

| 区块 | 行号范围 | 说明 |
|------|----------|------|
| Imports | 1–60 | 外部库 + 所有子组件导入 |
| Mock 数据 | 61–480 | 组件内 Mock 数据（含 t() 翻译） |
| State 定义 | 481–700 | 37 个 useState，分组见下表 |
| Handlers | 700–2468 | 47+ 个事件处理函数 |
| 内联子组件 | 2468–2600 | KnowledgeCheckpointCard / TopicTransitionCard / ModeTransitionCard |
| JSX Render | 2600–3013 | 三栏布局编排 + 所有 Modal 渲染 |

### State 分组

| 分组 | State 变量 | 归属 Section |
|------|-----------|-------------|
| **全局配置** | `config` | 全局 |
| **布局** | `leftWidth`, `rightWidth`, `isLeftCollapsed`, `isRightCollapsed` | 布局框架 |
| **聊天** | `messages`, `inputMessage`, `isLoading`, `sessionId`, `flashingToolId/ButtonId`, `generatingButtonId`, `isReflectionDismissed` | ChatPanel |
| **任务交互** | `expandedTask`, `taskDisplayMode`, `taskStatus`, `quickResult` | TaskExpandedCard |
| **任务历史** | `completedTasksArray`(持久化), `taskHistory`(持久化) | LeftPanel + Chat |
| **语音/计时器** | `isRecordingVoice`, `elapsedTime`(持久化), `isTimerRunning` | 工作区 |
| **右侧面板** | `rightTab`, `learningPath`(持久化), `currentNodeId`(持久化) | RightPanel |
| **Modal 开关** | `isSettingsOpen`, `isPublishModalOpen`, `isFileUploadOpen`, `isLinkInputOpen`, `showKnowledgeBaseModal`, `examDetectedFiles`, `studioConfigModal` 等 | 各 Modal |
| **左侧面板** | `selectedResourceIds`, `selectedTaskIds`, `collapsedPanels`, `settingsTaskId`, `settingsResourceId`, `editingTask` | LeftPanel |
| **AI 生成** | `generatedTasks`(持久化), `aiGeneratedResources`(持久化), `isGeneratingTask`, `generatingToolId` | LeftPanel + Chat |
| **Header 编辑** | `isEditingTitle`, `editedTitle`, `showNoteInfoModal` | WorkbenchHeader |
| **资源查看** | `viewingResource`, `inlineViewingResource` | 查看器 Modal |

---

## 修改指引：找哪个文件？

| 你想修改的内容 | 找这个文件 | 注意 |
|--------------|-----------|------|
| 左侧资源列表 UI / 任务列表 UI | `workbench/resource/LeftPanel.tsx` | 数据逻辑在主文件 |
| 左侧资源/任务的点击、生成、完成逻辑 | `SelfStudyWorkbench.tsx` handlers 区 | 搜索 `handleResourceClick` / `handleGenerateTest` |
| 中间对话区 UI | `workbench/chat/ChatPanel.tsx` | |
| 发送消息 / 快捷回复逻辑 | `SelfStudyWorkbench.tsx` → `handleSendMessage` (~L1287) | |
| 右侧笔记编辑器 | `workbench/workspace/EnhancedNotesPanel.tsx` | |
| 右侧学习状态展示 | `workbench/workspace/LearningStatusPanel.tsx` | |
| 右侧面板 tab 切换 | `workbench/workspace/RightPanel.tsx` | |
| 顶部标题栏 | `workbench/header/WorkbenchHeader.tsx` | |
| 任务全屏做题界面 | `task/TaskExpandedCard.tsx` | |
| 任务提交 / 批改逻辑 | `SelfStudyWorkbench.tsx` → `toggleTaskCompletion` (~L2259) | 核心复杂逻辑 |
| 试卷识别弹窗 | `ExamDetectedModal.tsx` | |
| 资源导入弹窗 | `UnifiedResourceLibraryModal.tsx` | |
| 共享类型定义 | `workbench/shared/types.ts` | |
| 主题色 / 尺寸常量 | `workbench/shared/constants.ts` | |
| localStorage 持久化 | `utils/storage.ts` | |

---

## 数据流说明

```
page.tsx
  └─ 传入 initialConfig (SpaceConfig)
        └─ SelfStudyWorkbench（状态中枢）
              ├─ WorkbenchHeader  ← props: config, handlers
              ├─ LeftPanel        ← props: config, tasks, resources, handlers
              ├─ ChatPanel        ← props: messages, learningPath, handlers
              └─ RightPanel       ← props: notes, learningPath, handlers
                    ├─ EnhancedNotesPanel
                    └─ LearningStatusPanel
```

**所有 state 变更**都通过主文件的 handler 统一管理，子组件通过 props 接收数据和回调。

---

## 已知技术债

1. **主文件过大（~3013 行）**：handler 层未拆分，所有逻辑集中在主文件
2. **3 个内联子组件**（L2468-2600）：`KnowledgeCheckpointCard` / `TopicTransitionCard` / `ModeTransitionCard` 应提取为独立文件
3. **Mock 数据混入组件**（L61-480）：部分应移到 `constants/mockData.ts`
4. **SpaceResults.tsx 2745 行**：独立大文件，未来需要单独拆分
