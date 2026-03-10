/**
 * 场景 1：新手指导
 * 首次使用自习室的引导流程
 */

import { DemoScenario } from '../types';

export const onboardingGuide: DemoScenario = {
  id: 'onboarding_guide',
  name: '新手指导',
  description: '首次使用自习室的引导流程',
  category: 'onboarding',

  initialState: {
    messages: [
      {
        id: 'ob-1',
        role: 'assistant',
        content: '嗨！欢迎来到自习室 👋',
        timestamp: new Date('2024-03-10T09:00:00'),
      },
      {
        id: 'ob-2',
        role: 'assistant',
        content: '我是你的 AI 学习助手，可以帮你学习、答疑、出题~',
        timestamp: new Date('2024-03-10T09:00:02'),
      },
      {
        id: 'ob-3',
        role: 'assistant',
        content: '先看看这里的布局吧',
        timestamp: new Date('2024-03-10T09:00:04'),
      },
      {
        id: 'ob-4',
        role: 'assistant',
        content: '👈 左边是**资源区**，放你的学习资料\n💬 中间是**聊天区**，就是咱俩对话的地方\n📝 右边是**工作区**，可以记笔记',
        timestamp: new Date('2024-03-10T09:00:06'),
      },
      {
        id: 'ob-5',
        role: 'assistant',
        content: '想开始学点什么吗？',
        timestamp: new Date('2024-03-10T09:00:08'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '我想学二次函数' },
            { id: 'qr-2', label: '我有资料要上传' },
            { id: 'qr-3', label: '随便聊聊' },
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
    { step: 2, description: '自我介绍', messageId: 'ob-2' },
    { step: 3, description: '界面引导', messageId: 'ob-3' },
    { step: 4, description: '区域说明', messageId: 'ob-4' },
    { step: 5, description: '引导开始', messageId: 'ob-5' },
  ],
};
