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
