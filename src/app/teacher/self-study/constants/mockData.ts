// Mock 数据 - 用于配置面板

// Agent 列表 (继承自通用版)
export const MOCK_AGENTS = [
  {
    id: 'agent_general',
    name: '通用助手',
    description: '适合各类学科的全能助手',
  },
  {
    id: 'agent_science',
    name: '理科专家',
    description: '擅长数学、物理、化学等理科科目',
  },
  {
    id: 'agent_humanities',
    name: '文科导师',
    description: '擅长语文、历史、文学等文科科目',
  },
  {
    id: 'agent_language',
    name: '语言教练',
    description: '专注于外语学习和语言能力提升',
  },
];

// Workflow 列表 (继承自通用版)
export const MOCK_WORKFLOWS = [
  {
    id: 'workflow_5e',
    name: '5E 教学法',
    description: '参与-探索-解释-精致-评价',
    stages: [
      {
        id: 'engage',
        name: '参与 Engage',
        defaultPrompt: '通过提问或展示现象,激发学生的好奇心和学习兴趣',
      },
      {
        id: 'explore',
        name: '探索 Explore',
        defaultPrompt: '引导学生主动探索,通过实践和观察发现规律',
      },
      {
        id: 'explain',
        name: '解释 Explain',
        defaultPrompt: '帮助学生理解概念,建立知识框架',
      },
      {
        id: 'elaborate',
        name: '精致 Elaborate',
        defaultPrompt: '引导学生深化理解,应用到新情境',
      },
      {
        id: 'evaluate',
        name: '评价 Evaluate',
        defaultPrompt: '评估学习成果,反思学习过程',
      },
    ],
  },
  {
    id: 'workflow_pbl',
    name: 'PBL 问题式学习',
    description: '问题导向的探究式学习',
    stages: [
      {
        id: 'problem',
        name: '提出问题',
        defaultPrompt: '呈现真实问题,激发学生思考',
      },
      {
        id: 'research',
        name: '研究探索',
        defaultPrompt: '引导学生收集信息,分析问题',
      },
      {
        id: 'solution',
        name: '提出方案',
        defaultPrompt: '帮助学生设计解决方案',
      },
      {
        id: 'present',
        name: '展示交流',
        defaultPrompt: '引导学生展示成果,互相学习',
      },
    ],
  },
  {
    id: 'workflow_feynman',
    name: '费曼学习法',
    description: '通过教学来深化理解',
    stages: [
      {
        id: 'learn',
        name: '学习概念',
        defaultPrompt: '引导学生理解核心概念',
      },
      {
        id: 'teach',
        name: '简单讲解',
        defaultPrompt: '让学生用简单语言解释概念',
      },
      {
        id: 'identify',
        name: '发现盲点',
        defaultPrompt: '帮助学生识别理解不足之处',
      },
      {
        id: 'simplify',
        name: '简化精炼',
        defaultPrompt: '引导学生用类比和例子深化理解',
      },
    ],
  },
];

// 监控策略列表
export const MOCK_STRATEGIES = [
  {
    id: 'strategy_light',
    name: '轻度监控',
    description: '仅在明显偏离学习目标时提醒',
  },
  {
    id: 'strategy_standard',
    name: '标准监控',
    description: '定期检查学习状态,适时提供反馈',
  },
  {
    id: 'strategy_deep',
    name: '深度监控',
    description: '实时追踪学习过程,主动干预和引导',
  },
];

// 笔记模板列表 (实际是预制提示词,非结构化框架)
export const NOTE_TEMPLATES = [
  {
    id: 'blank',
    name: '空白笔记',
    description: '无预制提示,自由记录',
  },
  {
    id: 'cornell',
    name: '康奈尔笔记',
    description: '引导学生记录关键概念、问题和总结',
  },
  {
    id: 'sky_rain_umbrella',
    name: '空雨伞',
    description: '引导学生思考现象(空)、原因(雨)和对策(伞)',
  },
];
