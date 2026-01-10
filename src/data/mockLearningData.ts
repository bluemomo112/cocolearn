import { Resource, Task } from '@/types/shared-context';

/**
 * Mock资源数据
 */
export const mockResources: Resource[] = [
  {
    id: 'resource_1',
    title: '认识植物工厂学生手册',
    type: 'document',
    fileType: 'docx',
    path: 'mock_data/01 认识植物工厂学生手册V1.0.docx',
    description: '介绍植物工厂的基本概念、类型和应用场景',
    duration: '阅读约15分钟'
  },
  {
    id: 'resource_2',
    title: '水培植物工厂与集中控制学生手册',
    type: 'document',
    fileType: 'docx',
    path: 'mock_data/02 水培植物工厂与集中控制学生手册V1.0.docx',
    description: '深入了解水培系统和自动化控制原理',
    duration: '阅读约20分钟'
  },
  {
    id: 'resource_3',
    title: '设计水培容器学生手册',
    type: 'document',
    fileType: 'docx',
    path: 'mock_data/11 设计水培容器学生手册V1.0.docx',
    description: '学习如何设计和制作水培容器',
    duration: '阅读约15分钟'
  },
  {
    id: 'resource_4',
    title: '认识植物工厂课件',
    type: 'presentation',
    fileType: 'pptx',
    path: 'mock_data/01 认识植物工厂V1.0.pptx',
    description: '植物工厂概念的可视化讲解',
    duration: '浏览约10分钟'
  },
  {
    id: 'resource_5',
    title: '水培植物工厂与集中控制课件',
    type: 'presentation',
    fileType: 'pptx',
    path: 'mock_data/02 水培植物工厂与集中控制V1.0.pptx',
    description: '水培系统的详细图解',
    duration: '浏览约10分钟'
  },
  {
    id: 'resource_6',
    title: '植物工厂介绍视频',
    type: 'video',
    fileType: 'mp4',
    path: 'mock_data/视频1.mp4',
    description: '植物工厂实景展示和工作原理演示',
    duration: '视频约5分钟'
  }
];

/**
 * Mock任务数据
 */
export const mockTasks: Task[] = [
  // 客观题（知识检测）
  {
    id: 'task_quiz_1',
    type: 'quiz',
    title: '植物工厂基础知识测验',
    description: '检测对植物工厂基本概念的理解',
    status: 'available',
    required: true,
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        content: '植物工厂与传统农业最本质的区别是什么？',
        options: [
          'A. 使用更多的化肥',
          'B. 完全可控的生长环境',
          'C. 种植面积更大',
          'D. 只能种植蔬菜'
        ],
        answer: 'B',
        explanation: '植物工厂的核心特点是通过人工控制光照、温度、湿度、CO2浓度等环境因素，实现作物全年稳定生产。'
      },
      {
        id: 'q2',
        type: 'single_choice',
        content: '水培系统中，植物主要通过什么方式获取养分？',
        options: [
          'A. 土壤中的有机物',
          'B. 营养液中的矿物质',
          'C. 空气中的氮气',
          'D. 阳光中的能量'
        ],
        answer: 'B',
        explanation: '水培是无土栽培的一种，植物根系直接浸泡在含有必需矿物质的营养液中吸收养分。'
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        content: '植物工厂中通常需要控制哪些环境因素？（多选）',
        options: [
          'A. 光照强度和光周期',
          'B. 温度和湿度',
          'C. CO2浓度',
          'D. 土壤pH值'
        ],
        answer: ['A', 'B', 'C'],
        explanation: '植物工厂采用无土栽培，不涉及土壤。主要控制光、温、湿、气（CO2）等因素。'
      }
    ],
    relatedResourceIds: ['resource_1', 'resource_2']
  },

  // 主观题（能力评估）
  {
    id: 'task_assignment_1',
    type: 'assignment',
    title: '植物工厂优缺点分析',
    description: '结合所学资料，分析植物工厂相比传统农业的优势和局限性',
    status: 'available',
    required: true,
    assignedCompetencies: ['critical_thinking', 'information_synthesis'],
    prompt: `请阅读提供的学习资料，完成以下任务：

1. 列出植物工厂相比传统农业的至少3个优势
2. 分析植物工厂目前面临的至少2个挑战或局限
3. 你认为植物工厂能否完全取代传统农业？请说明理由

要求：
- 观点需要有资料中的证据支持
- 需要从多个角度进行分析（如经济、环境、技术等）
- 字数不少于200字`,
    rubric: {
      excellent: '能从多角度深入分析，引用具体证据，有独到见解',
      good: '分析较全面，有一定证据支持',
      pass: '基本完成任务，但分析较浅',
      fail: '未完成基本要求或观点缺乏依据'
    },
    submissionPlaceholder: '请在这里输入你的分析...',
    relatedResourceIds: ['resource_1', 'resource_2', 'resource_4', 'resource_5']
  },

  {
    id: 'task_assignment_2',
    type: 'assignment',
    title: '设计我的水培系统',
    description: '基于所学知识，设计一个适合家庭使用的简易水培系统',
    status: 'locked',
    required: true,
    prerequisite: ['task_quiz_1', 'task_assignment_1'],
    assignedCompetencies: ['information_synthesis'],
    prompt: `基于你对水培系统的学习，设计一个适合家庭阳台使用的简易水培系统：

1. 系统设计
   - 容器选择和改造方案
   - 营养液配方建议
   - 光照解决方案

2. 种植计划
   - 选择2-3种适合水培的植物
   - 说明选择原因

3. 预期挑战
   - 列出可能遇到的问题
   - 提出解决思路

请附上简单的设计草图描述（文字描述即可）`,
    rubric: {
      excellent: '设计完整可行，有创新点，考虑全面',
      good: '设计基本合理，有一定可行性',
      pass: '完成基本设计，但缺乏细节',
      fail: '设计不完整或明显不可行'
    },
    submissionPlaceholder: '请在这里输入你的设计方案...',
    relatedResourceIds: ['resource_2', 'resource_3', 'resource_5']
  },

  // 反思任务（元认知）
  {
    id: 'task_reflection_1',
    type: 'reflection',
    title: '学习反思',
    description: '回顾本课程的学习过程，进行自我反思',
    status: 'available',
    required: false,
    assignedCompetencies: ['metacognition'],
    prompt: `请回顾你在本课程中的学习过程，思考以下问题：

1. 学习收获
   - 你学到了哪些新知识或新技能？
   - 哪个部分让你印象最深刻？为什么？

2. 学习方法
   - 你使用了什么学习方法？（如做笔记、提问、对比等）
   - 这些方法效果如何？

3. 困难与解决
   - 学习中遇到了什么困难？
   - 你是如何克服的？

4. 改进计划
   - 如果重新学习，你会做什么调整？
   - 对于后续学习，你有什么计划？`,
    submissionPlaceholder: '请在这里输入你的反思...'
  }
];
