// Mock 数据 - 用于配置面板（支持国际化）

// 获取 Agent 列表
export const getMockAgents = (t: (text: string) => string) => [
  {
    id: 'agent_general',
    name: t('通用助手'),
    description: t('适合各类学科的全能助手'),
  },
  {
    id: 'agent_science',
    name: t('理科专家'),
    description: t('擅长数学、物理、化学等理科科目'),
  },
  {
    id: 'agent_humanities',
    name: t('文科导师'),
    description: t('擅长语文、历史、文学等文科科目'),
  },
  {
    id: 'agent_language',
    name: t('语言教练'),
    description: t('专注于外语学习和语言能力提升'),
  },
];

// 获取 Workflow 列表
export const getMockWorkflows = (t: (text: string) => string) => [
  {
    id: 'workflow_5e',
    name: t('5E 教学法'),
    description: t('参与-探索-解释-精致-评价'),
    stages: [
      {
        id: 'engage',
        name: t('参与 Engage'),
        defaultPrompt: t('通过提问或展示现象,激发学生的好奇心和学习兴趣'),
      },
      {
        id: 'explore',
        name: t('探索 Explore'),
        defaultPrompt: t('引导学生主动探索,通过实践和观察发现规律'),
      },
      {
        id: 'explain',
        name: t('解释 Explain'),
        defaultPrompt: t('帮助学生理解概念,建立知识框架'),
      },
      {
        id: 'elaborate',
        name: t('精致 Elaborate'),
        defaultPrompt: t('引导学生深化理解,应用到新情境'),
      },
      {
        id: 'evaluate',
        name: t('评价 Evaluate'),
        defaultPrompt: t('评估学习成果,反思学习过程'),
      },
    ],
  },
  {
    id: 'workflow_pbl',
    name: t('PBL 问题式学习'),
    description: t('问题导向的探究式学习'),
    stages: [
      {
        id: 'problem',
        name: t('提出问题'),
        defaultPrompt: t('呈现真实问题,激发学生思考'),
      },
      {
        id: 'research',
        name: t('研究探索'),
        defaultPrompt: t('引导学生收集信息,分析问题'),
      },
      {
        id: 'solution',
        name: t('提出方案'),
        defaultPrompt: t('帮助学生设计解决方案'),
      },
      {
        id: 'present',
        name: t('展示交流'),
        defaultPrompt: t('引导学生展示成果,互相学习'),
      },
    ],
  },
  {
    id: 'workflow_feynman',
    name: t('费曼学习法'),
    description: t('通过教学来深化理解'),
    stages: [
      {
        id: 'learn',
        name: t('学习概念'),
        defaultPrompt: t('引导学生理解核心概念'),
      },
      {
        id: 'teach',
        name: t('简单讲解'),
        defaultPrompt: t('让学生用简单语言解释概念'),
      },
      {
        id: 'identify',
        name: t('发现盲点'),
        defaultPrompt: t('帮助学生识别理解不足之处'),
      },
      {
        id: 'simplify',
        name: t('简化精炼'),
        defaultPrompt: t('引导学生用类比和例子深化理解'),
      },
    ],
  },
];

// 获取监控策略列表
export const getMockStrategies = (t: (text: string) => string) => [
  {
    id: 'strategy_light',
    name: t('轻度监控'),
    description: t('仅在明显偏离学习目标时提醒'),
  },
  {
    id: 'strategy_standard',
    name: t('标准监控'),
    description: t('定期检查学习状态,适时提供反馈'),
  },
  {
    id: 'strategy_deep',
    name: t('深度监控'),
    description: t('实时追踪学习过程,主动干预和引导'),
  },
];

// 获取笔记模板列表
export const getNoteTemplates = (t: (text: string) => string) => [
  {
    id: 'blank',
    name: t('空白笔记'),
    description: t('无预制提示,自由记录'),
  },
  {
    id: 'cornell',
    name: t('康奈尔笔记'),
    description: t('引导学生记录关键概念、问题和总结'),
  },
  {
    id: 'sky_rain_umbrella',
    name: t('空雨伞'),
    description: t('引导学生思考现象(空)、原因(雨)和对策(伞)'),
  },
];
