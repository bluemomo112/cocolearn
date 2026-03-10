/**
 * 场景 2：资源生成流程
 * 展示 AI 生成学习资源的完整过程
 */

import { DemoScenario } from '../types';

export const resourceGeneration: DemoScenario = {
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
        content: '好啊！二次函数是初中数学的重点',
        timestamp: new Date('2024-03-10T09:05:02'),
      },
      {
        id: 'rg-3',
        role: 'assistant',
        content: '我可以帮你生成一些学习资源',
        timestamp: new Date('2024-03-10T09:05:04'),
      },
      {
        id: 'rg-4',
        role: 'assistant',
        content: '你想要哪种？',
        timestamp: new Date('2024-03-10T09:05:05'),
        suggestions: {
          actionButtons: [
            {
              id: 'btn-mindmap',
              label: '思维导图',
              description: '知识点结构化梳理',
              iconName: 'Network',
              studioToolId: 'mind_map',
            },
            {
              id: 'btn-audio',
              label: '音频概述',
              description: '5分钟快速了解',
              iconName: 'Headphones',
              studioToolId: 'audio_overview',
            },
            {
              id: 'btn-flashcards',
              label: '记忆卡片',
              description: '重点知识速记',
              iconName: 'CreditCard',
              studioToolId: 'flashcards',
            },
            {
              id: 'btn-practice',
              label: '练习题',
              description: '巩固理解',
              iconName: 'Pencil',
              studioToolId: 'practice',
            },
          ],
        },
      },
      {
        id: 'rg-5',
        role: 'user',
        content: '思维导图吧',
        timestamp: new Date('2024-03-10T09:05:15'),
      },
      {
        id: 'rg-6',
        role: 'assistant',
        content: '好的，正在生成...',
        timestamp: new Date('2024-03-10T09:05:16'),
      },
      {
        id: 'rg-7',
        role: 'assistant',
        content: '✅ 生成完成！',
        timestamp: new Date('2024-03-10T09:05:20'),
      },
      {
        id: 'rg-8',
        role: 'assistant',
        content: '思维导图已经添加到左边的资源区了，点击可以查看',
        timestamp: new Date('2024-03-10T09:05:22'),
      },
      {
        id: 'rg-9',
        role: 'assistant',
        content: '还需要其他资源吗？',
        timestamp: new Date('2024-03-10T09:05:24'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '再来点练习题' },
            { id: 'qr-2', label: '不用了，谢谢' },
          ],
        },
      },
    ],
    learningMode: 'self_directed',
    resources: [
      {
        id: 'res-mindmap-1',
        title: '二次函数知识结构图',
        type: 'interactive',
        description: 'AI 生成的思维导图',
        interactiveCategory: 'visualization',
        url: '/interactive/mindmap',
      },
    ],
    generatedTasks: [],
  },

  keySteps: [
    { step: 1, description: '用户表达学习意图', messageId: 'rg-1' },
    { step: 2, description: 'AI 确认主题', messageId: 'rg-2' },
    { step: 3, description: '提供资源选项', messageId: 'rg-4' },
    { step: 4, description: '用户选择', messageId: 'rg-5' },
    { step: 5, description: '生成中', messageId: 'rg-6' },
    { step: 6, description: '生成完成', messageId: 'rg-7' },
    { step: 7, description: '引导查看', messageId: 'rg-8' },
  ],
};
