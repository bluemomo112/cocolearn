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

