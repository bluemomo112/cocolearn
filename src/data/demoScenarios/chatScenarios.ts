/**
 * 演示脚本场景定义
 * 包含 6 个核心场景的完整对话脚本和状态
 */

import { DemoScenario, ScenarioCollection } from './types';

// ============ 场景 1：新手指导 ============
const onboardingGuide: DemoScenario = {
  id: 'onboarding_guide',
  name: '新手指导',
  description: '首次使用自习室的引导流程',
  category: 'onboarding',

  initialState: {
    messages: [
      {
        id: 'ob-1',
        role: 'assistant',
        content: '你好！欢迎来到自习室 👋',
        timestamp: new Date('2024-03-10T09:00:00'),
      },
      {
        id: 'ob-2',
        role: 'assistant',
        content: '这里有三个区域：左边是资源区，中间是聊天区，右边是工作区。',
        timestamp: new Date('2024-03-10T09:00:02'),
      },
      {
        id: 'ob-3',
        role: 'assistant',
        content: '你可以先上传学习资料，或者直接告诉我你想学什么？',
        timestamp: new Date('2024-03-10T09:00:04'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '我想学二次函数' },
            { id: 'qr-2', label: '我有资料要上传' },
          ],
        },
      },
    ],
    learningMode: 'self_directed',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [
    { step: 1, description: '欢迎消息', messageId: 'ob-1' },
    { step: 2, description: '界面介绍', messageId: 'ob-2' },
    { step: 3, description: '引导用户开始', messageId: 'ob-3' },
  ],
};

// ============ 场景 2：资源生成流程 ============
const resourceGeneration: DemoScenario = {
  id: 'resource_generation',
  name: '资源生成流程',
  description: '展示 AI 生成学习资源的完整过程',
  category: 'task_flow',

  initialState: {
    messages: [
      {
        id: 'rg-1',
        role: 'user',
        content: '我想学二次函数',
        timestamp: new Date('2024-03-10T09:05:00'),
      },
      {
        id: 'rg-2',
        role: 'assistant',
        content: '好的！我可以帮你生成一些学习资源',
        timestamp: new Date('2024-03-10T09:05:02'),
      },
      {
        id: 'rg-3',
        role: 'assistant',
        content: '你想要哪种类型的资源？',
        timestamp: new Date('2024-03-10T09:05:03'),
        suggestions: {
          actionButtons: [
            {
              id: 'btn-mindmap',
              label: '思维导图',
              description: '知识点结构化梳理',
              iconName: 'Network',
              studioToolId: 'mindmap',
            },
            {
              id: 'btn-audio',
              label: '音频概述',
              description: '5分钟快速了解',
              iconName: 'Headphones',
              studioToolId: 'audio',
            },
          ],
        },
      },
    ],
    learningMode: 'self_directed',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [
    { step: 1, description: '用户表达学习意图', messageId: 'rg-1' },
    { step: 2, description: 'AI 确认并提供选项', messageId: 'rg-2' },
    { step: 3, description: '展示功能按钮网格', messageId: 'rg-3' },
  ],
};

// ============ 场景 3：任务完成流程 ============
const taskCompletion: DemoScenario = {
  id: 'task_completion',
  name: '任务完成流程',
  description: '展示答题、提交、批改的完整流程',
  category: 'task_flow',

  initialState: {
    messages: [],
    learningMode: 'self_directed',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [],
};

// ============ 场景 4：苏格拉底式讲解 ============
const socraticExplanation: DemoScenario = {
  id: 'socratic_explanation',
  name: '苏格拉底式讲解',
  description: '通过提问引导学生理解错题',
  category: 'ai_guided',

  initialState: {
    messages: [],
    learningMode: 'ai_guided',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [],
};

// ============ 场景 5：AI引导模式 ============
const aiGuidedLearning: DemoScenario = {
  id: 'ai_guided_learning',
  name: 'AI引导模式',
  description: '展示学习路径、知识检查点、主题过渡',
  category: 'ai_guided',

  initialState: {
    messages: [],
    learningMode: 'ai_guided',
    resources: [],
    generatedTasks: [],
    learningPath: [],
  },

  keySteps: [],
};

// ============ 场景 6：自由探索模式 ============
const selfDirectedExploration: DemoScenario = {
  id: 'self_directed_exploration',
  name: '自由探索模式',
  description: '用户主导的深度对话和资源推荐',
  category: 'exploration',

  initialState: {
    messages: [],
    learningMode: 'self_directed',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [],
};

// ============ 场景集合 ============
export const demoScenarios: ScenarioCollection = {
  scenarios: [
    onboardingGuide,
    resourceGeneration,
    taskCompletion,
    socraticExplanation,
    aiGuidedLearning,
    selfDirectedExploration,
  ],

  categories: [
    {
      id: 'onboarding',
      label: '新手指导',
      description: '首次使用的引导流程',
    },
    {
      id: 'task_flow',
      label: '任务流程',
      description: '资源生成和任务完成',
    },
    {
      id: 'ai_guided',
      label: 'AI引导',
      description: 'AI主动引导学习',
    },
    {
      id: 'exploration',
      label: '自由探索',
      description: '用户主导的学习',
    },
  ],
};

// 导出单个场景（方便按需引用）
export {
  onboardingGuide,
  resourceGeneration,
  taskCompletion,
  socraticExplanation,
  aiGuidedLearning,
  selfDirectedExploration,
};
