/**
 * 能力数据类型定义和模拟数据
 * 用于演示跨学科学习的能力评估和可视化
 */

// ============ 能力类型定义 ============

/**
 * 能力维度类型
 */
export type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

/**
 * 能力评估等级 (1-4星)
 */
export type CompetencyRating = 1 | 2 | 3 | 4;

/**
 * 能力发展趋势
 */
export type CompetencyTrend = 'ascending' | 'stable' | 'descending';

/**
 * 能力历史记录项
 */
export interface CompetencyHistoryItem {
  courseId: string;
  courseName: string;
  timestamp: Date;
  rating: CompetencyRating;
  source: 'teacher_assigned' | 'ai_detected';  // 能力来源
  evidence: string[];  // 关键证据
}

/**
 * 单个能力的全局画像
 */
export interface GlobalCompetency {
  overallRating: CompetencyRating;  // 1-4，综合评级
  history: CompetencyHistoryItem[];  // 历史记录
  trend: CompetencyTrend;
  confidence: number;  // 0-1，置信度
  latestObservation: string;  // 最新观察
}

/**
 * 学生跨课程能力画像
 */
export interface LearnerProfile {
  studentId: string;
  studentName: string;

  // 全局能力画像
  globalCompetencies: {
    [key in CompetencyType]?: GlobalCompetency;
  };

  // 元数据
  metadata: {
    totalCoursesCompleted: number;
    totalLearningTime: number;  // 分钟
    lastActiveAt: Date;
  };
}

/**
 * 能力评估详情
 */
export interface CompetencyAssessment {
  rating: CompetencyRating;  // 1-4星
  description: string;  // 描述性评价（150字）
  highlights: string;  // 亮点
  areasForImprovement: string;  // 待提升
  suggestions: string;  // 建议
  evidence: string[];  // 支持证据
}

/**
 * 本课程的能力评估报告
 */
export interface CourseCompetencyReport {
  courseId: string;
  courseName: string;

  // 教师指定的能力评估（必评）
  assignedCompetencies: {
    [key in CompetencyType]?: CompetencyAssessment;
  };

  // AI识别的能力评估（选评）
  detectedCompetencies: {
    [key in CompetencyType]?: CompetencyAssessment & {
      confidence: number;  // AI置信度
    };
  };

  status: 'in_progress' | 'completed';  // 课程状态
}

/**
 * AI实时观察
 */
export interface AIObservation {
  id: string;
  type: 'praise' | 'suggestion' | 'insight';
  icon: string;  // emoji
  message: string;
  timestamp: Date;
}

// ============ 能力维度的元数据 ============

export interface CompetencyMetadata {
  id: CompetencyType;
  name: string;
  description: string;
  color: string;  // 用于可视化的颜色
  icon: string;   // emoji图标
}

export const COMPETENCY_METADATA: Record<CompetencyType, CompetencyMetadata> = {
  critical_thinking: {
    id: 'critical_thinking',
    name: '批判性思维',
    description: '质疑假设、评估证据、识别逻辑漏洞的能力',
    color: '#3b82f6',  // 蓝色
    icon: '🔍'
  },
  information_synthesis: {
    id: 'information_synthesis',
    name: '信息整合',
    description: '跨资源连接、总结归纳的能力',
    color: '#10b981',  // 绿色
    icon: '🔗'
  },
  metacognition: {
    id: 'metacognition',
    name: '元认知',
    description: '反思学习过程、自我监控的能力',
    color: '#8b5cf6',  // 紫色
    icon: '💭'
  },
  question_quality: {
    id: 'question_quality',
    name: '提问质量',
    description: '提出深层次问题的能力',
    color: '#f59e0b',  // 琥珀色
    icon: '❓'
  },
  creativity: {
    id: 'creativity',
    name: '创造性',
    description: '提出新观点、新联系的能力',
    color: '#ec4899',  // 粉色
    icon: '✨'
  },
  persistence: {
    id: 'persistence',
    name: '坚持性',
    description: '面对困难持续尝试的能力',
    color: '#ef4444',  // 红色
    icon: '💪'
  }
};

// ============ 模拟数据 ============

/**
 * 模拟的学生跨课程能力画像
 */
export const mockLearnerProfile: LearnerProfile = {
  studentId: 'student_001',
  studentName: '张三',

  globalCompetencies: {
    critical_thinking: {
      overallRating: 3,
      history: [
        {
          courseId: 'course_01',
          courseName: '科学探究课',
          timestamp: new Date('2025-01-05'),
          rating: 3,
          source: 'teacher_assigned',
          evidence: [
            '能够对实验结果提出质疑',
            '主动寻找证据支持观点'
          ]
        },
        {
          courseId: 'course_02',
          courseName: '媒体素养课',
          timestamp: new Date('2025-01-03'),
          rating: 4,
          source: 'ai_detected',
          evidence: [
            '分析了新闻报道的可信度',
            '识别了多个逻辑谬误'
          ]
        },
        {
          courseId: 'course_03',
          courseName: '水循环与水资源',
          timestamp: new Date('2025-01-07'),
          rating: 4,
          source: 'teacher_assigned',
          evidence: [
            '对比了三份资料的核心观点差异',
            '质疑了资料A的数据来源'
          ]
        }
      ],
      trend: 'ascending',
      confidence: 0.85,
      latestObservation: '在本课程中展现了优秀的批判性思维，能够主动质疑资料并寻找证据'
    },

    information_synthesis: {
      overallRating: 3,
      history: [
        {
          courseId: 'course_01',
          courseName: '科学探究课',
          timestamp: new Date('2025-01-05'),
          rating: 3,
          source: 'teacher_assigned',
          evidence: [
            '整合了多个实验数据',
            '总结了核心结论'
          ]
        },
        {
          courseId: 'course_03',
          courseName: '水循环与水资源',
          timestamp: new Date('2025-01-07'),
          rating: 3,
          source: 'teacher_assigned',
          evidence: [
            '综合了视频和PDF的信息',
            '建立了知识之间的联系'
          ]
        }
      ],
      trend: 'stable',
      confidence: 0.75,
      latestObservation: '能够整合不同来源的信息，但深度分析还可以加强'
    },

    metacognition: {
      overallRating: 4,
      history: [
        {
          courseId: 'course_01',
          courseName: '科学探究课',
          timestamp: new Date('2025-01-05'),
          rating: 3,
          source: 'ai_detected',
          evidence: [
            '主动反思学习方法',
            '识别了自己的困惑点'
          ]
        },
        {
          courseId: 'course_02',
          courseName: '媒体素养课',
          timestamp: new Date('2025-01-03'),
          rating: 4,
          source: 'ai_detected',
          evidence: [
            '频繁进行自我检查',
            '调整了学习策略'
          ]
        },
        {
          courseId: 'course_03',
          courseName: '水循环与水资源',
          timestamp: new Date('2025-01-07'),
          rating: 4,
          source: 'ai_detected',
          evidence: [
            '多次主动反思理解程度',
            '提出了改进学习方法的想法'
          ]
        }
      ],
      trend: 'ascending',
      confidence: 0.90,
      latestObservation: '展现出很强的自我反思能力，能主动监控学习过程'
    },

    question_quality: {
      overallRating: 2,
      history: [
        {
          courseId: 'course_03',
          courseName: '水循环与水资源',
          timestamp: new Date('2025-01-07'),
          rating: 2,
          source: 'ai_detected',
          evidence: [
            '提出了5个"为什么"类问题',
            '问题偏向事实性，深度有限'
          ]
        }
      ],
      trend: 'stable',
      confidence: 0.65,
      latestObservation: '能够提出问题，但多为表层问题，可以尝试更深入的探究'
    }
  },

  metadata: {
    totalCoursesCompleted: 3,
    totalLearningTime: 245,  // 分钟
    lastActiveAt: new Date('2025-01-07')
  }
};

/**
 * 模拟的本课程能力评估报告
 */
export const mockCourseCompetencyReport: CourseCompetencyReport = {
  courseId: 'course_03',
  courseName: '水循环与水资源',
  status: 'in_progress',  // 学习中

  // 教师在主观题上指定的能力维度
  assignedCompetencies: {
    critical_thinking: {
      rating: 4,
      description: '在本课程中展现了优秀的批判性思维能力。能够多次主动质疑资料中的观点，并从多个资源中寻找证据支持自己的判断。',
      highlights: '在讨论水资源污染时，主动对比了资料A和资料B的不同观点，并指出资料A缺乏最新数据支持。',
      areasForImprovement: '可以尝试更深入地分析论证逻辑，识别潜在的假设和前提条件。',
      suggestions: '下次学习时，可以尝试构建论证结构图，更系统地分析观点的逻辑关系。',
      evidence: [
        '"这个数据是哪年的？可能已经过时了"（对话 #23）',
        '"资料B的结论和资料A矛盾，我需要找更多证据"（对话 #31）',
        '笔记中对比了三份资料的核心观点差异',
        '在作业中质疑了某个论点的前提假设'
      ]
    },

    information_synthesis: {
      rating: 3,
      description: '展现了良好的信息整合能力，能够将视频、PDF等多种资源的内容联系起来，形成较为完整的知识图景。',
      highlights: '成功地将水循环视频中的动画演示与PDF文档中的科学解释结合，在笔记中绘制了完整的水循环示意图。',
      areasForImprovement: '在整合不同观点时，有时会遗漏细节差异，建议更细致地记录各资源的独特贡献。',
      suggestions: '可以尝试使用思维导图工具，更清晰地展现知识之间的层次和联系。',
      evidence: [
        '笔记中综合了三个资源的核心信息',
        '"这个和视频里讲的蒸发过程是一样的"（对话 #18）',
        '在作业中引用了多个资源的内容',
        '建立了水循环和水资源短缺之间的因果关系'
      ]
    }
  },

  // AI在学习过程中自动识别的能力
  detectedCompetencies: {
    metacognition: {
      rating: 4,
      description: 'AI观察到该学生在学习过程中频繁进行自我反思和监控，展现出卓越的元认知能力。',
      highlights: '多次主动暂停学习，思考"我是否真正理解了这个概念"，并调整学习策略。',
      areasForImprovement: '可以尝试在反思时更具体地记录困惑点和解决方法，形成可复用的学习策略库。',
      suggestions: '建议在每个学习阶段结束时写一段反思日志，记录学习方法的有效性。',
      evidence: [
        '"我觉得这部分还没完全理解，需要再看一遍"（对话 #15）',
        '"这个方法比刚才的更有效，我应该多用"（对话 #28）',
        '主动调整了学习顺序，先看基础视频再读深入资料',
        '在困惑时主动寻求帮助，而非盲目继续'
      ],
      confidence: 0.90  // AI识别的置信度
    },

    question_quality: {
      rating: 2,
      description: 'AI识别到该学生在学习过程中提出了8个问题，但多为事实性问题，深层次的"为什么"类问题较少。',
      highlights: '能够主动提问，保持好奇心，这是很好的学习习惯。',
      areasForImprovement: '提问时可以更多地关注"为什么"和"如何"，而非仅仅"是什么"。',
      suggestions: '尝试在理解一个概念后，追问"为什么会这样？""如果情况改变会怎样？"',
      evidence: [
        '提出了8个问题，其中5个为事实性问题',
        '"水循环有哪几个阶段？"（对话 #5）',
        '"为什么海水不能直接饮用？"（对话 #12）- 较好的深层问题',
        '多数问题能在资料中直接找到答案'
      ],
      confidence: 0.70
    }
  }
};

/**
 * 模拟的AI实时观察
 */
export const mockAIObservations: AIObservation[] = [
  {
    id: 'obs_1',
    type: 'praise',
    icon: '✨',
    message: '你今天提出了3个"为什么"类问题，很棒！保持好奇心。',
    timestamp: new Date('2025-01-07T10:30:00')
  },
  {
    id: 'obs_2',
    type: 'suggestion',
    icon: '💡',
    message: '试着多对比不同资料的观点，可以提升信息整合能力。',
    timestamp: new Date('2025-01-07T10:45:00')
  },
  {
    id: 'obs_3',
    type: 'insight',
    icon: '👀',
    message: '我注意到你在阅读时会主动做笔记，这是一个很好的学习习惯。',
    timestamp: new Date('2025-01-07T11:00:00')
  },
  {
    id: 'obs_4',
    type: 'praise',
    icon: '🎯',
    message: '刚才你主动反思了自己的理解程度，元认知能力很强！',
    timestamp: new Date('2025-01-07T11:15:00')
  }
];

/**
 * 获取能力的星级展示字符串
 */
export function getCompetencyStars(rating: CompetencyRating): string {
  const fullStar = '★';
  const emptyStar = '☆';
  return fullStar.repeat(rating) + emptyStar.repeat(4 - rating);
}

/**
 * 获取能力发展趋势的图标
 */
export function getTrendIcon(trend: CompetencyTrend): string {
  switch (trend) {
    case 'ascending':
      return '↗';
    case 'stable':
      return '→';
    case 'descending':
      return '↘';
  }
}

/**
 * 获取能力发展趋势的描述
 */
export function getTrendDescription(trend: CompetencyTrend): string {
  switch (trend) {
    case 'ascending':
      return '上升';
    case 'stable':
      return '稳定';
    case 'descending':
      return '下降';
  }
}

/**
 * 格式化时间
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// ============ AI能力培养引导对话演示 ============

/**
 * AI能力培养引导对话消息（演示数据）
 * 展示AI如何通过对话引导学生发展核心能力
 */
export const mockCompetencyGuidedMessages = [
  {
    id: 'msg-1',
    role: 'assistant' as const,
    content: '你好！我注意到你正在学习"水循环与水资源"。在开始之前，我想了解一下：你觉得水循环和我们的日常生活有什么关系呢？',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    competencyHint: {
      type: 'metacognition' as CompetencyType,
      strategy: '激活先验知识，建立学习与生活的联系'
    }
  },
  {
    id: 'msg-2',
    role: 'user' as const,
    content: '嗯...下雨的时候水会流到地上，然后蒸发？',
    timestamp: new Date(Date.now() - 1000 * 60 * 9)
  },
  {
    id: 'msg-3',
    role: 'assistant' as const,
    content: '很好的观察！🌟 你提到了蒸发。那我想追问一下：蒸发的水去哪里了？它会消失吗？',
    timestamp: new Date(Date.now() - 1000 * 60 * 8.5),
    competencyHint: {
      type: 'critical_thinking' as CompetencyType,
      strategy: '苏格拉底式追问，引导深度思考'
    }
  },
  {
    id: 'msg-4',
    role: 'user' as const,
    content: '不会消失！水蒸气会变成云，然后又变成雨下来',
    timestamp: new Date(Date.now() - 1000 * 60 * 7)
  },
  {
    id: 'msg-5',
    role: 'assistant' as const,
    content: '太棒了！💧 你已经描述出了一个完整的循环。现在看看视频资源，注意观察：\n\n1. 视频中还提到了哪些水的形态转换？\n2. 人类活动在水循环中扮演什么角色？\n\n看完后告诉我你的新发现！',
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
    competencyHint: {
      type: 'information_synthesis' as CompetencyType,
      strategy: '提供结构化观察框架，培养信息整合能力'
    }
  },
  {
    id: 'msg-6',
    role: 'user' as const,
    content: '我看完了！视频里说人类会抽取地下水，还会建水库',
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: 'msg-7',
    role: 'assistant' as const,
    content: '非常好的观察！🎯 你注意到了人类对水循环的干预。现在我想请你做一个小实验：\n\n**思考挑战**：如果你所在的城市连续一个月不下雨，会发生什么？请从至少三个不同角度考虑这个问题。\n\n提示：可以考虑环境、社会、经济等方面。',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    competencyHint: {
      type: 'creativity' as CompetencyType,
      strategy: '情境化问题，鼓励多角度思考'
    }
  }
];
