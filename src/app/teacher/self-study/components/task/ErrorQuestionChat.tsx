'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Send, Bot } from 'lucide-react';
import type { TaskQuestion } from '@/types/shared-context';

interface ErrorQuestionChatProps {
  questionId: string;
  question: TaskQuestion;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation?: string;
  isExpanded: boolean;
  onToggle: () => void;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  onSendMessage: (questionId: string, message: string) => void;
}

function generateInitialExplanation(
  question: TaskQuestion,
  userAnswer: string | string[],
  correctAnswer: string | string[],
  explanation?: string,
): string {
  const ua = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;
  const ca = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;
  let msg = `让我来帮你分析这道题。\n\n`;
  msg += `你的答案是「${ua}」，正确答案是「${ca}」。\n\n`;
  if (explanation) {
    msg += `解析：${explanation}\n\n`;
  }
  msg += `如果还有不明白的地方，可以继续问我哦~`;
  return msg;
}

export default function ErrorQuestionChat({
  questionId,
  question,
  userAnswer,
  correctAnswer,
  explanation,
  isExpanded,
  onToggle,
  chatHistory,
  onSendMessage,
}: ErrorQuestionChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMessages =
    chatHistory.length > 0
      ? chatHistory
      : [
          {
            role: 'assistant' as const,
            content: generateInitialExplanation(question, userAnswer, correctAnswer, explanation),
          },
        ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages.length, isExpanded]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(questionId, trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <div
        onClick={onToggle}
        className="h-12 bg-gray-50 border-t border-gray-200 rounded-b-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500"
      >
        <Bot className="w-4 h-4" />
        <span>🤖 点击展开 AI 讲解</span>
        <ChevronUp className="w-4 h-4" />
      </div>
    );
  }

  // Expanded state
  return (
    <div className="border-t border-gray-200 bg-white rounded-b-xl">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Bot className="w-4 h-4" />
          🤖 AI 讲解
        </div>
        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          收起 <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="px-4 py-3 space-y-3 overflow-y-auto max-h-[280px]">
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === 'assistant'
                ? 'bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap'
                : 'bg-primary-50 rounded-xl p-3 text-sm text-gray-700 ml-auto max-w-[80%] whitespace-pre-wrap'
            }
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
