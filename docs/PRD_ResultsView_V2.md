# PRD: 教师端结果视图页面 - 现状分析与重构方案 V2

## 文档信息

- **创建日期**: 2026-01-14
- **版本**: V2.0 (简化版)
- **相关文件**:
  - `src/app/teacher/note-config/results-view.tsx` (教师端结果视图组件)
  - `src/app/student/workbench/page.tsx` (学生端工作台)
  - `src/data/mockCompetencyData.ts` (能力数据模型)

---

## 一、用户视角：教师看到什么？学生看到什么？

### 1.1 学生端看到什么？

**位置**: `/student/workbench` (学生工作台)

**右侧面板 - 学习元数据区域**:

1. **本课程能力画像** (雷达图)
   - 显示3个能力维度的星级 (1-4星)
   - 例如: 批判性思维 3星、信息整合 2星、元认知 2星

2. **AI实时观察**
   - 显示AI在学习过程中的实时反馈
   - 类型: 赞赏、建议、洞察
   - 例如: "你在对话中提出了很好的质疑，展现了批判性思维"

3. **跨课程能力画像** (可折叠)
   - 显示学生在多门课程中的能力发展趋势
   - 每个能力显示: 星级、趋势(↗/→/↘)、涉及课程数

**数据更新时机**:
- 学生提交任务后，AI返回能力评估更新
- 学生与AI对话时，AI实时观察并更新

### 1.2 教师端看到什么？

**位置**: `/teacher/note-config?view=results` (当前位置，需要重构)

**当前显示内容**:

1. **统计卡片** (4个)
   - 绑定学生总数: 45人
   - 平均完成进度: 68%
   - 平均学习时长: 42min
   - **平均任务得分: 84.5** ⚠️ (问题: 如何计算？)

2. **能力维度分布** (条形图)
   - 显示每个能力维度的星级分布 (1-4星)
   - 例如: 批判性思维 - 4星12人、3星18人、2星10人、1星5人
   - 显示班级平均星级

3. **AI发现的其他能力表现**
   - 显示AI识别到的额外能力
   - 例如: 元认知 - 15名学生展现了良好的自我反思能力

4. **学生列表** (表格)
   - 列: 学生信息、状态、进度、各能力维度星级、AI发现、操作
   - 点击"查看详情"打开学生详情弹窗

5. **学生详情弹窗**
   - 本课程能力评估 (雷达图 + 能力卡片)
   - 能力详情 (描述、亮点、待提升、建议、证据)
   - 跨课程能力画像 (时间线)
   - 任务完成情况 (表格)
   - AI发现的额外能力表现

---

## 二、数据流：数据从哪儿来？怎么算的？

### 2.1 核心数据模型

基于 `src/data/mockCompetencyData.ts` 的定义:

```typescript
// 能力类型 (6种)
type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// 能力评级 (1-4星)
type CompetencyRating = 1 | 2 | 3 | 4;

// 单个能力的评估
interface CompetencyAssessment {
  rating: CompetencyRating;        // 星级
  description: string;             // 描述性评价
  highlights: string;              // 亮点
  areasForImprovement: string;     // 待提升
  suggestions: string;             // 建议
  evidence: string[];              // 支持证据
}

// 学生的能力画像
interface LearnerProfile {
  studentId: string;
  studentName: string;

  // 全局能力画像 (跨课程)
  globalCompetencies: {
    [key in CompetencyType]?: {
      overallRating: CompetencyRating;  // 综合评级
      history: CompetencyHistoryItem[]; // 历史记录
      trend: 'ascending' | 'stable' | 'descending';
      confidence: number;               // 置信度
      latestObservation: string;        // 最新观察
    };
  };
}

// 本课程的能力评估报告
interface CourseCompetencyReport {
  courseId: string;
  courseName: string;

  // 教师指定的能力评估 (必评)
  assignedCompetencies: {
    [key in CompetencyType]?: CompetencyAssessment;
  };

  // AI识别的能力评估 (选评)
  detectedCompetencies: {
    [key in CompetencyType]?: CompetencyAssessment & {
      confidence: number;  // AI置信度
    };
  };
}
```

### 2.2 数据流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      学生学习过程                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  学生行为数据收集                                              │
│  - 对话记录 (dialogues)                                       │
│  - 笔记内容 (notes)                                           │
│  - 任务提交 (task submissions)                                │
│  - 学习行为 (learning behaviors: 资源访问、时长等)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  AI能力评估引擎                                                │
│  输入: 学生行为数据 + 教师配置的能力维度                         │
│  输出: CompetencyAssessment (星级 + 描述 + 证据)               │
│                                                               │
│  触发时机:                                                     │
│  1. 学生提交任务后 (立即评估)                                   │
│  2. 学生与AI对话时 (实时观察)                                   │
│  3. 教师查看结果页面时 (按需生成/缓存读取)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  数据存储                                                      │
│  - 学生个人能力画像 (LearnerProfile)                           │
│  - 本课程能力评估 (CourseCompetencyReport)                     │
│  - 任务得分记录 (TaskScore)                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  教师端结果视图                                                 │
│  - 班级统计 (聚合所有学生数据)                                  │
│  - 能力分布 (按星级统计)                                        │
│  - 学生列表 (单个学生数据)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 关键问题解答

#### Q1: 平均任务得分如何计算？

**答案**: 分两种情况

1. **客观题 (Quiz)**:
   - 有明确的正确答案
   - 提交后立即判分
   - 得分 = (正确题数 / 总题数) × 100

2. **主观题 (Assignment/Reflection)**:
   - 如果启用AI批改: AI返回得分 (0-100)
   - 如果未启用AI批改: **无得分**
   - 如果教师手动批改: 教师给分 (0-100)

**计算公式**:
```typescript
function calculateAverageTaskScore(students: Student[]): number | null {
  let totalScore = 0;
  let scoredTaskCount = 0;

  students.forEach(student => {
    student.taskSubmissions.forEach(submission => {
      if (submission.score !== null) {  // 只统计有得分的任务
        totalScore += submission.score;
        scoredTaskCount++;
      }
    });
  });

  if (scoredTaskCount === 0) return null;  // 无可计算得分
  return totalScore / scoredTaskCount;
}
```

**UI展示**:
- 如果有得分: 显示 "84.5"
- 如果无得分: 显示 "--" + 提示 "暂无可计算得分 (课程中无客观题或主观题未批改)"

#### Q2: 能力维度的星级评分如何生成？

**答案**: AI评估引擎生成

**评估依据** (多维度综合):
1. **任务表现**:
   - 客观题: 正确率、答题速度
   - 主观题: 内容质量、深度、创新性

2. **对话质量**:
   - 提问深度 (影响 question_quality)
   - 批判性思考 (影响 critical_thinking)
   - 自我反思 (影响 metacognition)

3. **笔记质量**:
   - 信息整合能力 (影响 information_synthesis)
   - 结构化程度
   - 关键概念提取

4. **学习行为**:
   - 资源访问模式
   - 学习时长
   - 坚持性 (影响 persistence)

**评估时机**:
- **实时评估**: 学生提交任务后、与AI对话时
- **按需生成**: 教师查看结果页面时 (如果缓存过期)
- **批量生成**: 每天凌晨批量更新 (可选)

**星级映射**:
```typescript
// AI返回的是0-100的分数，映射到1-4星
function scoreToStars(score: number): CompetencyRating {
  if (score >= 85) return 4;  // 优秀
  if (score >= 70) return 3;  // 良好
  if (score >= 55) return 2;  // 及格
  return 1;                   // 待提升
}
```

#### Q3: 教师配置的能力维度从哪儿来？

**答案**: 教师在配置任务时指定

**当前实现**:
```typescript
interface Task {
  id: string;
  type: 'quiz' | 'assignment' | 'reflection';
  title: string;

  // 教师指定的能力维度 (仅主观题有)
  assignedCompetencies?: CompetencyType[];
}
```

**问题**:
- 只有主观题 (Assignment) 才有 `assignedCompetencies` 字段
- 客观题 (Quiz) 没有能力维度配置
- 如果课程只有客观题，能力维度分布区域将为空

**解决方案**:
- 客观题也应该支持能力维度配置
- 或者: AI自动识别客观题考察的能力维度

---

## 三、当前页面存在的核心问题

### 问题1: 页面位置不合理 ⚠️⚠️⚠️

**现状**: 结果视角作为笔记配置页面的三个视角之一

**问题**:
1. **未发布时100%空白**: 没有学生数据，用户体验差
2. **配置与结果混淆**: 配置阶段和结果阶段是时间上分离的
3. **多班级切换缺失**: 一个课程可能绑定多个班级，无法切换
4. **全年级视图缺失**: 无法查看全年级的整体数据

**建议的页面结构**:
```
/teacher/course-center (课程中心)
  │
  ├── /course/:courseId/config (配置界面)
  │   ├── 编辑视角 (Edit View)
  │   └── 使用视角 (Use View - 学生端预览)
  │
  └── /course/:courseId/results (结果界面 - 发布后可见)
      │
      ├── 全年级视图 (可选)
      │   ├── 年级统计
      │   └── 班级对比
      │
      └── 单班级视图
          ├── 全班视角 (Class View)
          │   ├── 班级统计
          │   ├── 能力分布
          │   └── 资源/任务统计
          │
          └── 学生视角 (Student View)
              ├── 学生列表 (可筛选、排序)
              └── 学生详情
```

### 问题2: 缺少全班/学生视角切换 ⚠️⚠️

**现状**: 只有一个统一的视图，班级统计和学生列表混在一起

**需求**: 添加Tab切换

```typescript
type ResultsViewTab = 'class' | 'student';

// 全班视角 (Class View)
- 班级整体统计 (4个卡片)
- 能力维度分布 (条形图)
- 资源使用情况 (表格)
- 任务完成情况 (表格)
- AI发现的能力表现

// 学生视角 (Student View)
- 学生筛选器 (全部/进行中/已完成/未开始/需要关注)
- 学生列表 (表格)
- 学生详情 (弹窗)
```

### 问题3: 学生状态分类缺失 ⚠️

**现状**: 无法区分不同学习状态的学生

**需求**: 添加学生状态分类

```typescript
enum StudentLearningStatus {
  NOT_STARTED = 'not_started',      // 未开始 (progress = 0)
  IN_PROGRESS = 'in_progress',      // 进行中 (0 < progress < 100)
  COMPLETED = 'completed',          // 已完成 (progress = 100)
  NEED_ATTENTION = 'need_attention' // 需要关注 (48小时未活跃)
}
```

**UI展示**:
```
[全部 (45)] [进行中 (28)] [已完成 (12)] [未开始 (3)] [需要关注 (2)]
```

### 问题4: 客观题无法配置能力维度 ⚠️

**现状**: 只有主观题 (Assignment) 才有 `assignedCompetencies` 字段

**问题**:
- 纯客观题课程无法展示能力评估
- 限制了课程设计的灵活性

**解决方案**:
1. **方案A**: 客观题也支持能力维度配置
   ```typescript
   interface Task {
     assignedCompetencies?: CompetencyType[];  // 所有任务类型都支持
   }
   ```

2. **方案B**: AI自动识别客观题考察的能力维度
   ```typescript
   // AI分析题目内容，自动标注能力维度
   const detectedCompetencies = await analyzeQuizCompetencies(quiz);
   ```

**推荐**: 方案A (教师手动配置) + 方案B (AI辅助建议)

### 问题5: 数据版本管理缺失 ⚠️

**场景**: 教师修改了配置 (如增加能力维度、修改任务)

**问题**:
- 已有的学习数据怎么办？
- 新增能力维度如何评估？
- 删除能力维度如何处理？

**解决方案**:
```typescript
interface CourseConfigVersion {
  versionId: string;
  publishedAt: Date;
  config: NoteConfig;
  changes: ConfigChange[];
}

// 数据迁移策略
- 新增能力维度: 重新评估所有学生 (异步任务)
- 删除能力维度: 保留历史数据，但不再显示
- 新增任务: 学生需要补做
- 删除任务: 保留历史数据
```

**UI提示**:
```
⚠️ 配置已变更
您在 2026-01-13 修改了课程配置，部分学生的数据可能不完整
[查看变更详情] [重新评估所有学生]
```

---

## 四、重构方案

### 4.1 页面架构重构

#### Step 1: 分离配置页面和结果页面

**配置页面** (`/teacher/course/:courseId/config`)
- 编辑视角: 配置资源、任务、AI策略
- 使用视角: 预览学生端界面
- 发布按钮: 发布配置到班级

**结果页面** (`/teacher/course/:courseId/results`)
- 前置条件: 课程已发布
- 全年级视图 (可选)
- 单班级视图 (全班视角 + 学生视角)

#### Step 2: 添加班级/年级切换器

```typescript
// 顶部切换器
<div className="flex items-center gap-3">
  {/* 模式切换 */}
  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
    <button onClick={() => setMode('single')}>单班级</button>
    <button onClick={() => setMode('grade')}>全年级</button>
  </div>

  {/* 班级选择器 (单班级模式) */}
  {mode === 'single' && (
    <select value={selectedClass} onChange={...}>
      <option value="class-1">四年级1班</option>
      <option value="class-2">四年级2班</option>
    </select>
  )}
</div>
```

#### Step 3: 添加全班/学生视角Tab

```typescript
// Tab切换
<div className="flex gap-2">
  <button onClick={() => setTab('class')}>
    <Users size={16} />
    全班视角
  </button>
  <button onClick={() => setTab('student')}>
    <User size={16} />
    学生视角
  </button>
</div>

// 内容区域
{tab === 'class' && <ClassView />}
{tab === 'student' && <StudentView />}
```

### 4.2 数据模型完善

#### 任务得分模型

```typescript
interface TaskSubmission {
  taskId: string;
  studentId: string;
  submittedAt: Date;

  // 得分 (可能为null)
  score: number | null;  // 0-100
  maxScore: number;      // 100

  // 得分来源
  gradedBy: 'auto' | 'ai' | 'teacher' | 'none';

  // 能力评估 (独立于得分)
  competencyAssessments: CompetencyAssessment[];
}
```

#### 学生状态模型

```typescript
interface StudentStatus {
  studentId: string;
  status: StudentLearningStatus;
  progress: number;  // 0-100
  lastActiveAt: Date;

  // 分类逻辑
  static classify(student: Student): StudentLearningStatus {
    if (student.progress === 0) return 'not_started';
    if (student.progress === 100) return 'completed';

    const hoursSinceActive = (Date.now() - student.lastActiveAt) / 3600000;
    if (hoursSinceActive > 48) return 'need_attention';

    return 'in_progress';
  }
}
```

### 4.3 UI/UX改进

#### 空状态处理

**未发布状态**:
```typescript
<div className="empty-state">
  <AlertCircle size={64} />
  <h3>课程尚未发布</h3>
  <p>发布课程后，学生开始学习，这里将显示学习数据和能力评估</p>
  <button>前往发布课程</button>
</div>
```

**无学生数据状态**:
```typescript
<div className="empty-state">
  <Users size={64} />
  <h3>暂无学生学习数据</h3>
  <p>课程已发布，等待学生开始学习</p>
  <div className="stats">
    <p>已绑定班级: 四年级1班、四年级2班</p>
    <p>已绑定学生: 45人</p>
    <p>已开始学习: 0人</p>
  </div>
</div>
```

#### 学生筛选器

```typescript
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

---

## 五、实施计划

### Phase 1: 页面分离 (优先级: 高)
- [ ] 创建独立的结果页面路由 `/teacher/course/:courseId/results`
- [ ] 从配置页面移除"结果视角"
- [ ] 添加"查看结果"按钮 (仅在课程已发布时显示)
- [ ] 实现未发布状态的空状态页面

### Phase 2: Tab切换 (优先级: 高)
- [ ] 实现全班视角和学生视角的Tab切换
- [ ] 重构现有组件，分离全班数据和学生数据
- [ ] 实现班级/年级切换器

### Phase 3: 数据模型 (优先级: 高)
- [ ] 完善任务得分模型 (支持null得分)
- [ ] 实现学生状态分类
- [ ] 处理无得分任务的UI展示
- [ ] 客观题支持能力维度配置

### Phase 4: 边界情况 (优先级: 中)
- [ ] 处理无主观任务的课程
- [ ] 处理未开始学习的学生
- [ ] 实现学生筛选和排序
- [ ] 添加空状态提示

### Phase 5: 数据版本管理 (优先级: 中)
- [ ] 实现配置版本管理
- [ ] 实现数据迁移策略
- [ ] 添加配置变更提示

### Phase 6: 优化与测试 (优先级: 低)
- [ ] 性能优化 (大量学生数据)
- [ ] 响应式设计
- [ ] 单元测试
- [ ] E2E测试

---

## 六、关键决策

### 决策1: 能力评估数据生成
**决策**: AI实时评估 + 缓存

**理由**:
- 学生提交任务后立即评估，提供即时反馈
- 教师查看时从缓存读取，避免重复计算
- 每天凌晨批量更新，保持数据新鲜度

### 决策2: 页面位置
**决策**: 分离配置页面和结果页面

**理由**:
- 配置和结果是不同的工作流阶段
- 未发布时结果页面为空，用户体验差
- 多班级管理需要独立的结果页面

### 决策3: 班级视图
**决策**: 支持单班级和全年级两种模式

**理由**:
- 教师需要查看单个班级的详细数据
- 教师也需要对比不同班级的表现
- 全年级视图有助于识别整体趋势

---

## 七、总结

### 核心问题
1. **页面位置不合理** - 应该独立于配置页面
2. **视角设计缺失** - 缺少全班/学生视角切换
3. **学生状态分类缺失** - 无法识别需要关注的学生
4. **客观题无法配置能力维度** - 限制了课程设计
5. **数据版本管理缺失** - 配置变更后数据不一致

### 重构方案
1. **分离配置页面和结果页面**
2. **添加全班视角和学生视角的Tab切换**
3. **实现班级/年级切换器**
4. **完善数据模型** (任务得分、学生状态)
5. **处理边界情况和空状态**

### 与学生端的一致性
- **数据模型统一**: 使用相同的 `CompetencyType`、`CompetencyRating`
- **能力评估统一**: 教师端看到的星级 = 学生端看到的星级
- **AI观察统一**: 教师端可以看到学生端的AI实时观察
- **跨课程画像统一**: 教师端可以看到学生的跨课程能力发展趋势
