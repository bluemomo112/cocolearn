'use client';

import { Maximize2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Task, TaskQuestion } from '@/types/shared-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { getQuestionTypeLabel } from './QuestionRenderer';
import RichContent from './RichContent';
import { QuickResultData } from './taskTypes';

interface TaskInlineViewerProps {
  task: Task;
  mode: 'doing' | 'explaining';
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string | string[]>;
  quickResult?: QuickResultData | null;
  explainQuestion?: TaskQuestion | null;
  onFullscreen: () => void;
  onBack: () => void;
  onPrevQuestion?: () => void;
  onNextQuestion?: () => void;
  onExplainQuestion?: (question: TaskQuestion, userAnswer: string | string[], correctAnswer: string | string[]) => void;
}

export default function TaskInlineViewer({
  task, mode, currentQuestionIndex, selectedAnswers,
  quickResult, explainQuestion, onFullscreen, onBack,
  onPrevQuestion, onNextQuestion, onExplainQuestion,
}: TaskInlineViewerProps) {
  const { t } = useLanguage();
  const questions = task.questions || [];
  const totalQuestions = questions.length;

  if (mode === 'explaining' && explainQuestion) {
    // 讲解模式：显示当前题目内容 + 答案对比
    const detail = quickResult?.details.find(d => d.questionId === explainQuestion.id);
    const isCorrect = detail?.correct ?? false;
    const userAnswer = detail?.userAnswer || selectedAnswers[explainQuestion.id] || '';
    const correctAnswer = detail?.correctAnswer || explainQuestion.answer || '';

    // 当前题目在列表中的索引
    const currentIdx = questions.findIndex(q => q.id === explainQuestion.id);

    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm">
            <ChevronLeft size={16} />{t('返回')}
          </button>
          <span className="text-xs text-gray-500 font-medium">{t('AI 讲解中')}</span>
          <button onClick={onFullscreen} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={t('全屏')}>
            <Maximize2 size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
              {isCorrect ? '✓' : '✗'}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {getQuestionTypeLabel(explainQuestion.type)}
            </span>
            <span className="text-xs text-gray-400 ml-auto">{currentIdx + 1} / {totalQuestions}</span>
          </div>
          <div className="text-sm font-medium text-gray-900 leading-relaxed">
            <RichContent content={explainQuestion.content} />
          </div>
          {explainQuestion.options && (
            <div className="space-y-2">
              {explainQuestion.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isUserAnswer = Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter;
                const isCorrectAnswer = Array.isArray(correctAnswer) ? correctAnswer.includes(letter) : correctAnswer === letter;
                return (
                  <div key={i} className={`px-3 py-2 rounded-lg text-xs border ${
                    isCorrectAnswer ? 'border-green-300 bg-green-50' :
                    isUserAnswer ? 'border-red-300 bg-red-50' :
                    'border-gray-200 bg-white'
                  }`}>
                    <span className="font-medium mr-2">{letter}.</span>
                    {opt}
                    {isCorrectAnswer && <CheckCircle size={12} className="inline ml-1 text-green-500" />}
                    {isUserAnswer && !isCorrectAnswer && <XCircle size={12} className="inline ml-1 text-red-500" />}
                  </div>
                );
              })}
            </div>
          )}
          {(detail?.explanation || explainQuestion.explanation) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-semibold text-blue-800 mb-1">{t('解析')}</div>
              <div className="text-xs text-blue-900 leading-relaxed">
                <RichContent content={detail?.explanation || explainQuestion.explanation || ''} />
              </div>
            </div>
          )}
        </div>

        {/* 底部导航栏：上一题 / 详解 / 下一题 */}
        <div className="px-3 py-2.5 border-t border-gray-200 bg-white flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={onPrevQuestion}
            disabled={currentIdx <= 0}
            className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft size={14} />{t('上一题')}
          </button>
          <button
            onClick={() => {
              if (onExplainQuestion) {
                onExplainQuestion(explainQuestion, userAnswer, correctAnswer);
              }
            }}
            className="px-3 py-2 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium hover:bg-primary-100 flex items-center gap-1"
          >
            <Lightbulb size={14} />{t('详细解释')}
          </button>
          <button
            onClick={onNextQuestion}
            disabled={currentIdx >= totalQuestions - 1}
            className="px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {t('下一题')}<ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 做题模式：显示进度 + 全屏按钮
  const answeredCount = Object.keys(selectedAnswers).filter(k => {
    const v = selectedAnswers[k];
    return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0);
  }).length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm">
          <ChevronLeft size={16} />{t('返回')}
        </button>
        <span className="text-xs text-gray-500 font-medium truncate mx-2">{task.title}</span>
        <button onClick={onFullscreen} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={t('全屏')}>
          <Maximize2 size={14} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 进度 */}
        <div className="text-center space-y-3">
          <div className="text-3xl font-bold text-gray-900">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <div className="text-sm text-gray-500">{t('当前进度')}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400">{t('已答')} {answeredCount} / {totalQuestions}</div>
        </div>

        {/* 题目导航 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {questions.map((q, i) => {
            const answered = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== '';
            const resultDetail = quickResult?.details.find(d => d.questionId === q.id);
            let bgClass = 'bg-gray-100 text-gray-600';
            if (resultDetail) {
              bgClass = resultDetail.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
            } else if (answered) {
              bgClass = 'bg-blue-100 text-blue-700';
            }
            return (
              <span key={q.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bgClass} ${i === currentQuestionIndex ? 'ring-2 ring-primary-400' : ''}`}>
                {i + 1}
              </span>
            );
          })}
        </div>

        {/* 全屏按钮 */}
        <button
          onClick={onFullscreen}
          className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Maximize2 size={16} />{t('继续做题（全屏）')}
        </button>
      </div>
    </div>
  );
}
