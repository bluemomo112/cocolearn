/**
 * Demo 场景数据
 * 用于交互式演示系统的预设场景数据
 */

import { Resource, Task } from '@cross/self-learn';

// ============ 场景 A：任意文件上传（脚本化对话演示）============
export const arbitraryFileScenario = {
  // 脚本化对话序列
  dialogueScript: [
    {
      id: 'arb-1',
      role: 'assistant' as const,
      content: '我已经收到你的资料，让我看看...',
      timestamp: new Date(),
    },
    {
      id: 'arb-2',
      role: 'assistant' as const,
      content: '这份资料主要讲解了**植物光合作用**的相关知识，包含以下要点：\n\n📌 **核心概念**\n• 光合作用的定义和意义\n• 光反应和暗反应的过程\n• 影响光合作用的因素\n\n📌 **重点内容**\n• 叶绿体的结构和功能\n• 光合作用的化学方程式\n• 实验设计和数据分析',
      timestamp: new Date(),
    },
    {
      id: 'arb-3',
      role: 'assistant' as const,
      content: '为了帮助你更好地掌握这些知识，我为你生成了几道练习题。',
      timestamp: new Date(),
    },
  ],

  // 练习任务
  practiceTask: {
    id: 'practice-photosynthesis',
    type: 'practice' as const,
    title: '光合作用练习题',
    status: 'available' as const,
    questionCount: 3,
    questions: [
      {
        id: 'ph1',
        type: 'single_choice' as const,
        content: '光合作用的主要产物是什么？',
        options: ['氧气和葡萄糖', '二氧化碳和水', '氮气和蛋白质', '氢气和脂肪'],
        answer: 'A',
        explanation: '光合作用将 CO₂ 和 H₂O 转化为葡萄糖（C₆H₁₂O₆）和氧气（O₂）。',
        points: 10,
      },
      {
        id: 'ph2',
        type: 'single_choice' as const,
        content: '叶绿体中进行光反应的场所是？',
        options: ['基质', '类囊体薄膜', '外膜', '内膜'],
        answer: 'B',
        explanation: '光反应在类囊体薄膜上进行，暗反应在叶绿体基质中进行。',
        points: 10,
      },
      {
        id: 'ph3',
        type: 'single_choice' as const,
        content: '下列哪个因素不直接影响光合作用速率？',
        options: ['光照强度', '温度', 'CO₂浓度', '土壤湿度'],
        answer: 'D',
        explanation: '光照强度、温度和 CO₂ 浓度是影响光合速率的三大主要因素。土壤湿度影响植物吸水，但不直接影响光合作用。',
        points: 10,
      },
    ],
  },
};

// ============ 场景 B：空白试卷上传（交互式答题）============
export const blankExamScenario = {
  welcomeMessage: '我已经为你提取了试卷中的题目，你可以开始答题了',

  questions: [
    {
      id: 'q1',
      type: 'single_choice' as const,
      content: '下列哪个是质数？',
      options: ['4', '6', '7', '9'],
      answer: 'C',
      explanation: '质数是只能被 1 和自身整除的大于 1 的自然数。7 只能被 1 和 7 整除，因此是质数。',
      points: 5,
    },
    {
      id: 'q2',
      type: 'single_choice' as const,
      content: '计算：3 × 4 + 2 = ?',
      options: ['10', '12', '14', '16'],
      answer: 'C',
      explanation: '根据运算顺序，先算乘法：3 × 4 = 12，再算加法：12 + 2 = 14。',
      points: 5,
    },
    {
      id: 'q3',
      type: 'single_choice' as const,
      content: '下列哪个数是偶数？',
      options: ['3', '5', '8', '9'],
      answer: 'C',
      explanation: '偶数是能被 2 整除的整数。8 ÷ 2 = 4，因此 8 是偶数。',
      points: 5,
    },
    {
      id: 'q4',
      type: 'single_choice' as const,
      content: '一个长方形的长是 6cm，宽是 4cm，它的周长是多少？',
      options: ['10cm', '20cm', '24cm', '30cm'],
      answer: 'B',
      explanation: '长方形周长 = 2 × (长 + 宽) = 2 × (6 + 4) = 2 × 10 = 20cm。',
      points: 10,
    },
    {
      id: 'q5',
      type: 'single_choice' as const,
      content: '下列哪个分数最大？',
      options: ['1/2', '1/3', '2/3', '1/4'],
      answer: 'C',
      explanation: '通分后比较：1/2 = 6/12，1/3 = 4/12，2/3 = 8/12，1/4 = 3/12。因此 2/3 最大。',
      points: 10,
    },
  ],
};

// ============ 场景 C：批量学生答卷上传（成绩识别与分析）============
export const multiStudentScenario = {
  // 多份学生试卷资源
  resources: [
    {
      id: 'student-exam-001',
      title: '张三的数学试卷（已批改）',
      type: 'document' as const,
      description: '得分：60/100，错题集中在质数判断和应用题',
      source: 'student' as const,
    },
    {
      id: 'student-exam-002',
      title: '李四的数学试卷（已批改）',
      type: 'document' as const,
      description: '得分：75/100，计算准确但概念理解有偏差',
      source: 'student' as const,
    },
    {
      id: 'student-exam-003',
      title: '王五的数学试卷（已批改）',
      type: 'document' as const,
      description: '得分：85/100，整体表现优秀，个别粗心错误',
      source: 'student' as const,
    },
  ],

  // 干净的原题（不包含学生答案）
  originalQuestions: [
    {
      id: 'q1',
      type: 'single_choice' as const,
      content: '下列哪个是质数？',
      options: ['4', '6', '7', '9'],
      answer: 'C',
      explanation: '质数是只能被 1 和自身整除的大于 1 的自然数。7 只能被 1 和 7 整除，因此是质数。',
      points: 5,
    },
    {
      id: 'q2',
      type: 'single_choice' as const,
      content: '计算：3 × 4 + 2 = ?',
      options: ['10', '12', '14', '16'],
      answer: 'C',
      explanation: '根据运算顺序，先算乘法：3 × 4 = 12，再算加法：12 + 2 = 14。',
      points: 5,
    },
    {
      id: 'q3',
      type: 'single_choice' as const,
      content: '下列哪个数是偶数？',
      options: ['3', '5', '8', '9'],
      answer: 'C',
      explanation: '偶数是能被 2 整除的整数。8 ÷ 2 = 4，因此 8 是偶数。',
      points: 5,
    },
    {
      id: 'q4',
      type: 'single_choice' as const,
      content: '一个长方形的长是 6cm，宽是 4cm，它的周长是多少？',
      options: ['10cm', '20cm', '24cm', '30cm'],
      answer: 'B',
      explanation: '长方形周长 = 2 × (长 + 宽) = 2 × (6 + 4) = 2 × 10 = 20cm。',
      points: 10,
    },
    {
      id: 'q5',
      type: 'single_choice' as const,
      content: '下列哪个分数最大？',
      options: ['1/2', '1/3', '2/3', '1/4'],
      answer: 'C',
      explanation: '通分后比较：1/2 = 6/12，1/3 = 4/12，2/3 = 8/12，1/4 = 3/12。因此 2/3 最大。',
      points: 10,
    },
  ],

  // AI 分析对话（包含班级整体和个体分析）
  analysisMessages: [
    {
      id: 'analysis-1',
      role: 'assistant' as const,
      content: '我已经识别了 3 位学生的答题情况。让我们看看班级整体表现：\n\n📊 **班级概况**\n• 平均分：73.3/100\n• 及格率：100%\n• 优秀率：33%（≥85 分）',
      timestamp: new Date(),
    },
    {
      id: 'analysis-2',
      role: 'assistant' as const,
      content: '**共性错题分析：**\n\n❌ **第 1 题（质数判断）**：张三和李四都选错了\n• 张三选了 A（4），李四选了 B（6）\n• 错因：对质数定义理解不清\n• 正确答案：C（7）\n\n❌ **第 4 题（周长计算）**：张三选错了\n• 张三选了 C（24cm）\n• 错因：混淆了周长和面积的计算公式\n• 正确答案：B（20cm）',
      timestamp: new Date(),
    },
    {
      id: 'analysis-3',
      role: 'assistant' as const,
      content: '**个体差异对比：**\n\n👤 **张三**：计算能力较弱，概念题错误较多\n• 薄弱点：质数判断、周长面积区分\n• 建议：加强基础概念理解\n\n👤 **李四**：计算准确，但概念理解有偏差\n• 薄弱点：质数定义\n• 建议：巩固数学概念\n\n👤 **王五**：整体优秀，仅有 1 道粗心错误\n• 优势：基础扎实，计算准确\n• 建议：注意审题细节',
      timestamp: new Date(),
    },
    {
      id: 'analysis-4',
      role: 'assistant' as const,
      content: '针对共性薄弱点，我为大家生成了**质数判断练习题**。',
      timestamp: new Date(),
    },
  ],

  // 变式练习题
  practiceTask: {
    id: 'practice-prime',
    type: 'practice' as const,
    title: '质数判断练习',
    status: 'available' as const,
    questionCount: 2,
    questions: [
      {
        id: 'p1',
        type: 'single_choice' as const,
        content: '下列哪个数是质数？',
        options: ['9', '11', '15', '21'],
        answer: 'B',
        explanation: '11 只能被 1 和 11 整除，符合质数定义。9 = 3×3，15 = 3×5，21 = 3×7，都不是质数。',
        points: 5,
      },
      {
        id: 'p2',
        type: 'single_choice' as const,
        content: '下列哪个数不是质数？',
        options: ['2', '3', '4', '5'],
        answer: 'C',
        explanation: '4 = 2×2，可以被 2 整除，因此不是质数。2、3、5 都是质数。',
        points: 5,
      },
    ],
  },
};

// ============ 场景 D1：导入历史测验记录 ============
export const historicalTestScenario = {
  // 历史测验记录列表（mock）
  testRecords: [
    {
      id: 'test-record-001',
      title: '2024-03-01 数学测验',
      date: '2024-03-01',
      score: 78,
      totalScore: 100,
      questionCount: 10,
      correctCount: 7,
    },
    {
      id: 'test-record-002',
      title: '2024-02-15 英语测验',
      date: '2024-02-15',
      score: 85,
      totalScore: 100,
      questionCount: 15,
      correctCount: 13,
    },
    {
      id: 'test-record-003',
      title: '2024-01-20 物理测验',
      date: '2024-01-20',
      score: 72,
      totalScore: 100,
      questionCount: 8,
      correctCount: 6,
    },
  ],

  // 分析对话序列
  analysisDialogue: [
    {
      id: 'hist-1',
      role: 'assistant' as const,
      content: '我已经加载了你的历史测验记录：**2024-03-01 数学测验**',
      timestamp: new Date(),
    },
    {
      id: 'hist-2',
      role: 'assistant' as const,
      content: '📊 **测验表现分析**\n\n• 得分：78/100\n• 正确率：70%（7/10 题）\n• 错题数：3 道\n\n**薄弱知识点**：\n• 二次函数的图像与性质\n• 三角函数的应用\n• 概率统计',
      timestamp: new Date(),
    },
    {
      id: 'hist-3',
      role: 'assistant' as const,
      content: '针对你的薄弱点，我为你生成了**针对性练习题**。',
      timestamp: new Date(),
    },
  ],

  // 针对性练习题
  practiceTask: {
    id: 'practice-historical',
    type: 'practice' as const,
    title: '二次函数专项练习',
    status: 'available' as const,
    questionCount: 2,
    questions: [
      {
        id: 'hist-p1',
        type: 'single_choice' as const,
        content: '二次函数 y = -x² + 4x - 3 的顶点坐标是？',
        options: ['(2, 1)', '(-2, 1)', '(2, -1)', '(-2, -1)'],
        answer: 'A',
        explanation: '配方得 y = -(x-2)² + 1，顶点坐标为 (2, 1)。',
        points: 10,
      },
      {
        id: 'hist-p2',
        type: 'single_choice' as const,
        content: '二次函数 y = 2x² - 8x + 6 的对称轴是？',
        options: ['x = 2', 'x = -2', 'x = 4', 'x = -4'],
        answer: 'A',
        explanation: '对称轴 x = -b/(2a) = 8/4 = 2。',
        points: 10,
      },
    ],
  },
};

// ============ 场景 D2：导入错题本 ============
export const errorQuestionsScenario = {
  // 错题列表（mock）
  errorList: [
    {
      id: 'error-001',
      content: '下列哪个是质数？',
      subject: '数学',
      chapter: '数论基础',
      errorCount: 2,
      lastErrorDate: '2024-02-28',
    },
    {
      id: 'error-002',
      content: '计算：(-2)³ = ?',
      subject: '数学',
      chapter: '有理数运算',
      errorCount: 1,
      lastErrorDate: '2024-02-25',
    },
    {
      id: 'error-003',
      content: '一元二次方程 x² - 5x + 6 = 0 的解是？',
      subject: '数学',
      chapter: '方程与不等式',
      errorCount: 3,
      lastErrorDate: '2024-03-01',
    },
  ],

  // 引导消息
  guidanceMessages: [
    {
      id: 'error-1',
      role: 'assistant' as const,
      content: '我已经为你加载了错题本中的 3 道错题。让我们重新练习这些题目。',
      timestamp: new Date(),
    },
    {
      id: 'error-2',
      role: 'assistant' as const,
      content: '**错题分析**：\n\n❌ **质数判断**（错误 2 次）\n• 知识点：质数的定义\n• 易错点：混淆质数和合数\n\n❌ **有理数运算**（错误 1 次）\n• 知识点：负数的幂运算\n• 易错点：忽略负号\n\n❌ **一元二次方程**（错误 3 次）\n• 知识点：因式分解法\n• 易错点：分解因式不熟练',
      timestamp: new Date(),
    },
  ],

  // 变式练习任务
  practiceTask: {
    id: 'practice-errors',
    type: 'practice' as const,
    title: '错题变式练习',
    status: 'available' as const,
    questionCount: 3,
    questions: [
      {
        id: 'var-1',
        type: 'single_choice' as const,
        content: '下列哪个数是质数？',
        options: ['9', '11', '15', '21'],
        answer: 'B',
        explanation: '11 只能被 1 和 11 整除，符合质数定义。9 = 3×3，15 = 3×5，21 = 3×7，都不是质数。',
        points: 10,
      },
      {
        id: 'var-2',
        type: 'single_choice' as const,
        content: '计算：(-3)² = ?',
        options: ['-9', '9', '-6', '6'],
        answer: 'B',
        explanation: '(-3)² = (-3) × (-3) = 9，负数的偶数次幂为正数。',
        points: 10,
      },
      {
        id: 'var-3',
        type: 'single_choice' as const,
        content: '一元二次方程 x² - 7x + 12 = 0 的解是？',
        options: ['x₁=3, x₂=4', 'x₁=2, x₂=6', 'x₁=-3, x₂=-4', 'x₁=-2, x₂=-6'],
        answer: 'A',
        explanation: '因式分解：x² - 7x + 12 = (x-3)(x-4) = 0，所以 x₁=3, x₂=4。',
        points: 10,
      },
    ],
  },
};
