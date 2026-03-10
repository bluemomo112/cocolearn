/**
 * 场景 5：AI引导模式
 * 展示学习路径、知识检查点、主题过渡
 */

import { DemoScenario } from '../types';

export const aiGuidedLearning: DemoScenario = {
  id: 'ai_guided_learning',
  name: 'AI引导模式',
  description: '展示学习路径、知识检查点、主题过渡',
  category: 'ai_guided',

  initialState: {
    messages: [
      {
        id: 'ag-1',
        role: 'assistant',
        content: '我帮你规划了一条学习路径',
        timestamp: new Date('2024-03-10T09:20:00'),
      },
      {
        id: 'ag-2',
        role: 'assistant',
        content: '右边可以看到完整的路线图 👉',
        timestamp: new Date('2024-03-10T09:20:02'),
      },
      {
        id: 'ag-3',
        role: 'assistant',
        content: '咱们从基础概念开始',
        timestamp: new Date('2024-03-10T09:20:04'),
      },
      {
        id: 'ag-4',
        role: 'assistant',
        content: '二次函数的标准形式是 y = ax² + bx + c',
        timestamp: new Date('2024-03-10T09:20:06'),
      },
      {
        id: 'ag-5',
        role: 'assistant',
        content: '其中 a ≠ 0，这个很重要',
        timestamp: new Date('2024-03-10T09:20:08'),
      },
      {
        id: 'ag-6',
        role: 'assistant',
        content: '为什么 a 不能等于 0 呢？',
        timestamp: new Date('2024-03-10T09:20:10'),
        checkpoint: {
          question: '为什么二次函数中 a ≠ 0？',
          options: [
            '因为 a=0 时就变成一次函数了',
            '因为 a=0 时无法计算',
            '因为 a=0 时图像不存在',
            '没有特别原因',
          ],
          correctAnswer: '因为 a=0 时就变成一次函数了',
          status: 'pending',
          explanation: '如果 a=0，函数就变成 y=bx+c，这是一次函数，不是二次函数了',
          relatedNodeId: 'node_1',
        },
        messageType: 'knowledge_checkpoint',
      },
      {
        id: 'ag-7',
        role: 'user',
        content: '因为 a=0 时就变成一次函数了',
        timestamp: new Date('2024-03-10T09:20:30'),
      },
      {
        id: 'ag-8',
        role: 'assistant',
        content: '✅ 完全正确！',
        timestamp: new Date('2024-03-10T09:20:32'),
      },
      {
        id: 'ag-9',
        role: 'assistant',
        content: '看来基础概念你掌握得不错',
        timestamp: new Date('2024-03-10T09:20:34'),
      },
      {
        id: 'ag-10',
        role: 'assistant',
        content: '---\n\n📍 **主题过渡**\n\n从 **基础概念** → **图像性质**\n\n已完成：定义、标准形式\n接下来：抛物线的开口、顶点、对称轴',
        timestamp: new Date('2024-03-10T09:20:36'),
        messageType: 'topic_transition',
        transition: {
          fromTopic: '基础概念与定义',
          toTopic: '图像与性质',
          fromNodeId: 'node_1',
          toNodeId: 'node_2',
          summary: '已掌握二次函数的定义和标准形式，接下来学习图像特征',
        },
      },
      {
        id: 'ag-11',
        role: 'assistant',
        content: '准备好了吗？',
        timestamp: new Date('2024-03-10T09:20:38'),
        suggestions: {
          quickReplies: [
            { id: 'qr-1', label: '继续' },
            { id: 'qr-2', label: '休息一下' },
          ],
        },
      },
    ],
    learningMode: 'ai_guided',
    resources: [],
    generatedTasks: [],
    learningPath: [
      {
        id: 'node_1',
        title: '基础概念与定义',
        status: 'mastered',
        estimatedTime: 15,
      },
      {
        id: 'node_2',
        title: '图像与性质',
        status: 'learning',
        estimatedTime: 20,
      },
      {
        id: 'node_3',
        title: '顶点式与配方',
        status: 'pending',
        estimatedTime: 25,
      },
      {
        id: 'node_4',
        title: '应用与综合',
        status: 'pending',
        estimatedTime: 30,
      },
    ],
  },

  keySteps: [
    { step: 1, description: '展示学习路径', messageId: 'ag-1' },
    { step: 2, description: '引导查看路径', messageId: 'ag-2' },
    { step: 3, description: '开始讲解', messageId: 'ag-3' },
    { step: 4, description: '知识点讲解', messageId: 'ag-4' },
    { step: 5, description: '知识检查点', messageId: 'ag-6' },
    { step: 6, description: '学生回答', messageId: 'ag-7' },
    { step: 7, description: 'AI 反馈', messageId: 'ag-8' },
    { step: 8, description: '主题过渡卡片', messageId: 'ag-10' },
    { step: 9, description: '引导继续', messageId: 'ag-11' },
  ],
};
