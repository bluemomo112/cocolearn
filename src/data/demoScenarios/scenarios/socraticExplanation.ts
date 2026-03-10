/**
 * 场景 4：苏格拉底式讲解
 * 通过提问引导学生理解错题
 */

import { DemoScenario } from '../types';

export const socraticExplanation: DemoScenario = {
  id: 'socratic_explanation',
  name: '苏格拉底式讲解',
  description: '通过提问引导学生理解错题',
  category: 'ai_guided',

  initialState: {
    messages: [
      {
        id: 'se-1',
        role: 'user',
        content: '好啊，讲讲吧',
        timestamp: new Date('2024-03-10T09:16:00'),
      },
      {
        id: 'se-2',
        role: 'assistant',
        content: '咱们先不看答案',
        timestamp: new Date('2024-03-10T09:16:02'),
      },
      {
        id: 'se-3',
        role: 'assistant',
        content: '你还记得判别式 Δ 是什么吗？',
        timestamp: new Date('2024-03-10T09:16:04'),
      },
      {
        id: 'se-4',
        role: 'user',
        content: 'b² - 4ac？',
        timestamp: new Date('2024-03-10T09:16:20'),
      },
      {
        id: 'se-5',
        role: 'assistant',
        content: '对！👍',
        timestamp: new Date('2024-03-10T09:16:22'),
      },
      {
        id: 'se-6',
        role: 'assistant',
        content: '那这道题里，a、b、c 分别是多少？',
        timestamp: new Date('2024-03-10T09:16:24'),
      },
      {
        id: 'se-7',
        role: 'user',
        content: 'a=1, b=4, c=3',
        timestamp: new Date('2024-03-10T09:16:40'),
      },
      {
        id: 'se-8',
        role: 'assistant',
        content: '没错！',
        timestamp: new Date('2024-03-10T09:16:42'),
      },
      {
        id: 'se-9',
        role: 'assistant',
        content: '那 Δ = 4² - 4×1×3 = ？',
        timestamp: new Date('2024-03-10T09:16:44'),
      },
      {
        id: 'se-10',
        role: 'user',
        content: '= 16 - 12 = 4',
        timestamp: new Date('2024-03-10T09:17:00'),
      },
      {
        id: 'se-11',
        role: 'assistant',
        content: '对了！Δ = 4 > 0',
        timestamp: new Date('2024-03-10T09:17:02'),
      },
      {
        id: 'se-12',
        role: 'assistant',
        content: '那 Δ > 0 说明什么？',
        timestamp: new Date('2024-03-10T09:17:04'),
      },
      {
        id: 'se-13',
        role: 'user',
        content: '有两个交点！',
        timestamp: new Date('2024-03-10T09:17:15'),
      },
      {
        id: 'se-14',
        role: 'assistant',
        content: '完全正确！🎉',
        timestamp: new Date('2024-03-10T09:17:17'),
      },
      {
        id: 'se-15',
        role: 'assistant',
        content: '你看，一步步推下来就清楚了',
        timestamp: new Date('2024-03-10T09:17:19'),
      },
      {
        id: 'se-16',
        role: 'assistant',
        content: '记住：Δ > 0 → 2个交点，Δ = 0 → 1个交点，Δ < 0 → 0个交点',
        timestamp: new Date('2024-03-10T09:17:21'),
      },
      {
        id: 'se-17',
        role: 'assistant',
        content: '懂了吗？',
        timestamp: new Date('2024-03-10T09:17:23'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '懂了！' },
            { id: 'qr-2', label: '再来一道类似的题' },
          ],
        },
      },
    ],
    learningMode: 'ai_guided',
    resources: [],
    generatedTasks: [],
  },

  keySteps: [
    { step: 1, description: '用户请求讲解', messageId: 'se-1' },
    { step: 2, description: 'AI 引导思考', messageId: 'se-2' },
    { step: 3, description: '第一个问题', messageId: 'se-3' },
    { step: 4, description: '学生回答', messageId: 'se-4' },
    { step: 5, description: 'AI 肯定', messageId: 'se-5' },
    { step: 6, description: '第二个问题', messageId: 'se-6' },
    { step: 7, description: '学生回答', messageId: 'se-7' },
    { step: 8, description: '第三个问题', messageId: 'se-9' },
    { step: 9, description: '学生计算', messageId: 'se-10' },
    { step: 10, description: '第四个问题', messageId: 'se-12' },
    { step: 11, description: '学生理解', messageId: 'se-13' },
    { step: 12, description: 'AI 总结', messageId: 'se-16' },
  ],
};
