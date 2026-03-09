'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Award, Lightbulb, RotateCcw, MessageCircle, BookmarkCheck, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Task, TaskQuestion } from '@/types/shared-context';
import QuestionRenderer, { getQuestionTypeLabel } from './QuestionRenderer';
import RichContent from './RichContent';
import { QuickResultData } from './taskTypes';

interface TaskResultReviewProps {
  task: Task;
  quickResult: QuickResultData;
  selectedAnswers: Record<string, string | string[]>;
  onClose: () => void;
  onRetryWrongQuestions?: () => void;
  onGeneratePractice?: () => void;
  onBackToChat?: () => void;
  onExplainQuestion?: (question: TaskQuestion, userAnswer: string | string[], correctAnswer: string | string[]) => void;
}

export default function TaskResultReview({
  task, quickResult, selectedAnswers, onClose,
  onRetryWrongQuestions, onGeneratePractice, onBackToChat, onExplainQuestion,
}: TaskResultReviewProps) {
  const { t } = useLanguage();
  const questions = task.questions || [];
  const [currentPage, setCurrentPage] = useState(0);
  const isSummaryPage = currentPage === questions.length;
  const scorePercent = Math.round((quickResult.correctCount / quickResult.totalCount) * 100);
  const scoreColor = scorePercent >= 80 ? 'text-green-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600';

  const getResult = (qId: string) => quickResult.details.find(d => d.questionId === qId);

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
          <ChevronLeft size={20} /><span className="text-sm font-medium">{t('返回对话')}</span>
        </button>
        <span className="text-base font-semibold text-gray-900">{t('结果回顾')}</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{t('得分')}</span>
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
          >{t('总评')}</button>
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
          <div className="flex-1 overflow-auto">
            <ReviewQuestion
              q={questions[currentPage]}
              idx={currentPage}
              detail={currentDetail}
              answer={selectedAnswers[questions[currentPage].id]}
              onExplainQuestion={() => {
                if (currentQuestion && currentDetail && onExplainQuestion) {
                  const userAns = currentDetail.userAnswer || selectedAnswers[currentQuestion.id] || '';
                  const correctAns = currentDetail.correctAnswer || currentQuestion.answer || '';
                  onExplainQuestion(currentQuestion, userAns, correctAns);
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="h-20 px-8 flex items-center justify-between border-t border-gray-200 bg-white">
        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
          className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          <ChevronLeft size={18} />{t('上一题')}
        </button>
        <span className="text-sm text-gray-500">{isSummaryPage ? t('总评') : `${currentPage + 1} / ${questions.length}`}</span>
        <button onClick={() => setCurrentPage(p => Math.min(questions.length, p + 1))} disabled={isSummaryPage}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          {currentPage === questions.length - 1 ? t('查看总评') : t('下一题')}<ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ReviewQuestion({ q, idx, detail, answer, onExplainQuestion }: {
  q: TaskQuestion; idx: number;
  detail?: QuickResultData['details'][0];
  answer: string | string[] | undefined;
  onExplainQuestion?: () => void;
}) {
  const isCorrect = detail?.correct ?? false;
  const typeLabel = getQuestionTypeLabel(q.type);
  const [removedFromErrorBook, setRemovedFromErrorBook] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-10 px-8">
      <div className="flex items-center gap-3 mb-6">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <span className="text-lg font-semibold text-gray-900">第{idx + 1}题</span>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">{typeLabel}</span>
      </div>

      {/* 错题本提示和操作按钮 */}
      {!isCorrect && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck size={18} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {removedFromErrorBook ? '已从错题本中移除' : '已加入错题本'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRemovedFromErrorBook(!removedFromErrorBook)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} />
                {removedFromErrorBook ? '重新加入' : '从错题本中移除'}
              </button>
              <button
                onClick={onExplainQuestion}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1"
              >
                <Lightbulb size={14} />
                深入详解该题
              </button>
            </div>
          </div>
        </div>
      )}

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
  const { t } = useLanguage();
  const stroke = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 52; // ~326.73
  const dash = (pct / 100) * circumference;
  const wrongCount = result.details.filter(d => d.correct === false && d.userAnswer && (Array.isArray(d.userAnswer) ? d.userAnswer.length > 0 : d.userAnswer !== '')).length;
  const skippedCount = result.totalCount - result.correctCount - wrongCount;
  const hasWrongQuestions = wrongCount > 0;

  return (
    <div className="max-w-2xl mx-auto py-12 px-8">
      {/* Ring chart + stats row */}
      <div className="flex items-center justify-center gap-12 mb-10">
        {/* Ring progress chart */}
        <div className="flex flex-col items-center">
          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                className="transition-all duration-700 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">{pct}%</span>
              <span className="text-sm text-gray-400 mt-1">{result.correctCount} / {result.totalCount}</span>
            </div>
          </div>
        </div>

        {/* Right-side breakdown stats */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm text-gray-600 w-16">{t('正确')}</span>
            <span className="text-lg font-semibold text-gray-900">{result.correctCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm text-gray-600 w-16">{t('错误')}</span>
            <span className="text-lg font-semibold text-gray-900">{wrongCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-gray-300 shrink-0" />
            <span className="text-sm text-gray-600 w-16">{t('跳过')}</span>
            <span className="text-lg font-semibold text-gray-900">{skippedCount}</span>
          </div>
        </div>
      </div>

      {/* AI evaluation */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Award size={20} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-primary-800">{t('AI 综合评价')}</h3>
        </div>
        <p className="text-sm text-primary-900 leading-relaxed">
          {pct >= 80
            ? t('表现优秀！你对本节知识的掌握非常扎实，建议继续挑战更高难度的内容。')
            : pct >= 60
            ? t('表现不错！大部分知识点已经掌握，建议针对错题涉及的知识点进行复习巩固。')
            : t('还需要加油！建议重新回顾学习材料，特别关注错题涉及的核心概念，然后再次尝试。')}
        </p>
      </div>

      {/* Bottom action buttons — always 3 in a row */}
      <div className="flex gap-3">
        {hasWrongQuestions && onRetryWrongQuestions && (
          <button onClick={onRetryWrongQuestions}
            className="flex-1 py-3.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
            <Eye size={18} />{t('回顾错题')}
          </button>
        )}
        {onRetryWrongQuestions && (
          <button onClick={onRetryWrongQuestions}
            className="flex-1 py-3.5 rounded-xl border-2 border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={18} />{t('重做')}
          </button>
        )}
        <button onClick={onBackToChat || onClose}
          className="flex-1 py-3.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          <MessageCircle size={18} />{t('回到AI对话')}
        </button>
      </div>
    </div>
  );
}
