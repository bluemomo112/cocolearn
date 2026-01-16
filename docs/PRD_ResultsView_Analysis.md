# PRD: 教师端结果视图页面 - 现状分析与重构方案

## 文档信息

- **创建日期**: 2026-01-14
- **当前版本**: V1.0
- **相关文件**:
  - `src/app/teacher/note-config/results-view.tsx`
  - `src/app/teacher/note-config/page.tsx`
  - `src/app/teacher/note-config/modals.tsx`

---

## 一、当前页面描述

### 1.1 页面定位

当前的 `results-view.tsx` 是一个**教师端学习结果可视化页面**，用于展示学生在某个笔记配置（Note Config）下的学习数据和能力评估结果。

### 1.2 页面入口

- **路径**: `/teacher/note-config?view=results`
- **触发方式**: 在笔记配置页面（Note Config Page）顶部工具栏点击"结果视角"按钮
- **当前位置**: 作为笔记配置页面的三个视角之一（编辑视角、使用视角、**结果视角**）

### 1.3 当前功能模块

#### 1.3.1 统计卡片区域

显示4个核心指标：

- 绑定学生总数（45人）
- 平均完成进度（68%）
- 平均学习时长（42min）
- **平均任务得分（84.5）** ⚠️

#### 1.3.2 能力维度分布

- 展示教师在任务中配置的能力维度（如批判性思维、信息整合等）
- 使用条形图展示每个能力维度的星级分布（1-4星）
- 显示班级平均星级

#### 1.3.3 AI发现的其他能力表现

- 展示AI在学习过程中识别到的额外能力表现
- 显示识别到该能力的学生数量

#### 1.3.4 学生列表

- 表格形式展示所有学生
- 列：学生信息、状态、进度、各能力维度星级、AI发现、操作
- 点击"查看详情"可打开学生详情面板

#### 1.3.5 学生详情面板（弹窗）

包含以下内容：

- 本课程能力评估（雷达图 + 能力卡片）
- 能力详情（可展开查看描述、亮点、待提升、建议、证据）
- 跨课程能力画像（时间线展示）
- 任务完成情况（表格）
- AI发现的额外能力表现

---

## 二、当前页面存在的问题

### 2.1 数据来源不明确 ⚠️⚠️⚠️

#### 问题1: 平均任务得分如何计算？

**现状**:

```typescript
// 在 modals.tsx 中硬编码
<p className="text-2xl font-bold text-gray-800">84.5</p>
<p className="text-sm text-gray-500 mt-1">平均任务得分</p>
```

**问题分析**:

1. **客观题（Quiz）**: 有明确的得分（如选择题、填空题），可以计算平均分
2. **主观题（Assignment）**:
   - 如果启用了AI批改，可能有得分
   - 如果没有启用AI批改，**没有得分数据**
   - 如果教师手动批改，需要批改接口支持
3. **当前实现**: 使用模拟数据，没有真实的数据源

**影响**:

- 如果课程中只有主观题且未启用AI批改，"平均任务得分"将**无法计算**
- 需要区分"有得分的任务"和"无得分的任务"

#### 问题2: 能力维度的星级评分如何生成？

**现状**:

```typescript
// 在 results-view.tsx 中定义了 CompetencyAssessment 接口
export interface CompetencyAssessment {
  type: CompetencyType;
  stars: 1 | 2 | 3 | 4;  // 1-4 星评级
  description: string;
  highlights: string[];
  areasForImprovement: string[];
  suggestions: string[];
  evidence: Evidence[];
}
```

**问题分析**:

1. **数据来源未定义**:
   - 星级评分是AI实时生成的？
   - 还是基于任务得分计算的？
   - 还是基于学习行为分析的？
2. **评估时机未定义**:
   - 学生完成任务后立即评估？
   - 学习过程中持续评估？
   - 教师查看时才生成？
3. **评估依据未定义**:
   - 基于对话内容？
   - 基于笔记质量？
   - 基于任务完成情况？
   - 基于学习行为（如资源访问、时长）？

**影响**:

- 无法确定何时、如何生成能力评估数据
- 可能导致数据不一致或无法生成

### 2.2 边界情况处理不足 ⚠️

#### 问题3: 课程没有主观任务怎么办？

**场景**:

- 教师只配置了客观题（Quiz），没有配置主观题（Assignment）
- 或者教师没有配置任何任务

**当前实现**:

```typescript
// 在 page.tsx 中
const allCompetencies = new Set<CompetencyType>();
config.tasks?.forEach((task: any) => {
  if (task.assignedCompetencies) {
    task.assignedCompetencies.forEach((comp: CompetencyType) => allCompetencies.add(comp));
  }
});
```

**问题**:

1. **能力维度来源**: 只有主观任务（Assignment）才有 `assignedCompetencies` 字段
2. **如果没有主观任务**: `allCompetencies` 将为空，能力维度分布区域将不显示
3. **客观题的能力评估**: 客观题也可以评估能力（如批判性思维），但当前设计未考虑

**影响**:

- 纯客观题课程无法展示能力评估
- 限制了课程设计的灵活性

#### 问题4: 学生还没有开始学习怎么分类？

**场景**:

- 课程刚发布，部分学生还未开始学习
- 部分学生只完成了部分内容

**当前实现**:

```typescript
const mockStudentsRaw = [
  { id: 1, name: '张晓明', status: 'online', progress: 85, ... },
  { id: 3, name: '王浩宇', status: 'offline', progress: 45, ... },
];
```

**问题**:

1. **进度为0的学生**: 没有任何学习数据，无法生成能力评估
2. **部分完成的学生**: 能力评估可能不准确或不完整
3. **学生分类缺失**:
   - 未开始（progress = 0）
   - 进行中（0 < progress < 100）
   - 已完成（progress = 100）
   - 需要帮助（长时间未活跃）

**影响**:

- 无法区分不同学习状态的学生
- 教师难以识别需要关注的学生

### 2.3 视角设计问题 ⚠️⚠️

#### 问题5: 缺少"全班视角"和"学生视角"的Tab切换

**当前实现**:

- 只有一个统一的视图
- 学生列表和班级统计混在一起

**需求**:

1. **全班视角（Class View）**:
   - 班级整体统计
   - 能力维度分布
   - 资源使用情况
   - 任务完成情况
   - 趋势分析
2. **学生视角（Student View）**:
   - 学生列表（可筛选、排序）
   - 单个学生详情
   - 学生对比
   - 学习轨迹

**影响**:

- 信息层级不清晰
- 教师难以快速切换关注点

### 2.4 页面位置不合理 ⚠️⚠️⚠️

#### 问题6: 结果页面放在笔记配置页面合适吗？

**当前设计**:

- 结果视角作为笔记配置页面的三个视角之一
- 路径: `/teacher/note-config?view=results`

**问题分析**:

1. **未发布时的空状态**:

   - 笔记配置未发布时，结果视图是**100%空的**
   - 没有学生数据，没有学习记录
   - 用户体验差
2. **配置与结果的关系**:

   - **配置阶段**: 教师设计课程、配置资源、任务、AI策略
   - **使用阶段**: 学生学习、完成任务
   - **结果阶段**: 教师查看学习数据、评估效果
   - 这三个阶段是**时间上分离**的，不应该在同一个页面
3. **发布与同步问题**:

   - 教师修改配置后，需要**发布**才能同步给学生
   - 如果修改了配置（如增加任务、修改能力维度），已有的学习数据怎么办？
   - 数据版本管理问题
4. **多班级问题**:

   - 一个课程可能绑定多个班级（如"四年级1班"、"四年级2班"）
   - 当前设计没有班级切换功能
   - 无法区分不同班级的数据

**建议的页面结构**:

```
/teacher/course-center (课程中心)
  ├── /course/:courseId/config (配置界面 - 编辑+预览)
  │   ├── 编辑视角 (Edit View)
  │   └── 使用视角 (Use View - 学生端预览)
  │
  └── /course/:courseId/results (结果界面 - 发布后可见)
      ├── 全年级视图 (Grade View - 可选)
      │   ├── 年级统计
      │   ├── 单一班级视角
      │         └── 班级统计
      │         └── 学生视角
```

---

## 三、重构方案

### 3.1 页面架构重构

#### 3.1.1 分离配置页面和结果页面

**配置页面** (`/teacher/course/:courseId/config`)

- **编辑视角**: 配置资源、任务、AI策略
- **使用视角**: 预览学生端界面
- **发布按钮**: 发布配置到班级

**结果页面** (`/teacher/course/:courseId/results`)

- **前置条件**: 课程已发布
- **年级视角**
- **全班视角**: 班级整体数据
- **学生视角**: 单个学生数据

#### 3.1.2 添加班级/年级切换器

**班级视图**:

```typescript
interface ClassSelector {
  mode: 'single' | 'grade';  // 单班级 or 全年级
  selectedClassId?: string;  // 选中的班级ID
  availableClasses: Class[]; // 可用班级列表
}
```

**全年级视图**:

- 聚合所有绑定班级的数据
- 显示班级对比
- 识别年级整体趋势

### 3.2 数据模型设计

#### 3.2.1 能力评估数据生成策略

**方案A:**

```typescript
interface CompetencyEvaluationRequest {
  studentId: string;
  courseId: string;
  competencyType: CompetencyType;
  dataSource: {
    dialogues: Dialogue[];      // 对话记录
    notes: Note[];              // 笔记内容
    tasks: TaskSubmission[];    // 任务提交
    behaviors: LearningBehavior[]; // 学习行为
  };
}

// AI评估接口
async function evaluateCompetency(
  request: CompetencyEvaluationRequest
): Promise<CompetencyAssessment> {
  // 调用AI模型，基于多维度数据生成评估
}
```

**触发时机**:

1. 定期批量生成（如每天凌晨）

#### 3.2.2 任务得分处理

**任务类型与得分**:

```typescript
interface TaskScore {
  taskId: string;
  taskType: 'quiz' | 'assignment';

  // 客观题得分
  quizScore?: {
    score: number;
    maxScore: number;
    percentage: number;
  };

  // 主观题得分（可选）
  assignmentScore?: {
    score: number;
    maxScore: number;
    percentage: number;
    gradedBy: 'ai' | 'teacher' | 'none';
  };

  // 能力评估（独立于得分）
  competencyAssessments: CompetencyAssessment[];
}
```

**平均任务得分计算**:

```typescript
function calculateAverageTaskScore(tasks: TaskScore[]): number | null {
  const scoredTasks = tasks.filter(t =>
    t.quizScore || (t.assignmentScore && t.assignmentScore.gradedBy !== 'none')
  );

  if (scoredTasks.length === 0) return null; // 无可计算得分

  const totalPercentage = scoredTasks.reduce((sum, task) => {
    const percentage = task.quizScore?.percentage
      || task.assignmentScore?.percentage
      || 0;
    return sum + percentage;
  }, 0);

  return totalPercentage / scoredTasks.length;
}
```

**UI展示**:

```typescript
// 如果有得分
<p className="text-2xl font-bold text-gray-800">84.5</p>
<p className="text-sm text-gray-500 mt-1">平均任务得分</p>

// 如果无得分
<p className="text-2xl font-bold text-gray-400">--</p>
<p className="text-sm text-gray-500 mt-1">暂无可计算得分</p>
<p className="text-xs text-gray-400 mt-1">
  (课程中无客观题或主观题未批改)
</p>
```

#### 3.2.3 学生状态分类

```typescript
enum StudentLearningStatus {
  NOT_STARTED = 'not_started',      // 未开始
  IN_PROGRESS = 'in_progress',      // 进行中
  COMPLETED = 'completed',          // 已完成
  NEED_ATTENTION = 'need_attention' // 需要关注
}

interface StudentStatusClassification {
  status: StudentLearningStatus;
  progress: number;
  lastActiveTime: Date;

  // 分类逻辑
  static classify(student: Student): StudentLearningStatus {
    if (student.progress === 0) return NOT_STARTED;
    if (student.progress === 100) return COMPLETED;

    const hoursSinceActive = (Date.now() - student.lastActiveTime) / 3600000;
    if (hoursSinceActive > 48) return NEED_ATTENTION;

    return IN_PROGRESS;
  }
}
```

**UI展示**:

```typescript
// 学生列表筛选器
<div className="flex gap-2">
  <button className={status === 'all' ? 'active' : ''}>
    全部 (45)
  </button>
  <button className={status === 'in_progress' ? 'active' : ''}>
    进行中 (28)
  </button>
  <button className={status === 'completed' ? 'active' : ''}>
    已完成 (12)
  </button>
  <button className={status === 'not_started' ? 'active' : ''}>
    未开始 (3)
  </button>
  <button className={status === 'need_attention' ? 'active' : ''}>
    需要关注 (2)
  </button>
</div>
```

### 3.3 UI/UX 改进

#### 3.3.1 添加Tab切换

```typescript
type ResultsViewTab = 'class' | 'student';

function ResultsViewHeader() {
  const [activeTab, setActiveTab] = useState<ResultsViewTab>('class');

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab('class')}
        className={activeTab === 'class' ? 'active' : ''}
      >
        <Users size={16} />
        全班视角
      </button>
      <button
        onClick={() => setActiveTab('student')}
        className={activeTab === 'student' ? 'active' : ''}
      >
        <User size={16} />
        学生视角
      </button>
    </div>
  );
}
```

#### 3.3.2 班级/年级切换器

```typescript
function ClassSelector() {
  const [mode, setMode] = useState<'single' | 'grade'>('single');
  const [selectedClass, setSelectedClass] = useState<string>('class-1');

  return (
    <div className="flex items-center gap-3">
      {/* 模式切换 */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode('single')}
          className={mode === 'single' ? 'active' : ''}
        >
          单班级
        </button>
        <button
          onClick={() => setMode('grade')}
          className={mode === 'grade' ? 'active' : ''}
        >
          全年级
        </button>
      </div>

      {/* 班级选择器 */}
      {mode === 'single' && (
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="class-1">四年级1班</option>
          <option value="class-2">四年级2班</option>
          <option value="class-3">四年级3班</option>
        </select>
      )}
    </div>
  );
}
```

#### 3.3.3 空状态处理

**未发布状态**:

```typescript
function UnpublishedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        课程尚未发布
      </h3>
      <p className="text-gray-500 mb-6">
        发布课程后，学生开始学习，这里将显示学习数据和能力评估
      </p>
      <button className="btn-primary">
        前往发布课程
      </button>
    </div>
  );
}
```

**无学生数据状态**:

```typescript
function NoStudentDataEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Users size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        暂无学生学习数据
      </h3>
      <p className="text-gray-500 mb-6">
        课程已发布，等待学生开始学习
      </p>
      <div className="text-sm text-gray-400">
        <p>已绑定班级: 四年级1班、四年级2班</p>
        <p>已绑定学生: 45人</p>
        <p>已开始学习: 0人</p>
      </div>
    </div>
  );
}
```

### 3.4 数据版本管理

#### 3.4.1 配置变更处理

**场景**: 教师修改了配置（如增加能力维度、修改任务）

**方案**:

```typescript
interface CourseConfigVersion {
  versionId: string;
  publishedAt: Date;
  config: NoteConfig;

  // 变更类型
  changes: {
    type: 'add_competency' | 'remove_competency' | 'add_task' | 'remove_task';
    details: any;
  }[];
}

// 数据迁移策略
interface DataMigrationStrategy {
  // 新增能力维度：重新评估所有学生
  onAddCompetency(competency: CompetencyType): Promise<void>;

  // 删除能力维度：保留历史数据，但不再显示
  onRemoveCompetency(competency: CompetencyType): Promise<void>;

  // 新增任务：学生需要补做
  onAddTask(task: Task): Promise<void>;

  // 删除任务：保留历史数据
  onRemoveTask(taskId: string): Promise<void>;
}
```

**UI提示**:

```typescript
function ConfigChangeWarning() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} className="text-amber-600" />
        <h4 className="font-bold text-amber-800">配置已变更</h4>
      </div>
      <p className="text-sm text-amber-700 mb-3">
        您在 2026-01-13 修改了课程配置，部分学生的数据可能不完整
      </p>
      <div className="flex gap-2">
        <button className="btn-sm btn-primary">
          查看变更详情
        </button>
        <button className="btn-sm btn-secondary">
          重新评估所有学生
        </button>
      </div>
    </div>
  );
}
```

---

## 七、总结

当前的结果视图页面存在以下核心问题：

1. **数据来源不明确**（平均任务得分、能力星级）
2. **边界情况处理不足**（无主观任务、未开始学习）
3. **视角设计缺失**（缺少全班/学生视角切换）
4. **页面位置不合理**（应该独立于配置页面）

建议的重构方案：

1. **分离配置页面和结果页面**
2. **添加全班视角和学生视角的Tab切换**
3. **实现班级/年级切换器**
4. **明确数据生成策略和计算逻辑**
5. **处理各种边界情况和空状态**

通过这些改进，可以显著提升教师端结果视图的可用性和用户体验。
