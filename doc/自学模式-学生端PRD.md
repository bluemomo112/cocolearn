**4.2 模式二:自学模式 (The Workbench)**

![1767756111172](image/自学模式-学生端PRD/1767756111172.png)

**4.2.1 页面定位与布局**

学生参与课程学习的核心界面,支持深度探究与任务驱动。布局采用三栏式沉浸工作台 (Immersive Workbench),类似 NotebookLM 结合 Learn About 的体验。

* **左侧 (25%):资料面板 (Library) —— 资源管理与任务入口**
* **中间 (50%):AI 对话学习区 (Copilot Chat) —— 核心交互与知识缝合**
* **右侧 (25%):工作室 (Studio) —— 笔记、数据监控与元认知**

**布局特性:**
* 支持拖拽调整左右面板宽度(18%-35%范围)
* 中间面板自动适应剩余空间
* 提供视觉化的调整手柄,支持鼠标悬停提示

**4.2.2 左侧:资料面板 (Library)**

左侧面板分为上下两个区域,各占50%高度:

**资源列表区域 (上半部分):**
* **展示所有状态为 `Open` 的资源**
* **支持类型:**
  * Document (Word/PDF) - 橙色/蓝色主题
  * Presentation (PPT) - 橙色主题
  * Video (MP4) - 红色主题
* **资源卡片信息:**
  * 标题、描述、类型标签、预估时长
  * 类型相关图标(Video/FileText/FileSpreadsheet)
* **资源交互:**
  * **视频资源:** 点击"播放视频"按钮 → 在左侧展开视频播放器,支持全屏模式
  * **文档资源:** 提供"下载"和"查看"按钮,支持在新窗口打开
  * **资源查看触发 AI 引导:** 当用户点击查看资源时,系统在中间对话区自动推送一条 AI 消息,根据资源类型提供学习建议:
    ```
    我看到你正在查看「[资源标题]」[类型]。

    [根据类型的引导文字:]
    📹 观看视频时,注意观察关键的演示环节。看完后可以告诉我你的发现或疑问!
    📊 浏览课件时,注意理解每一页的核心概念。有不明白的地方随时问我!
    📄 阅读文档时,可以边读边做笔记。遇到困难的部分我可以帮你解释!
    ```
  * 此消息带有 `competencyHint` 标签,显示"培养 信息整合 • 引导有目的的资源学习"

**互动任务区域 (下半部分):**
* **展示 `Required` 和 `Open` 的任务列表**
* **任务类型:**
  * Quiz (测验) - 琥珀色主题,闪电图标
  * Assignment (作业) - 主题色,文档图标
  * Reflection (反思) - 紫色主题,大脑图标
* **任务状态标识:**
  * `locked` - 灰色,显示"未解锁"标签,不可点击
  * `available` - 白色背景,可点击,显示"必修"标签(如适用)
  * `completed` - 绿色背景,显示"已完成"标签,标题有删除线
* **交互逻辑 (Agent-First Push to Chat):**
  * **点击任务 Item → 不直接跳转新页面**
  * **动作:** 系统在中间 AI 聊天区自动推送一条 AI 消息,包含:
    1. 引导性文字(根据任务类型定制)
    2. 嵌入式任务卡片 (`embeddedTask`)
  * **引导文字示例:**
    ```
    - Quiz: "好的,让我们来做一个知识测验,检验一下你对植物工厂基础知识的掌握情况:"
    - Reflection: "现在是一个很好的时机来反思你的学习过程。请认真思考以下问题:"
    - Assignment: "接下来让我们完成这个任务,这将帮助你更深入地理解所学内容:"
    ```
  * **目的:** 保持学生在"对话流"中完成任务,便于 AI 在任务过程中提供脚手架支持(Scaffolding)

**4.2.3 中间:AI 对话学习区 (Center Chat)**

**Agent-First 欢迎消息:**
* **页面加载时,AI 主动发送欢迎消息**(而非等待学生提问):
  ```
  你好!👋 欢迎来到「[课程标题]」的学习之旅!

  我是你的AI学习助手,在学习过程中我会陪伴你一起探索和思考。

  📚 学习建议:
  1. 先浏览左侧的学习资料,从课件或视频开始了解基础知识
  2. 有任何疑问随时问我,我会帮助你理解和思考
  3. 准备好了就可以尝试完成学习任务

  你想从哪里开始呢?可以先看看《认识植物工厂课件》,或者告诉我你对植物工厂已经了解多少?
  ```
* **此消息带有能力培养提示标签:** "培养 元认知 • 激活先验知识,建立学习目标"

**上下文感知 (Context Awareness):**
* **AI 自动感知左侧当前选中/正在查看的资源**
* **学生无需重复背景,直接提问"这个怎么理解?",AI 即可基于当前文档回答**
* **资源和任务操作会触发 AI 主动推送相关消息**

**消息展示:**
* **学生消息:** 右对齐,蓝色气泡,圆角
* **AI 消息:** 左对齐,白色气泡,包含:
  * AI 头像(机器人图标)
  * **能力培养提示标签**(如果有):
    ```
    🎯 培养 [能力名称] • [培养策略]
    ```
    - 淡蓝色背景,小字体
    - 显示在消息内容上方
  * 消息内容(支持 Markdown 格式)
  * **嵌入式任务卡片**(如果有):
    - 显示在消息内容下方
    - 包含任务类型图标、标题、描述
    - 根据任务类型渲染交互界面:
      * **Quiz:** 单选/多选题,带选项按钮
      * **Assignment/Reflection:** 文本输入框
    - 提交按钮(已完成任务显示绿色"已完成"状态)

**卡片式交互:**
* **任务卡片:** 由左侧点击触发,在对话流中展开
  * 卡片头部:类型相关颜色渐变背景,任务图标,标题,"必修/选修"标签,关闭按钮
  * 卡片内容:任务描述、问题/提示文本、交互组件
  * 提交按钮:蓝色/绿色状态切换
* **资源卡片:** AI 在回答中引用的资源,以卡片形式展示,点击可反向定位到左侧资源

**阶段性反思引导:**
* **当消息数量 >= 6 时**,自动显示反思引导卡片:
  ```
  💭 阶段性反思时间
  你已经学习了一段时间,让我们暂停一下,回顾总结学到的内容。

  1. 今天学习的最重要的三个知识点是什么?
  2. 你遇到了哪些困难?是如何解决的?
  3. 这些知识可以在生活中的哪些地方应用?
  ```
* 琥珀色渐变背景,带"开始反思"按钮

**交互模式切换:**
* **自由对话模式:** 学生主导,AI 响应式回答
* **引导学习模式:** AI 主动提问,结构化引导(暂未完全实现)

**实时 API 集成:**
* **聊天 API:** `POST /api/chat`
  * 请求参数: `{ sessionId, message, action: 'chat' }`
  * 返回: `{ messageId, message, competencyUpdates? }`
* **任务提交 API:** `POST /api/chat`
  * 请求参数: `{ sessionId, action: 'submit_task', taskId, taskAnswer }`
  * 返回: `{ message, competencyUpdates? }`
* **能力更新处理:** API 返回的 `competencyUpdates` 数组会自动更新右侧能力画像

**4.2.4 右侧:工作室 (Studio)**

**默认可见,提供两个 Tab:**

**Tab A: 工作区 (Workspace)**

**增强笔记面板 (Enhanced Notes Panel):**
* **笔记列表视图 (未展开编辑器时):**
  * "添加笔记"按钮 - 渐变蓝色主题
  * 笔记卡片列表:
    - 显示标题、内容预览(前50字符)、更新时间
    - 点击卡片打开编辑器
* **笔记编辑器 (展开状态):**
  * **工具栏:**
    - 返回列表按钮
    - 编辑/预览模式切换
    - 图片上传按钮(支持多图)
    - 语音录制按钮(支持录音计时)
    - 删除笔记按钮
  * **编辑区:**
    - 标题输入框
    - Markdown 文本编辑器 / 渲染预览(可切换)
    - 支持格式: `# 标题`、`**粗体**`、`*斜体*`
  * **附件展示:**
    - 图片网格(3列),支持删除
    - 语音录音列表,显示时长和播放按钮
* **数据存储:** 客户端 state 管理,支持多个笔记并行
* **特性:**
  - 支持 Markdown 编辑和预览
  - 支持上传多张图片
  - 支持录制语音笔记(带计时器)
  - 自动保存更新时间

**Tab B: 我的能力成长 (Stats)**

**本课程能力画像:**
* **能力雷达图** (CompetencyRadarChart):
  * 显示三个核心能力:
    - 批判性思维 (critical_thinking) - 蓝色
    - 信息整合 (information_synthesis) - 绿色
    - 元认知 (metacognition) - 紫色
  * 1-4 星级评分系统
  * 实时更新(来自 API 的 `competencyUpdates`)

**AI 实时观察:**
* 显示最新 2 条 AI 观察记录:
  * 观察类型: 赞赏 / 建议 / 洞察
  * 包含 emoji 图标、类型标签、时间戳、观察内容
  * 白色卡片,淡蓝色边框

**跨课程能力画像 (可折叠):**
* **折叠状态:** 显示标题和展开/收起按钮
* **展开状态:** 显示全局能力趋势:
  * 每个能力维度的综合评级(1-4星)
  * 发展趋势图标(↗ 上升 / → 稳定 / ↘ 下降)
  * 涉及课程数量
  * 最新观察描述
* **数据来源:** `mockLearnerProfile.globalCompetencies`

**学习元数据:**
* 两个统计卡片(网格布局):
  * 已完成课程数
  * 累计学习时长(小时)

**4.2.5 能力追踪与实时反馈系统**

**能力评估机制:**
* **三个核心能力维度:**
  1. **批判性思维 (Critical Thinking):** 质疑假设、评估证据、识别逻辑漏洞
  2. **信息整合 (Information Synthesis):** 跨资源连接、总结归纳
  3. **元认知 (Metacognition):** 反思学习过程、自我监控
* **评分系统:** 1-4 星级,基于学生在对话和任务中的表现
* **证据收集:**
  - 对话中的问题质量和思考深度
  - 任务提交的完成度和创造性
  - 反思任务的自我认知水平

**实时更新流程:**
1. 学生发送消息或提交任务
2. API 返回 `competencyUpdates` 数组:
   ```typescript
   {
     type: CompetencyType,
     rating: number,  // 1-4
     evidence: string,
     source: 'chat' | 'task' | 'reflection'
   }
   ```
3. 前端更新 `competencyProfile` state(简单平均算法)
4. 右侧能力雷达图实时刷新

**能力培养提示:**
* AI 消息可携带 `competencyHint` 标签:
  ```typescript
  {
    type: CompetencyType,
    strategy: string  // 如:"激活先验知识,建立学习目标"
  }
  ```
* 在消息上方显示为淡蓝色标签:"培养 [能力名称] • [策略]"

**4.2.6 技术实现细节**

**核心状态管理:**
```typescript
// 布局状态
const [leftWidth, setLeftWidth] = useState(25);
const [rightWidth, setRightWidth] = useState(25);

// 交互模式
const [chatMode, setChatMode] = useState<'free' | 'guided'>('free');

// 聊天消息
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [inputMessage, setInputMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);

// 任务状态
const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
const [expandedTask, setExpandedTask] = useState<Task | null>(null);

// 资源状态
const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
const [isResourceFullscreen, setIsResourceFullscreen] = useState(false);

// 能力画像
const [competencyProfile, setCompetencyProfile] = useState({
  critical_thinking: 2,
  information_synthesis: 2,
  metacognition: 2,
});

// 计时器
const [elapsedTime, setElapsedTime] = useState(0);
const [isTimerRunning, setIsTimerRunning] = useState(true);
```

**关键函数:**
* `handleSendMessage()`: 发送聊天消息,调用 `/api/chat`,处理能力更新
* `toggleTaskCompletion()`: 提交任务,调用 `/api/chat` 的 submit_task action
* `handleTaskClick()`: 任务点击处理,推送 AI 消息 + 嵌入任务卡片
* `handleResourceView()`: 资源查看处理,推送 AI 引导消息

**组件结构:**
* `StudentWorkbenchPage` (主组件)
  * `LeftPanel` (左侧资料面板)
    * `ResourceViewer` (资源查看器)
  * `Resizer` (可拖拽分隔条) x2
  * `CenterPanel` (中间对话区)
    * `TaskExpandedCard` (任务展开卡片)
  * `RightPanel` (右侧工作室)
    * `EnhancedNotesPanel` (增强笔记面板)
    * `CompetencyGrowthPanel` (能力成长面板)
      * `CompetencyRadarChart` (能力雷达图)

**数据流:**
1. **配置数据:** `mockResources`, `mockTasks` 从 `@/data/mockLearningData` 导入
2. **能力数据:** `mockLearnerProfile`, `mockCourseCompetencyReport`, `mockAIObservations` 从 `@/data/mockCompetencyData` 导入
3. **类型定义:** `Resource`, `Task`, `CompetencyType` 等从 `@/types/shared-context` 导入
4. **API 交互:** 通过 `/api/chat` endpoint 实现实时对话和能力评估
