/**
 * 快捷回复和题目解释的 Mock 对话内容
 * 口语化、有价值、能演示功能
 */

import { TaskQuestion } from '@/types/shared-context';

/**
 * 题目解释的对话流程（苏格拉底式引导）
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
  const userMessage = isCorrect
    ? `这道题我选了 ${formatAnswer(userAnswer)}，对吗？`
    : `这道题我选了 ${formatAnswer(userAnswer)}，为什么错了？`;

  // AI 回复（苏格拉底式引导，不直接给答案）
  let aiMessages: string[] = [];

  if (isCorrect) {
    // 答对了，引导深入理解
    aiMessages = [
      '对的！👍',
      '不过咱们深入想想',
      '你为什么选这个答案？',
    ];
  } else {
    // 答错了，通过提问引导
    aiMessages = [
      '先别急着看答案',
      '咱们一起分析',
      '你选这个答案的理由是什么？',
    ];
  }

  // 快捷回复选项（引导学生思考）
  const quickReplies = isCorrect
    ? [
        { id: 'explain_reasoning', label: '因为...' },
        { id: 'not_sure', label: '不太确定' },
      ]
    : [
        { id: 'explain_reasoning', label: '我觉得...' },
        { id: 'need_hint', label: '给个提示' },
        { id: 'show_answer', label: '直接告诉我吧' },
      ];

  // 功能按钮
  const actionButtons = [
    {
      id: 'generate_variant',
      label: '生成变种题',
      description: '练习类似题目',
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
 * 快捷回复点击后的对话内容（苏格拉底式引导）
 */
export const quickReplyResponses: Record<string, string[]> = {
  // 题目解释 - 苏格拉底式引导
  explain_reasoning: [
    '说说你的想法',
    '为什么这样想？',
  ],

  not_sure: [
    '没关系',
    '咱们一起想',
    '这道题的关键词是什么？',
  ],

  need_hint: [
    '好的，给你个提示',
    '注意题目中的...',
    '再想想看',
  ],

  show_answer: [
    '好吧',
    '正确答案是...',
    '理解了吗？',
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
    '比如...',
  ],

  practice: [
    '好，来试试',
  ],

  explain_more: [
    '换个角度说',
    '简单讲就是...',
  ],

  example: [
    '举个例子',
    '就像...',
  ],

  // AI 引导模式
  more_quiz: [
    '继续考',
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
  ],

  next: [
    '进入下一个',
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
