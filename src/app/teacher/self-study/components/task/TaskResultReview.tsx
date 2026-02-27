'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Lightbulb, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
import { Task, TaskQuestion } from '@/types/shared-context';
import QuestionRenderer, { getQuestionTypeLabel } from './QuestionRenderer';
import RichContent from './RichContent';
import { QuickResultData } from './taskTypes';
import ErrorQuestionChat from './ErrorQuestionChat';

interface TaskResultReviewProps {
  task: Task;
  quickResult: QuickResultData;
  selectedAnswers: Record<string, string | string[]>;
  onClose: () => void;
  onRetryWrongQuestions?: () => void;
  onGeneratePractice?: () => void;
  onBackToChat?: () => void;
}

export default function TaskResultReview({
  task, quickResult, selectedAnswers, onClose,
  onRetryWrongQuestions, onGeneratePractice, onBackToChat,
}: TaskResultReviewProps) {
  const questions = task.questions || [];
  const [currentPage, setCurrentPage] = useState(0);
  const [chatHistories, setChatHistories] = useState<Record<string, Array<{ role: 'user' | 'assistant'; content: string }>>>({});
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const isSummaryPage = currentPage === questions.length;
  const scorePercent = Math.round((quickResult.correctCount / quickResult.totalCount) * 100);
  const scoreColor = scorePercent >= 80 ? 'text-green-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600';

  const getResult = (qId: string) => quickResult.details.find(d => d.questionId === qId);

  // Auto-expand chat for wrong answers when navigating
  useEffect(() => {
    if (!isSummaryPage) {
      const q = questions[currentPage];
      const result = getResult(q.id);
      if (result && !result.correct) {
        setExpandedChat(q.id);
      } else {
        setExpandedChat(null);
      }
    }
  }, [currentPage]);

  const handleSendMessage = (questionId: string, message: string) => {
    setChatHistories(prev => {
      const existing = prev[questionId] || [];
      const q = questions.find(q => q.id === questionId);
      const detail = getResult(questionId);
      let history = [...existing];
      if (history.length === 0 && q) {
        const ua = Array.isArray(detail?.userAnswer) ? detail.userAnswer.join(', ') : (detail?.userAnswer || '');
        const ca = Array.isArray(detail?.correctAnswer) ? detail.correctAnswer.join(', ') : (detail?.correctAnswer || q.answer?.toString() || '');
        history.push({
          role: 'assistant',
          content: `让我来帮你分析这道题。\n\n你的答案是「${ua}」，正确答案是「${ca}」。\n\n${detail?.explanation || q.explanation || ''}\n\n如果还有不明白的地方，可以继续问我哦~`
        });
      }
      history.push({ role: 'user', content: message });
      setTimeout(() => {
        setChatHistories(p => ({
          ...p,
          [questionId]: [...(p[questionId] || []), { role: 'assistant', content: `好的，让我换个角度解释一下。\n\n这道题的关键在于理解核心概念。${q?.explanation ? '根据解析：' + q.explanation.substring(0, 100) + '...' : '建议你回顾相关学习材料，重点关注这个知识点。'}\n\n还有其他疑问吗？` }]
        }));
      }, 800);
      return { ...prev, [questionId]: history };
    });
  };

  const getNavColor = (idx: number) => {
    if (idx === questions.length) return 'bg-gray-600 text-white';
    const r = getResult(questions[idx].id);
    if (!r) return 'bg-gray-300 text-gray-600';
    return r.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  };

  const typeStats: Record<string, { total: number; correct: number }> = {};
  questions.forEach(q => {
    const l = getQuestionTypeLabel(q.type);
    if (!typeStats[l]) typeStats[l] = { total: 0, correct: 0 };
    typeStats[l].total++;
    if (getResult(q.id)?.correct) typeStats[l].correct++;
  });

  const currentQuestion = !isSummaryPage ? questions[currentPage] : null;
  const currentDetail = currentQuestion ? getResult(currentQuestion.id) : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-16 px-8 flex items-center justify-between border-b border-gray-200 bg-white">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ChevronLeft size={20} /><span className="text-sm font-medium">返回对话</span>
        </button>
        <span className="text-base font-semibold text-gray-900">结果回顾</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">得分</span>
          <span className={`text-lg font-bold ${scoreColor}`}>{quickResult.correctCount}/{quickResult.totalCount}</span>
        </div>
      </div>

      <div className="px-8 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 flex-wrap">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)}
              className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${getNavColor(i)} ${currentPage === i ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:opacity-80'}`}
            >{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(questions.length)}
            className={`px-3 h-9 rounded-full text-xs font-bold transition-all ${getNavColor(questions.length)} ${isSummaryPage ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:opacity-80'}`}
          >总评</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {isSummaryPage ? (
          <div className="flex-1 overflow-auto">
            <ReviewSummary
              result={quickResult} pct={scorePercent} color={scoreColor} stats={typeStats}
              onClose={onClose}
              onRetryWrongQuestions={onRetryWrongQuestions}
              onGeneratePractice={onGeneratePractice}
              onBackToChat={onBackToChat}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <ReviewQuestion
                q={questions[currentPage]}
                idx={currentPage}
                detail={currentDetail}
                answer={selectedAnswers[questions[currentPage].id]}
              />
            </div>
            {currentQuestion && currentDetail && !currentDetail.correct && (
              <div className="shrink-0">
                <ErrorQuestionChat
                  questionId={currentQuestion.id}
                  question={currentQuestion}
                  userAnswer={currentDetail.userAnswer || selectedAnswers[currentQuestion.id] || ''}
                  correctAnswer={currentDetail.correctAnswer || currentQuestion.answer || ''}
                  explanation={currentDetail.explanation || currentQuestion.explanation}
                  isExpanded={expandedChat === currentQuestion.id}
                  onToggle={() => setExpandedChat(prev => prev === currentQuestion.id ? null : currentQuestion.id)}
                  chatHistory={chatHistories[currentQuestion.id] || []}
                  onSendMessage={handleSendMessage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="h-20 px-8 flex items-center justify-between border-t border-gray-200 bg-white">
        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
          className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          <ChevronLeft size={18} />上一题
        </button>
        <span className="text-sm text-gray-500">{isSummaryPage ? '总评' : `${currentPage + 1} / ${questions.length}`}</span>
        <button onClick={() => setCurrentPage(p => Math.min(questions.length, p + 1))} disabled={isSummaryPage}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          {currentPage === questions.length - 1 ? '查看总评' : '下一题'}<ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ReviewQuestion({ q, idx, detail, answer }: {
  q: TaskQuestion; idx: number;
  detail?: QuickResultData['details'][0];
  answer: string | string[] | undefined;
}) {
  const isCorrect = detail?.correct ?? false;
  const typeLabel = getQuestionTypeLabel(q.type);

  return (
    <div className="max-w-3xl mx-auto py-10 px-8">
      <div className="flex items-center gap-3 mb-6">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <span className="text-lg font-semibold text-gray-900">第{idx + 1}题</span>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">{typeLabel}</span>
      </div>
      <div className="text-2xl font-medium text-gray-900 leading-relaxed mb-8">
        <RichContent content={q.content} />
      </div>
      <QuestionRenderer
        question={q}
        selectedAnswer={answer}
        onAnswer={() => {}}
        disabled
        showResult
        isCorrect={isCorrect}
        correctAnswer={detail?.correctAnswer ?? q.answer}
      />
      {(detail?.explanation || q.explanation) && (
        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">解析</span>
          </div>
          <div className="text-sm text-blue-900 leading-relaxed">
            <RichContent content={detail?.explanation || q.explanation || ''} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSummary({ result, pct, color, stats, onClose, onRetryWrongQuestions, onGeneratePractice, onBackToChat }: {
  result: QuickResultData; pct: number; color: string;
  stats: Record<string, { total: number; correct: number }>;
  onClose: () => void;
  onRetryWrongQuestions?: () => void;
  onGeneratePractice?: () => void;
  onBackToChat?: () => void;
}) {
  const stroke = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const dash = (pct / 100) * 327;
  const hasWrongQuestions = result.correctCount < result.totalCount;

  return (
    <div className="max-w-2xl mx-auto py-12 px-8">
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={`${dash} 327`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">{result.correctCount}</span>
            <span className="text-sm text-gray-500">/ {result.totalCount}</span>
          </div>
        </div>
        <p className={`text-2xl font-bold ${color}`}>正确率 {pct}%</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">各题型表现</h3>
        <div className="space-y-3">
          {Object.entries(stats).map(([label, s]) => {
            const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.correct === s.total ? 'bg-green-500' : s.correct > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${p}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{s.correct}/{s.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Award size={20} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-primary-800">AI 综合评价</h3>
        </div>
        <p className="text-sm text-primary-900 leading-relaxed">
          {pct >= 80
            ? '表现优秀！你对本节知识的掌握非常扎实，建议继续挑战更高难度的内容。'
            : pct >= 60
            ? '表现不错！大部分知识点已经掌握，建议针对错题涉及的知识点进行复习巩固。'
            : '还需要加油！建议重新回顾学习材料，特别关注错题涉及的核心概念，然后再次尝试。'}
        </p>
      </div>

      <div className="space-y-3">
        {hasWrongQuestions && (
          <div className="flex gap-3">
            {onRetryWrongQuestions && (
              <button onClick={onRetryWrongQuestions}
                className="flex-1 py-3.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                <RotateCcw size={18} />重做错题
              </button>
            )}
            {onGeneratePractice && (
              <button onClick={onGeneratePractice}
                className="flex-1 py-3.5 rounded-xl border-2 border-purple-300 bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
                <Sparkles size={18} />生成针对性练习
              </button>
            )}
          </div>
        )}
        <button onClick={onBackToChat || onClose}
          className="w-full py-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />回到对话区继续学习
          </div>
          <span className="text-xs text-primary-200 font-normal">错题分析已同步到AI对话上下文</span>
        </button>
      </div>
    </div>
  );
}
