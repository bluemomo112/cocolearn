/**
 * AI 对话 Mock 回复内容
 * 口语化、短小精悍的回复模板
 */

export interface MockReplyContext {
  learningMode: 'self_directed' | 'ai_guided' | 'diagnostic';
  userMsgCount: number;
  masteredCount?: number;
  totalNodes?: number;
  currentNodeTitle?: string;
  learningPathSummary?: string;
}

/**
 * 自由探索模式的回复
 */
export const selfDirectedReplies = {
  search: [
    '让我查查...',
    '找到了！这个概念主要是...',
    '简单说就是...',
    '还想了解什么？',
  ],

  summary: [
    '好的，帮你梳理一下',
    '核心就这几点：',
    '1. ...',
    '2. ...',
    '懂了吗？',
  ],

  example: [
    '举个例子吧',
    '就像...',
    '这样理解对吗？',
  ],

  default: [
    '好问题！',
    '我觉得关键是...',
    '你可以这样想...',
    '还有疑问吗？',
  ],
};

/**
 * AI 引导模式的回复
 */
export const aiGuidedReplies = {
  quiz: [
    '来考考你',
    '这个知识点，你能解释一下吗？',
    '💭 提示：想想之前学的内容',
  ],

  next: [
    '不错！',
    '咱们继续下一个知识点',
    '准备好了吗？',
  ],

  progress: (mastered: number, total: number) => [
    `你已经掌握了 ${mastered}/${total} 个知识点`,
    `完成了 ${Math.round((mastered / total) * 100)}%`,
    '继续加油！',
  ],

  hint: [
    '给你个提示',
    '注意这几个关键词...',
    '想想和前面的联系',
    '试试用自己的话说说看',
  ],

  default: [
    '很好的思考！',
    '让我引导你理解...',
    '关键是...',
    '你能用自己的话解释吗？',
  ],
};

/**
 * 生成 Mock AI 回复
 */
export function generateMockAIReply(
  userInput: string,
  context: MockReplyContext
): string {
  const { learningMode, userMsgCount, masteredCount = 0, totalNodes = 5, currentNodeTitle = '' } = context;

  let replies: string[] = [];

  if (learningMode === 'self_directed') {
    if (userInput.includes('搜索') || userInput.includes('概念')) {
      replies = selfDirectedReplies.search;
    } else if (userInput.includes('总结') || userInput.includes('要点')) {
      replies = selfDirectedReplies.summary;
    } else if (userInput.includes('例子') || userInput.includes('举例')) {
      replies = selfDirectedReplies.example;
    } else {
      replies = selfDirectedReplies.default;
    }

    // 每 4 条消息提示一次学习进度
    if (userMsgCount % 4 === 0 && userMsgCount >= 4) {
      replies.push(`\n---\n💡 你已经涉及了 ${masteredCount}/${totalNodes} 个知识点，要看看完整路径吗？`);
    }
  } else {
    // AI 引导模式
    if (userInput.includes('考考') || userInput.includes('测试')) {
      replies = aiGuidedReplies.quiz;
      if (currentNodeTitle) {
        replies[1] = `关于「${currentNodeTitle}」，${replies[1]}`;
      }
    } else if (userInput.includes('下一') || userInput.includes('继续')) {
      replies = aiGuidedReplies.next;
    } else if (userInput.includes('路径') || userInput.includes('进度')) {
      replies = aiGuidedReplies.progress(masteredCount, totalNodes);
    } else if (userInput.includes('提示') || userInput.includes('帮助')) {
      replies = aiGuidedReplies.hint;
      if (currentNodeTitle) {
        replies[0] = `关于「${currentNodeTitle}」，${replies[0]}`;
      }
    } else {
      replies = aiGuidedReplies.default;
    }
  }

  return replies.join('\n\n');
}
