/**
 * 场景 6：自由探索模式
 * 用户主导的深度对话和资源推荐
 */

import { DemoScenario } from '../types';

export const selfDirectedExploration: DemoScenario = {
  id: 'self_directed_exploration',
  name: '自由探索模式',
  description: '用户主导的深度对话和资源推荐',
  category: 'exploration',

  initialState: {
    messages: [
      {
        id: 'sd-1',
        role: 'user',
        content: '二次函数在生活中有什么用？',
        timestamp: new Date('2024-03-10T09:25:00'),
      },
      {
        id: 'sd-2',
        role: 'assistant',
        content: '好问题！用处可多了',
        timestamp: new Date('2024-03-10T09:25:02'),
      },
      {
        id: 'sd-3',
        role: 'assistant',
        content: '比如投篮🏀，篮球的运动轨迹就是抛物线',
        timestamp: new Date('2024-03-10T09:25:04'),
      },
      {
        id: 'sd-4',
        role: 'assistant',
        content: '还有喷泉💦，水柱的形状也是抛物线',
        timestamp: new Date('2024-03-10T09:25:06'),
      },
      {
        id: 'sd-5',
        role: 'assistant',
        content: '建筑上也常用，像拱桥🌉的形状',
        timestamp: new Date('2024-03-10T09:25:08'),
      },
      {
        id: 'sd-6',
        role: 'user',
        content: '那怎么用二次函数算投篮轨迹？',
        timestamp: new Date('2024-03-10T09:25:30'),
      },
      {
        id: 'sd-7',
        role: 'assistant',
        content: '这个问题有点深度啊',
        timestamp: new Date('2024-03-10T09:25:32'),
      },
      {
        id: 'sd-8',
        role: 'assistant',
        content: '需要知道三个东西：出手高度、出手角度、初速度',
        timestamp: new Date('2024-03-10T09:25:34'),
      },
      {
        id: 'sd-9',
        role: 'assistant',
        content: '然后用物理公式结合二次函数就能算出轨迹',
        timestamp: new Date('2024-03-10T09:25:36'),
      },
      {
        id: 'sd-10',
        role: 'assistant',
        content: '要不要我给你生成一个互动模拟？可以调参数看轨迹变化',
        timestamp: new Date('2024-03-10T09:25:38'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '好啊！' },
            { id: 'qr-2', label: '先不用' },
          ],
        },
      },
      {
        id: 'sd-11',
        role: 'user',
        content: '好啊！',
        timestamp: new Date('2024-03-10T09:25:50'),
      },
      {
        id: 'sd-12',
        role: 'assistant',
        content: '正在生成互动模拟...',
        timestamp: new Date('2024-03-10T09:25:52'),
      },
      {
        id: 'sd-13',
        role: 'assistant',
        content: '✅ 生成完成！',
        timestamp: new Date('2024-03-10T09:25:56'),
      },
      {
        id: 'sd-14',
        role: 'assistant',
        content: '左边资源区可以打开，试试调整参数看看效果',
        timestamp: new Date('2024-03-10T09:25:58'),
      },
      {
        id: 'sd-15',
        role: 'assistant',
        content: '还想了解什么？',
        timestamp: new Date('2024-03-10T09:26:00'),
        suggestions: {
          quickReplies: [
            { id: 'qr-3', label: '为什么45度角投得最远？' },
            { id: 'qr-4', label: '二次函数还有啥应用？' },
            { id: 'qr-5', label: '我想做点题' },
          ],
        },
      },
    ],
    learningMode: 'self_directed',
    resources: [
      {
        id: 'res-sim-1',
        title: '投篮轨迹模拟器',
        type: 'interactive',
        description: '调整参数观察抛物线变化',
        interactiveCategory: 'simulation',
        url: '/interactive/basketball-trajectory',
      },
    ],
    generatedTasks: [],
  },

  keySteps: [
    { step: 1, description: '用户提出问题', messageId: 'sd-1' },
    { step: 2, description: 'AI 回答应用场景', messageId: 'sd-2' },
    { step: 3, description: '举例说明', messageId: 'sd-3' },
    { step: 4, description: '用户深入提问', messageId: 'sd-6' },
    { step: 5, description: 'AI 详细解答', messageId: 'sd-8' },
    { step: 6, description: '推荐资源', messageId: 'sd-10' },
    { step: 7, description: '用户接受', messageId: 'sd-11' },
    { step: 8, description: '生成资源', messageId: 'sd-12' },
    { step: 9, description: '引导继续探索', messageId: 'sd-15' },
  ],
};
