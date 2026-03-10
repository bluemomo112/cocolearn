/**
 * 快捷回复和题目解释的 Mock 对话内容
 * 口语化、有价值、能演示功能
 */

import { TaskQuestion } from '@/types/shared-context';

/**
 * 题目解释的对话流程
 */
export function generateExplainQuestionDialogue(
  question: TaskQuestion,
  userAnswer: string | string[],
  correctAnswer: string | string[],
  isCorrect: boolean
) {
  const formatAnswer = (ans: string | string[]) => {
    return Array.isArray(ans) ? ans.join(', ') : ans;
  };

  // 用户消息
  const userMessage = `这道题我选了 ${formatAnswer(userAnswer)}，${isCorrect ? '对吗？' : '为什么错了？'}`;

  // AI 回复（短小、引导式）
  let aiMessages: string[] = [];

  if (isCorrect) {
    aiMessages = [
      '对的！👍',
      '不过我们可以深入理解一下',
      question.explanation || '这道题的关键是...',
    ];
  } else {
    aiMessages = [
      '咱们一起分析一下',
      `你选的是 ${formatAnswer(userAnswer)}`,
      `正确答案是 ${formatAnswer(correctAnswer)}`,
      question.explanation || '区别在于...',
    ];
  }

  // 快捷回复选项（有价值的）
  const quickReplies = isCorrect
    ? [
        { id: 'similar_question', label: '来道类似的题' },
        { id: 'harder_question', label: '来道更难的' },
        { id: 'understand', label: '懂了' },
      ]
    : [
        { id: 'step_by_step', label: '一步步讲' },
        { id: 'give_example', label: '举个例子' },
        { id: 'similar_question', label: '再来一道' },
      ];

  // 功能按钮（演示功能）
  const actionButtons = [
    {
      id: 'generate_variant',
      label: '生成变种题',
      description: '基于这道题生成类似题目',
      iconName: 'RotateCcw',
      studioToolId: 'generate_variant_question',
    },
  ];

  return {
    userMessage,
    aiMessages,
    quickReplies,
    actionButtons,
  };
}

/**
 * 快捷回复点击后的对话内容
 */
export const quickReplyResponses: Record<string, string[]> = {
  // 题目解释相关
  step_by_step: [
    '好的，咱们一步步来',
    '首先...',
    '然后...',
    '最后...',
    '这样理解了吗？',
  ],

  give_example: [
    '举个例子',
    '比如...',
    '这样就清楚了吧？',
  ],

  similar_question: [
    '好的，再来一道类似的',
    '这次试试看',
  ],

  harder_question: [
    '挑战一下更难的',
    '这道题需要综合运用',
  ],

  understand: [
    '很好！',
    '那咱们继续',
  ],

  // 学习相关
  quiz_me: [
    '来考考你',
    '准备好了吗？',
  ],

  continue: [
    '好的，继续',
  ],

  more_examples: [
    '再举几个例子',
    '例子1：...',
    '例子2：...',
  ],

  practice: [
    '好，来试试',
    '我给你出道题',
  ],

  explain_more: [
    '换个角度说',
    '简单讲就是...',
  ],

  example: [
    '举个例子吧',
    '就像...',
  ],

  // AI 引导模式
  more_quiz: [
    '继续考',
    '下一题',
  ],

  hint: [
    '给你个提示',
    '想想...',
  ],

  ready: [
    '很好',
    '咱们开始',
  ],

  review: [
    '好的，复习一下',
    '之前学了...',
  ],

  next: [
    '进入下一个知识点',
  ],

  related: [
    '相关的概念有...',
  ],
};

/**
 * 生成快捷回复的响应
 */
export function generateQuickReplyResponse(replyId: string): string {
  const responses = quickReplyResponses[replyId];
  if (!responses) {
    return '好的';
  }
  return responses.join('\n\n');
}
