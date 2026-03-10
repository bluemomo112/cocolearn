/**
 * 场景 3：任务完成流程
 * 展示答题、提交、批改的完整流程
 */

import { DemoScenario } from '../types';

export const taskCompletion: DemoScenario = {
  id: 'task_completion',
  name: '任务完成流程',
  description: '展示答题、提交、批改的完整流程',
  category: 'task_flow',

  initialState: {
    messages: [
      {
        id: 'tc-1',
        role: 'user',
        content: '来点练习题吧',
        timestamp: new Date('2024-03-10T09:10:00'),
      },
      {
        id: 'tc-2',
        role: 'assistant',
        content: '好的！我给你出几道题',
        timestamp: new Date('2024-03-10T09:10:02'),
      },
      {
        id: 'tc-3',
        role: 'assistant',
        content: '点击下面的卡片开始答题 👇',
        timestamp: new Date('2024-03-10T09:10:04'),
        embeddedTask: {
          id: 'task-quadratic-1',
          type: 'quiz',
          title: '二次函数基础练习',
          description: '测试二次函数基础知识',
          status: 'available',
          required: false,
          questions: [
            {
              id: 'q1',
              type: 'single_choice',
              content: '二次函数 y = x² - 2x + 1 的顶点坐标是？',
              options: ['(1, 0)', '(-1, 0)', '(0, 1)', '(2, 1)'],
              answer: 'A',
              explanation: '配方得 y = (x-1)²，顶点是 (1, 0)',
              points: 10,
            },
            {
              id: 'q2',
              type: 'single_choice',
              content: '抛物线 y = -2x² 的开口方向是？',
              options: ['向上', '向下', '向左', '向右'],
              answer: 'B',
              explanation: '二次项系数 a = -2 < 0，开口向下',
              points: 10,
            },
            {
              id: 'q3',
              type: 'single_choice',
              content: '函数 y = x² + 4x + 3 与 x 轴的交点个数是？',
              options: ['0个', '1个', '2个', '3个'],
              answer: 'C',
              explanation: 'Δ = 16 - 12 = 4 > 0，有2个交点',
              points: 10,
            },
          ],
        },
      },
      {
        id: 'tc-4',
        role: 'user',
        content: '做完了',
        timestamp: new Date('2024-03-10T09:15:00'),
      },
      {
        id: 'tc-5',
        role: 'assistant',
        content: '让我看看...',
        timestamp: new Date('2024-03-10T09:15:02'),
      },
      {
        id: 'tc-6',
        role: 'assistant',
        content: '✅ 批改完成！',
        timestamp: new Date('2024-03-10T09:15:04'),
      },
      {
        id: 'tc-7',
        role: 'assistant',
        content: '你答对了 2/3 题，还不错！',
        timestamp: new Date('2024-03-10T09:15:06'),
      },
      {
        id: 'tc-8',
        role: 'assistant',
        content: '第3题错了，要不要我讲讲？',
        timestamp: new Date('2024-03-10T09:15:08'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '好啊，讲讲吧' },
            { id: 'qr-2', label: '我再想想' },
          ],
        },
      },
    ],
    learningMode: 'self_directed',
    resources: [],
    generatedTasks: [
      {
        id: 'task-quadratic-1',
        type: 'quiz',
        title: '二次函数基础练习',
        description: '测试二次函数基础知识',
        status: 'completed',
        required: false,
        questions: [
          {
            id: 'q1',
            type: 'single_choice',
            content: '二次函数 y = x² - 2x + 1 的顶点坐标是？',
            options: ['(1, 0)', '(-1, 0)', '(0, 1)', '(2, 1)'],
            answer: 'A',
            explanation: '配方得 y = (x-1)²，顶点是 (1, 0)',
            points: 10,
          },
          {
            id: 'q2',
            type: 'single_choice',
            content: '抛物线 y = -2x² 的开口方向是？',
            options: ['向上', '向下', '向左', '向右'],
            answer: 'B',
            explanation: '二次项系数 a = -2 < 0，开口向下',
            points: 10,
          },
          {
            id: 'q3',
            type: 'single_choice',
            content: '函数 y = x² + 4x + 3 与 x 轴的交点个数是？',
            options: ['0个', '1个', '2个', '3个'],
            answer: 'C',
            explanation: 'Δ = 16 - 12 = 4 > 0，有2个交点',
            points: 10,
          },
        ],
      },
    ],
    completedTasks: ['task-quadratic-1'],
  },

  keySteps: [
    { step: 1, description: '用户请求练习', messageId: 'tc-1' },
    { step: 2, description: 'AI 生成任务', messageId: 'tc-2' },
    { step: 3, description: '嵌入任务卡片', messageId: 'tc-3' },
    { step: 4, description: '用户完成答题', messageId: 'tc-4' },
    { step: 5, description: 'AI 批改中', messageId: 'tc-5' },
    { step: 6, description: '批改完成', messageId: 'tc-6' },
    { step: 7, description: '反馈结果', messageId: 'tc-7' },
    { step: 8, description: '引导讲解', messageId: 'tc-8' },
  ],
};
