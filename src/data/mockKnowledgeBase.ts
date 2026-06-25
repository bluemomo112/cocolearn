import { TaskQuestion } from '@/types/shared-context';

/**
 * 错题记录接口
 */
export interface ErrorQuestion {
  id: string;
  originalTaskId: string;
  originalTaskTitle: string;
  question: TaskQuestion;
  userAnswer: string | string[];
  attemptDate: string;
  correctionCount: number;
  lastCorrectionDate?: string;
  tags?: string[];
}

/**
 * Mock 错题本数据
 */
export const mockErrorQuestions: ErrorQuestion[] = [
  {
    id: 'error_001',
    originalTaskId: 'task_001',
    originalTaskTitle: '植物工厂基础知识测验',
    question: {
      id: 'q_001',
      type: 'single_choice',
      content: '在植物工厂中，为什么LED光源比传统荧光灯更适合作为人工光源？',
      options: [
        '因为LED光源价格更便宜',
        '因为LED光源可以精确控制光谱和光强，提高能源效率',
        '因为LED光源寿命更短，便于更换',
        '因为LED光源发热量更大，有助于保温'
      ],
      answer: '因为LED光源可以精确控制光谱和光强，提高能源效率',
      explanation: 'LED光源的主要优势在于可以根据植物生长需求精确调节光谱组成和光照强度，同时具有更高的能源转换效率和更长的使用寿命。',
      points: 2
    },
    userAnswer: '因为LED光源价格更便宜',
    attemptDate: '2026-02-28',
    correctionCount: 2,
    lastCorrectionDate: '2026-03-01',
    tags: ['植物工厂', '光源技术', 'LED']
  },
  {
    id: 'error_002',
    originalTaskId: 'task_002',
    originalTaskTitle: '光合作用机理探究',
    question: {
      id: 'q_002',
      type: 'multiple_choice',
      content: '以下哪些因素会直接影响植物的光合作用效率？（多选）',
      options: [
        '光照强度',
        '二氧化碳浓度',
        '温度',
        '土壤pH值',
        '叶片颜色'
      ],
      answer: ['光照强度', '二氧化碳浓度', '温度'],
      explanation: '光合作用的三大主要影响因素是光照强度、二氧化碳浓度和温度。土壤pH值间接影响养分吸收，叶片颜色是结果而非影响因素。',
      points: 3
    },
    userAnswer: ['光照强度', '二氧化碳浓度'],
    attemptDate: '2026-02-25',
    correctionCount: 1,
    lastCorrectionDate: '2026-02-27',
    tags: ['光合作用', '环境因子']
  },
  {
    id: 'error_003',
    originalTaskId: 'task_001',
    originalTaskTitle: '植物工厂基础知识测验',
    question: {
      id: 'q_003',
      type: 'fill_in_blank',
      content: '植物工厂中最常用的光源是___，其主要优势是可以___和___。',
      blanks: 3,
      answer: ['LED', '精确控制光谱', '提高能源效率'],
      explanation: 'LED光源因其可调节性和高效性成为植物工厂的首选光源。',
      points: 3
    },
    userAnswer: ['荧光灯', '节省成本', '延长寿命'],
    attemptDate: '2026-02-20',
    correctionCount: 0,
    tags: ['植物工厂', '光源技术']
  },
  {
    id: 'error_004',
    originalTaskId: 'task_003',
    originalTaskTitle: '营养液配方设计',
    question: {
      id: 'q_004',
      type: 'true_false',
      content: '在水培系统中，营养液的EC值（电导率）越高，植物生长越好。',
      answer: '错误',
      explanation: 'EC值过高会导致盐分胁迫，抑制植物生长甚至造成伤害。需要根据植物种类和生长阶段调整到适宜范围。',
      points: 2
    },
    userAnswer: '正确',
    attemptDate: '2026-02-18',
    correctionCount: 1,
    lastCorrectionDate: '2026-02-22',
    tags: ['水培', '营养液', 'EC值']
  },
  {
    id: 'error_005',
    originalTaskId: 'task_004',
    originalTaskTitle: '环境控制系统',
    question: {
      id: 'q_005',
      type: 'single_choice',
      content: '植物工厂中，白天和夜间温度差异（DIF）对植物生长有何影响？',
      options: [
        'DIF对植物生长没有影响',
        '正DIF（白天温度高于夜间）促进茎伸长',
        '负DIF（夜间温度高于白天）促进茎伸长',
        'DIF只影响开花，不影响营养生长'
      ],
      answer: '正DIF（白天温度高于夜间）促进茎伸长',
      explanation: '正DIF会促进植物茎的伸长生长，而负DIF则会抑制茎伸长，使植物更加紧凑。这是植物工厂中重要的形态调控手段。',
      points: 2
    },
    userAnswer: '负DIF（夜间温度高于白天）促进茎伸长',
    attemptDate: '2026-02-15',
    correctionCount: 2,
    lastCorrectionDate: '2026-02-28',
    tags: ['环境控制', '温度管理', 'DIF']
  },
  {
    id: 'error_006',
    originalTaskId: 'task_002',
    originalTaskTitle: '光合作用机理探究',
    question: {
      id: 'q_006',
      type: 'multiple_choice',
      content: '关于光合作用的光反应阶段，以下说法正确的是？（多选）',
      options: [
        '发生在叶绿体的类囊体膜上',
        '需要光能参与',
        '产生ATP和NADPH',
        '固定二氧化碳',
        '产生氧气'
      ],
      answer: ['发生在叶绿体的类囊体膜上', '需要光能参与', '产生ATP和NADPH', '产生氧气'],
      explanation: '光反应发生在类囊体膜上，需要光能，产生ATP、NADPH和氧气。二氧化碳固定发生在暗反应（卡尔文循环）中。',
      points: 4
    },
    userAnswer: ['发生在叶绿体的类囊体膜上', '需要光能参与', '固定二氧化碳'],
    attemptDate: '2026-02-12',
    correctionCount: 0,
    tags: ['光合作用', '光反应', '叶绿体']
  },
  {
    id: 'error_007',
    originalTaskId: 'task_005',
    originalTaskTitle: '植物生长调节剂应用',
    question: {
      id: 'q_007',
      type: 'fill_in_blank',
      content: '___是一种促进细胞分裂的植物激素，常用于___；而___则主要促进细胞伸长。',
      blanks: 3,
      answer: ['细胞分裂素', '促进侧芽生长', '生长素'],
      explanation: '细胞分裂素促进细胞分裂和侧芽生长，生长素主要促进细胞伸长和顶端优势。',
      points: 3
    },
    userAnswer: ['生长素', '促进根系发育', '细胞分裂素'],
    attemptDate: '2026-02-10',
    correctionCount: 1,
    lastCorrectionDate: '2026-02-15',
    tags: ['植物激素', '生长调节']
  },
  {
    id: 'error_008',
    originalTaskId: 'task_006',
    originalTaskTitle: '病虫害综合防治',
    question: {
      id: 'q_008',
      type: 'true_false',
      content: '在植物工厂的密闭环境中，由于没有外界病虫害侵入，因此不需要进行病虫害防治。',
      answer: '错误',
      explanation: '虽然植物工厂是相对密闭的环境，但仍可能通过种苗、基质、人员等途径引入病虫害。且密闭高湿环境更易导致病害爆发，因此预防性防治非常重要。',
      points: 2
    },
    userAnswer: '正确',
    attemptDate: '2026-02-08',
    correctionCount: 0,
    tags: ['病虫害防治', '植物工厂管理']
  }
];

/**
 * 历史测验记录接口
 */
export interface HistoricalTest {
  id: string;
  title: string;
  date: string;
  score: number;
  totalScore: number;
  questionCount: number;
  correctCount: number;
  subject?: string;
  duration?: string;
}

/**
 * Mock 历史测验数据
 */
export const mockHistoricalTests: HistoricalTest[] = [
  {
    id: 'test-record-001',
    title: '2024-03-01 植物工厂基础测验',
    date: '2024-03-01',
    score: 78,
    totalScore: 100,
    questionCount: 10,
    correctCount: 7,
    subject: '植物工厂',
    duration: '30分钟'
  },
  {
    id: 'test-record-002',
    title: '2024-02-15 光合作用机理测验',
    date: '2024-02-15',
    score: 85,
    totalScore: 100,
    questionCount: 15,
    correctCount: 13,
    subject: '生物学',
    duration: '45分钟'
  },
  {
    id: 'test-record-003',
    title: '2024-01-20 水培技术应用测验',
    date: '2024-01-20',
    score: 72,
    totalScore: 100,
    questionCount: 8,
    correctCount: 6,
    subject: '农业技术',
    duration: '25分钟'
  },
  {
    id: 'test-record-004',
    title: '2024-01-10 环境控制系统测验',
    date: '2024-01-10',
    score: 90,
    totalScore: 100,
    questionCount: 12,
    correctCount: 11,
    subject: '自动化控制',
    duration: '40分钟'
  }
];

/**
 * 笔记接口
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  tags?: string[];
  relatedResourceId?: string;
  relatedResourceTitle?: string;
}

/**
 * Mock 笔记数据
 */
export const mockNotes: Note[] = [
  {
    id: 'note-001',
    title: '植物工厂光源选择要点',
    content: `# 植物工厂光源选择要点

## LED光源的优势
1. **光谱可调**：可以根据植物生长阶段调整红蓝光比例
2. **能效高**：光电转换效率达到40-50%
3. **寿命长**：使用寿命可达50000小时以上
4. **发热少**：有利于温度控制

## 不同生长阶段的光照需求
- 育苗期：蓝光为主（450-470nm）
- 营养生长期：红蓝光配合（红光60%，蓝光40%）
- 开花结果期：红光为主（630-660nm）

## 注意事项
- 光照强度要根据作物种类调整
- 光周期控制很重要（一般16小时光照/8小时黑暗）
- 定期检查光源衰减情况`,
    createdDate: '2026-02-25',
    updatedDate: '2026-03-01',
    tags: ['植物工厂', 'LED', '光源技术'],
    relatedResourceId: 'resource_1',
    relatedResourceTitle: '认识植物工厂学生手册'
  },
  {
    id: 'note-002',
    title: '营养液配方笔记',
    content: `# 营养液配方笔记

## 基础配方要素
### 大量元素
- N（氮）：促进叶片生长
- P（磷）：促进根系和开花
- K（钾）：提高抗性和品质

### 中量元素
- Ca（钙）、Mg（镁）、S（硫）

### 微量元素
- Fe、Mn、Zn、Cu、B、Mo

## EC值控制
- 叶菜类：1.0-1.5 mS/cm
- 果菜类：2.0-3.0 mS/cm
- 育苗期：0.8-1.0 mS/cm

## pH值管理
- 最适范围：5.5-6.5
- 过高：铁、锰等微量元素吸收受阻
- 过低：钙、镁吸收困难`,
    createdDate: '2026-02-20',
    updatedDate: '2026-02-28',
    tags: ['水培', '营养液', 'EC值', 'pH值'],
    relatedResourceId: 'resource_2',
    relatedResourceTitle: '水培植物工厂与集中控制学生手册'
  },
  {
    id: 'note-003',
    title: '温度控制策略',
    content: `# 温度控制策略

## DIF（昼夜温差）管理
- 正DIF：白天温度 > 夜间温度 → 促进茎伸长
- 负DIF：夜间温度 > 白天温度 → 抑制茎伸长，植株紧凑
- 零DIF：昼夜温度相同 → 中等生长

## 不同作物的温度需求
### 叶菜类（生菜、小白菜）
- 白天：18-22°C
- 夜间：15-18°C

### 果菜类（番茄、黄瓜）
- 白天：22-28°C
- 夜间：16-20°C

## 温度与其他因子的关系
- 温度↑ → 光合速率↑（在适宜范围内）
- 温度↑ → 呼吸作用↑ → 能量消耗↑
- 高温 + 高湿 → 病害风险↑`,
    createdDate: '2026-02-18',
    updatedDate: '2026-02-26',
    tags: ['环境控制', '温度管理', 'DIF']
  },
  {
    id: 'note-004',
    title: '光合作用复习要点',
    content: `# 光合作用复习要点

## 光反应（类囊体膜）
**输入**：光能、H2O
**输出**：ATP、NADPH、O2
**关键过程**：
1. 光系统II吸收光能
2. 水的光解：2H2O → 4H+ + O2 + 4e-
3. 电子传递链
4. 光系统I吸收光能
5. NADP+还原为NADPH

## 暗反应（叶绿体基质）
**输入**：CO2、ATP、NADPH
**输出**：糖类（C6H12O6）
**关键过程**：
1. CO2固定（RuBP + CO2）
2. C3化合物还原
3. RuBP再生

## 影响因素
1. **光照强度**：光饱和点、光补偿点
2. **CO2浓度**：最适浓度1000-1500 ppm
3. **温度**：最适温度25-30°C
4. **水分**：影响气孔开闭`,
    createdDate: '2026-02-15',
    updatedDate: '2026-02-24',
    tags: ['光合作用', '生物学', '复习笔记']
  },
  {
    id: 'note-005',
    title: '病虫害预防措施',
    content: `# 病虫害预防措施

## 预防为主的策略
### 1. 环境控制
- 保持适宜的温湿度
- 加强通风，降低湿度
- 控制光照，避免弱光

### 2. 卫生管理
- 定期清洁设施
- 种苗检疫
- 工作人员消毒
- 废弃物及时清理

### 3. 生物防治
- 引入天敌（如瓢虫防治蚜虫）
- 使用生物农药
- 种植驱虫植物

## 常见病虫害
### 真菌病害
- 灰霉病：降低湿度，增加通风
- 白粉病：控制温度，避免过密

### 虫害
- 蚜虫：黄板诱杀，生物防治
- 白粉虱：物理隔离，天敌控制

## 应急处理
1. 及时隔离病株
2. 对症用药（优先生物农药）
3. 加强监测
4. 记录分析`,
    createdDate: '2026-02-10',
    updatedDate: '2026-02-22',
    tags: ['病虫害防治', '植物工厂管理', '预防措施']
  }
];

/**
 * 互动网页接口
 */
export interface InteractiveWebpage {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'simulation' | 'visualization' | 'game' | 'tool';
  thumbnail?: string;
  tags?: string[];
  duration?: string;
}

/**
 * Mock 互动网页数据
 */
export const mockInteractiveWebpages: InteractiveWebpage[] = [
  {
    id: 'web-001',
    title: '植物工厂虚拟仿真系统',
    url: 'https://example.com/plant-factory-sim',
    description: '3D虚拟植物工厂，可以调整光照、温度、湿度等参数，观察植物生长变化',
    type: 'simulation',
    tags: ['植物工厂', '虚拟仿真', '3D'],
    duration: '互动体验'
  },
  {
    id: 'web-002',
    title: '光合作用动画演示',
    url: 'https://example.com/photosynthesis-animation',
    description: '交互式动画展示光合作用的光反应和暗反应过程，可以暂停、回放和查看详细说明',
    type: 'visualization',
    tags: ['光合作用', '动画', '可视化'],
    duration: '约10分钟'
  },
  {
    id: 'web-003',
    title: '营养液配方计算器',
    url: 'https://example.com/nutrient-calculator',
    description: '根据作物种类和生长阶段，自动计算营养液配方和EC值',
    type: 'tool',
    tags: ['营养液', '计算工具', '水培'],
    duration: '工具使用'
  },
  {
    id: 'web-004',
    title: '植物生长模拟游戏',
    url: 'https://example.com/plant-growth-game',
    description: '通过游戏方式学习植物生长的环境需求，挑战不同难度关卡',
    type: 'game',
    tags: ['游戏化学习', '植物生长', '趣味'],
    duration: '游戏体验'
  },
  {
    id: 'web-005',
    title: 'LED光谱配置工具',
    url: 'https://example.com/led-spectrum-tool',
    description: '可视化调整LED光谱组成，查看不同光谱对植物生长的影响',
    type: 'tool',
    tags: ['LED', '光谱', '可视化工具'],
    duration: '工具使用'
  },
  {
    id: 'web-006',
    title: '环境参数监测仪表盘',
    url: 'https://example.com/environment-dashboard',
    description: '实时显示植物工厂各项环境参数，支持历史数据查询和趋势分析',
    type: 'visualization',
    tags: ['环境监测', '数据可视化', '仪表盘'],
    duration: '实时监测'
  },
  {
    id: 'web-007',
    title: '植物病虫害识别系统',
    url: 'https://example.com/pest-identification',
    description: '上传植物照片，AI自动识别病虫害类型并给出防治建议',
    type: 'tool',
    tags: ['病虫害', 'AI识别', '诊断工具'],
    duration: '工具使用'
  }
];

