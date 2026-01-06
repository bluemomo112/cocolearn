# 功能对比分析：HTML vs TypeScript 实现

## 📊 功能完整度概览

| 功能模块 | HTML版本 | TypeScript版本 | 差异程度 |
|---------|---------|---------------|---------|
| 视角切换系统 | ✅ 完整 | ❌ 缺失 | 🔴 严重 |
| 可调整面板 | ✅ 完整 | ❌ 缺失 | 🔴 严重 |
| 跨学科配置 | ✅ 完整 | ❌ 缺失 | 🔴 严重 |
| 知识点库集成 | ✅ 完整 | ❌ 缺失 | 🔴 严重 |
| 结果视图 | ✅ 完整 | ❌ 缺失 | 🔴 严重 |
| AI题目生成配置 | ✅ 完整 | 🟡 简化 | 🟠 中等 |
| AI批改Agent | ✅ 完整 | 🟡 简化 | 🟠 中等 |
| 资源管理 | ✅ 完整 | 🟡 简化 | 🟠 中等 |
| 任务管理 | ✅ 完整 | 🟡 简化 | 🟠 中等 |
| 笔记模板 | ✅ 完整 | 🟡 简化 | 🟢 轻微 |
| 元认知监控 | ✅ 完整 | ✅ 完整 | 🟢 轻微 |

---

## 🔴 严重缺失功能（优先级1）

### 1. 视角切换系统 (Perspective Switching)

**HTML实现：**
```javascript
const [viewPerspective, setViewPerspective] = useState<'edit' | 'use' | 'results'>('edit');

// 三种完整视图
if (viewPerspective === 'use') {
  return <UseView />;
}
if (viewPerspective === 'results') {
  return <ResultsView />;
}
// Default: Edit view
```

**TypeScript实现：**
```typescript
const [isPreviewMode, setIsPreviewMode] = useState(false);
// 仅有编辑/预览两种模式，无结果视图
```

**影响：**
- 教师无法查看学生学习数据
- 缺少完整的教学闭环
- URL参数路由功能缺失（?view=use|results|edit）

---

### 2. 可调整面板宽度 (Resizable Panels)

**HTML实现：**
```javascript
// 自定义Resizer组件
function Resizer({ onResize, position }) {
  // 支持拖拽调整左右面板宽度
  const handleMouseDown = (e) => {
    // 完整的拖拽逻辑
  };
}

const [leftWidth, setLeftWidth] = useState(25);
const [rightWidth, setRightWidth] = useState(25);
```

**TypeScript实现：**
```typescript
const [leftWidth, setLeftWidth] = useState(20);
const [rightWidth, setRightWidth] = useState(30);
// 固定宽度，无拖拽功能
```

**影响：**
- 用户体验降低
- 无法根据内容调整布局

---

### 3. 跨学科配置 (Cross-disciplinary Configuration)

**HTML实现：**
```javascript
noteInfo: {
  title: '跨学科探究：水资源与环境',
  subjects: ['科学', '地理', '环境教育'], // 多学科数组
  grade: '四年级',
  bindClasses: ['四年级1班', '四年级2班'],
  knowledgePoints: [
    { id: 'kp1', subject: '科学', point: '水循环', source: 'library' },
    { id: 'kp2', subject: '地理', point: '水文特征', source: 'library' },
    { id: 'kp3', subject: '环境教育', point: '水资源保护意识', source: 'custom' },
  ],
}
```

**TypeScript实现：**
```typescript
noteInfo: {
  title: string;
  description: string;
}
// 无学科、年级、班级、知识点配置
```

**影响：**
- 无法支持跨学科教学
- 缺少知识点管理
- 缺少班级绑定功能

---

### 4. 知识点库集成 (Knowledge Points Library)

**HTML实现：**
```javascript
const KNOWLEDGE_POINTS_LIBRARY = {
  '科学': [
    { id: 'sci_001', point: '水的三态变化', difficulty: '基础' },
    { id: 'sci_002', point: '水循环过程', difficulty: '中级' },
  ],
  '地理': [...],
  '环境教育': [...],
};
```

**TypeScript实现：**
- 完全缺失

**影响：**
- 无法快速选择标准知识点
- 知识体系不完整

---

### 5. 结果视图与学习数据 (Results View)

**HTML实现：**
```javascript
function ResultsViewDashboard({ config }) {
  const mockStudents = [...]; // 学生列表
  const mockResourceViews = [...]; // 资源查看统计
  const mockTaskCompletions = [...]; // 任务完成统计

  return (
    <div>
      {/* 统计卡片 */}
      {/* 资源查看表格 */}
      {/* 任务完成表格 */}
    </div>
  );
}
```

**TypeScript实现：**
- 完全缺失

**影响：**
- 教师无法监控学生学习进度
- 无数据驱动的教学决策支持

---

## 🟠 中等差异功能（优先级2）

### 6. AI题目生成配置

**HTML实现：**
- 完整配置面板（AIGenConfigPanel）
- 支持题型选择（单选/多选/填空/判断/简答）
- 支持题目数量设置
- 支持难度级别选择
- 支持自定义生成提示词
- 显示生成历史和时间戳

**TypeScript实现：**
- 简单按钮触发
- 固定生成2道选择题
- 无配置界面

---

### 7. AI批改Agent库

**HTML实现：**
```javascript
const GRADING_AGENTS_LIBRARY = [
  {
    id: 'agent_default',
    name: '通用作业批改助手',
    description: '适用于各学科的通用批改，提供客观评价和建议',
    type: 'system',
    difyConfig: { agentId: 'dify_grading_001' }
  },
  // 更多专业批改Agent
];
```

**TypeScript实现：**
- 简化版GRADING_AGENTS
- 无Dify集成配置
- 无自定义批改标准

---

### 8. 高级资源管理

**HTML差异功能：**
- 拖拽排序资源列表
- 内联编辑资源标题
- 三点菜单（编辑/删除/预览）
- 资源使用统计
- 从资源库拖入资源

---

### 9. 高级任务管理

**HTML差异功能：**
- 任务拖拽排序
- 任务生成时间戳记录
- AI生成历史追踪
- 更多题型支持（多选题/填空题）

---

## 🟢 轻微差异功能（优先级3）

### 10. 笔记模板可视化

**HTML：** 详细的模板预览可视化
**TypeScript：** 基础占位预览

### 11. Workflow阶段提示词

**HTML：** 完整的折叠/展开UI，支持查看默认提示词
**TypeScript：** 功能存在但UI更简洁

---

## 📋 数据结构对比

### HTML的INITIAL_TEACHER_CONFIG
```javascript
{
  noteInfo: {
    title, subjects[], grade, bindClasses[], knowledgePoints[]
  },
  resources: [...],
  tasks: [...],
  interactionConfig: {
    freeMode: { selectedAgentId, teacherPrompt, enableFence },
    guidedMode: { selectedWorkflowId, stagePrompts }
  },
  outputConfig: {
    noteTemplate, templateCustomization, enableSubmit,
    metacognitionStrategy, metacognitionPrompt
  },
  publishMode: 'self-study' | 'in-class'
}
```

### TypeScript的NoteConfig
```typescript
{
  noteInfo: { title, description },
  resources: [...],
  tasks: [...],
  interactionMode: 'free' | 'guided', // 扁平化而非nested
  freeConfig: {...},
  guidedConfig: {...},
  outputConfig: {...}
}
// 缺少：publishMode, templateCustomization, knowledgePoints等
```

---

## 🎯 迁移优先级建议

### Phase 1: 核心架构（1-2天）
1. ✅ 视角切换系统（Edit/Use/Results）
2. ✅ 可调整面板组件（Resizer）

### Phase 2: 数据完整性（1-2天）
3. ✅ 跨学科配置（NoteInfoModal增强）
4. ✅ 知识点库集成

### Phase 3: 高级功能（2-3天）
5. ✅ 结果视图仪表板
6. ✅ AI题目生成配置面板
7. ✅ AI批改Agent库

### Phase 4: 用户体验（1-2天）
8. ✅ 资源拖拽排序
9. ✅ 任务拖拽排序
10. ✅ iframe预览与postMessage通信

---

## 💡 技术考量

### 需要新增的依赖
- `react-beautiful-dnd` 或 `@dnd-kit/core` - 拖拽功能
- 或使用原生HTML5 Drag and Drop API

### 需要创建的新组件
1. `Resizer.tsx` - 面板调整组件
2. `ResultsViewDashboard.tsx` - 结果视图仪表板
3. `NoteInfoModal.tsx` - 增强的笔记信息配置
4. `AIGenConfigPanel.tsx` - AI生成配置面板
5. `UseViewHeader.tsx` 和 `ResultsViewHeader.tsx` - 视角切换头部

### 需要修改的现有文件
- `page.tsx` - 添加视角切换逻辑
- `modals.tsx` - 增强模态框功能
- 新增 `types.ts` - 统一类型定义

---

**总结：** TypeScript版本已有基础框架，但缺失约40%的高级功能。需要系统性迁移以实现完整功能对等。
