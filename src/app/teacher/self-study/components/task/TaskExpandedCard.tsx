'use client';

import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Check, X, Zap, Brain, FileEdit, Activity, AlertCircle,
  CheckCircle, XCircle,
} from 'lucide-react';
import { Task } from '@/types/shared-context';
import { useLanguage } from '@/contexts/LanguageContext';
import QuestionRenderer, { getQuestionTypeLabel } from './QuestionRenderer';
import RichContent from './RichContent';
import SubmissionToolbar from './SubmissionToolbar';
import { QuickResultData } from './taskTypes';

interface TaskExpandedCardProps {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string, answer?: string) => void;
  isCompleted: boolean;
  taskStatus?: string;
  quickResult?: QuickResultData | null;
  displayMode?: 'fullscreen' | 'embedded';
  onToggleMode?: () => void;
  taskState?: {
    currentQuestionIndex: number;
    selectedAnswers: Record<string, string | string[]>;
    submissionText: string;
    status: string;
  };
  onStateUpdate?: (u: any) => void;
}

export default function TaskExpandedCard(props: TaskExpandedCardProps) {
  const {
    task, onClose, onComplete, isCompleted, taskStatus,
    quickResult, displayMode = 'embedded', onToggleMode,
    taskState, onStateUpdate,
  } = props;

  const selectedAnswers = taskState?.selectedAnswers || {};
  const submissionText = taskState?.submissionText || '';
  const idx = taskState?.currentQuestionIndex || 0;

  const onAnswer = (qId: string, ans: string | string[], multi: boolean) => {
    if (multi) {
      const cur = (selectedAnswers[qId] as string[]) || [];
      const a = ans as string;
      const next = cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a];
      onStateUpdate?.({ selectedAnswers: { ...selectedAnswers, [qId]: next } });
    } else {
      onStateUpdate?.({ selectedAnswers: { ...selectedAnswers, [qId]: ans } });
    }
  };

  const submit = () => {
    const answer = task.type === 'quiz' ? JSON.stringify(selectedAnswers) : submissionText;
    onComplete(task.id, answer);
  };

  const goNext = () => { if (task.questions && idx < task.questions.length - 1) onStateUpdate?.({ currentQuestionIndex: idx + 1 }); };
  const goPrev = () => { if (idx > 0) onStateUpdate?.({ currentQuestionIndex: idx - 1 }); };
  const goTo = (i: number) => onStateUpdate?.({ currentQuestionIndex: i });

  if (displayMode === 'fullscreen') {
    return <FullscreenMode {...{ task, idx, selectedAnswers, submissionText, onAnswer, submit, goNext, goPrev, goTo, onClose, onToggleMode, taskStatus, isCompleted, quickResult, onStateUpdate }} />;
  }
  return <EmbeddedMode {...{ task, selectedAnswers, submissionText, onAnswer, submit, onClose, onToggleMode, taskStatus, isCompleted, quickResult, onStateUpdate }} />;
}

function FullscreenMode({ task, idx, selectedAnswers, submissionText, onAnswer, submit, goNext, goPrev, goTo, onClose, onToggleMode, taskStatus, isCompleted, quickResult, onStateUpdate }: any) {
  const { t } = useLanguage();

  // 获取当前题目的即时反馈
  const getQuestionFeedback = (questionId: string) => {
    if (!quickResult?.details) return null;
    return quickResult.details.find((d: any) => d.questionId === questionId) || null;
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* 模态框 - 97% 大小，四周留白 */}
      <div className="fixed z-50 inset-[1.5%] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-gray-900 truncate">{task.title}</h3>
            {task.type === 'quiz' && task.questions && (
              <span className="text-sm text-gray-500 font-medium">{idx + 1} / {task.questions.length}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onToggleMode && (
              <button onClick={onToggleMode} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title={t('缩小到对话区')}>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-3xl">
            {task.type === 'quiz' && task.questions?.[idx] && (() => {
              const q = task.questions[idx];
              const feedback = getQuestionFeedback(q.id);
              const hasAnswered = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== '';
              const showFeedback = !!feedback;

              return (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                      {getQuestionTypeLabel(q.type)}
                    </span>
                    {showFeedback && (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5 ${
                        feedback.correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {feedback.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {feedback.correct ? t('回答正确') : t('回答错误')}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-medium text-gray-900 leading-relaxed">
                    <RichContent content={q.content} />
                  </div>
                  <QuestionRenderer
                    question={q}
                    selectedAnswer={selectedAnswers[q.id]}
                    onAnswer={onAnswer}
                    showResult={showFeedback}
                    isCorrect={feedback?.correct}
                    correctAnswer={feedback?.correctAnswer}
                  />

                  {/* 答题反馈区域 */}
                  {showFeedback && !feedback.correct && (
                    <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle size={18} />
                        <span className="font-medium text-sm">{t('没关系，继续加油')}</span>
                      </div>
                      {feedback.correctAnswer && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-green-700">{t('正确答案')}：</span>
                          <span className="text-green-700">
                            {Array.isArray(feedback.correctAnswer) ? feedback.correctAnswer.join(', ') : feedback.correctAnswer}
                          </span>
                        </div>
                      )}
                      {feedback.explanation && (
                        <div className="text-sm text-gray-600 pt-1 border-t border-red-100">
                          <RichContent content={feedback.explanation} compact />
                        </div>
                      )}
                    </div>
                  )}

                  {showFeedback && feedback.correct && feedback.explanation && (
                    <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm">{t('回答正确')}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <RichContent content={feedback.explanation} compact />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {(task.type === 'assignment' || task.type === 'reflection') && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-gray-900">{task.title}</h2>
                {task.description && <p className="text-base text-gray-600">{task.description}</p>}
                <SubmissionToolbar value={submissionText} onChange={(v: string) => onStateUpdate?.({ submissionText: v })} />
              </div>
            )}
          </div>
        </div>

        {/* Footer - 导航 + 提交 */}
        <div className="h-20 px-8 flex items-center justify-between border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            {task.type === 'quiz' && task.questions && (
              <button onClick={goPrev} disabled={idx === 0}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                <ChevronLeft size={18} />{t('上一题')}
              </button>
            )}
            {task.type === 'quiz' && task.questions && task.questions.length > 1 && (
              <div className="flex items-center gap-2">
                {task.questions.map((_: any, i: number) => {
                  const qId = task.questions[i].id;
                  const answered = selectedAnswers[qId];
                  const fb = getQuestionFeedback(qId);
                  return (
                    <button key={i} onClick={() => goTo(i)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        i === idx ? 'bg-primary-500 text-white ring-2 ring-primary-200'
                        : fb?.correct ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : fb && !fb.correct ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : answered ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{i + 1}</button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {task.type === 'quiz' && task.questions && idx < task.questions.length - 1 && (
              <button onClick={goNext}
                className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 flex items-center gap-2 transition-colors">
                {t('下一题')}<ChevronRight size={18} />
              </button>
            )}
            {((task.type === 'quiz' && task.questions && idx === task.questions.length - 1) || task.type !== 'quiz') && (
              <SubmitButton taskStatus={taskStatus} isCompleted={isCompleted} quickResult={quickResult} onSubmit={submit} size="lg" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmbeddedMode({ task, selectedAnswers, submissionText, onAnswer, submit, onClose, onToggleMode, taskStatus, isCompleted, quickResult, onStateUpdate }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden mb-4">
      <div className={`px-4 py-3 flex items-center justify-between ${
        task.type === 'quiz' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100'
        : task.type === 'reflection' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100'
        : 'bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            task.type === 'quiz' ? 'bg-amber-100' : task.type === 'reflection' ? 'bg-purple-100' : 'bg-primary-100'
          }`}>
            {task.type === 'quiz' ? <Zap size={18} className="text-amber-600" />
            : task.type === 'reflection' ? <Brain size={18} className="text-purple-600" />
            : <FileEdit size={18} className="text-primary-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            <p className="text-xs text-gray-500">{task.required ? '必修任务' : '选修任务'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleMode && (
            <button onClick={onToggleMode} className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center" title="放大到全屏">
              <ChevronUp size={16} className="text-gray-500" />
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {task.description && <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">{task.description}</p>}

        {task.type === 'quiz' && task.questions && (
          <div className="space-y-4">
            {task.questions.map((q: any, i: number) => (
              <div key={q.id} className="space-y-1.5">
                <div className="text-xs text-gray-700 font-medium">
                  <span>{i + 1}. </span>
                  <RichContent content={q.content} className="inline" compact />
                  {q.type === 'multiple_choice' && <span className="ml-1 text-xs text-blue-600">(多选)</span>}
                  {q.type === 'true_false' && <span className="ml-1 text-xs text-purple-600">(判断)</span>}
                  {q.type === 'fill_in_blank' && <span className="ml-1 text-xs text-green-600">(填空)</span>}
                </div>
                <QuestionRenderer question={q} selectedAnswer={selectedAnswers[q.id]} onAnswer={onAnswer} compact />
              </div>
            ))}
          </div>
        )}

        {(task.type === 'assignment' || task.type === 'reflection') && (
          <div className="space-y-3">
            {task.prompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                <p className="text-xs text-blue-900 whitespace-pre-line">{task.prompt}</p>
              </div>
            )}
            <textarea value={submissionText} onChange={(e: any) => onStateUpdate?.({ submissionText: e.target.value })}
              placeholder={task.submissionPlaceholder || '请在这里提交你的作业内容...'}
              className="w-full h-40 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}

        {task.type === 'quiz' && quickResult && (
          <div className={`mt-3 p-3 rounded-lg border ${quickResult.allCorrect ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {quickResult.allCorrect ? <Check size={14} className="text-green-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                <span className={`text-xs font-bold ${quickResult.allCorrect ? 'text-green-700' : 'text-amber-700'}`}>
                  {quickResult.allCorrect ? '全部正确！' : '部分正确'}
                </span>
              </div>
              <span className={`text-xs font-medium ${quickResult.allCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                {quickResult.correctCount}/{quickResult.totalCount} 题正确
              </span>
            </div>
          </div>
        )}

        <SubmitButton taskStatus={taskStatus} isCompleted={isCompleted} quickResult={quickResult} onSubmit={submit} size="sm" />
      </div>
    </div>
  );
}

function SubmitButton({ taskStatus, isCompleted, quickResult, onSubmit, size }: any) {
  const { t } = useLanguage();
  const isSm = size === 'sm';
  const base = isSm ? 'mt-3 w-full py-2 rounded-lg text-xs' : 'px-8 py-3 rounded-xl';
  const disabled = taskStatus === 'submitting' || taskStatus === 'grading';
  const done = isCompleted && quickResult?.allCorrect;

  return (
    <button onClick={onSubmit} disabled={disabled || done}
      className={`${base} font-medium transition-all flex items-center justify-center gap-2 ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
        : done ? 'bg-green-100 text-green-700 cursor-not-allowed'
        : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}>
      {taskStatus === 'submitting' ? (<><Activity size={isSm ? 16 : 18} className="animate-spin" />{t('提交中...')}</>)
      : taskStatus === 'grading' ? (<><Activity size={isSm ? 16 : 18} className="animate-spin" />{t('批改中...')}</>)
      : done ? (<><Check size={isSm ? 16 : 18} />{t('已完成')}</>)
      : (<><Check size={isSm ? 16 : 18} />{quickResult && !quickResult.allCorrect ? t('重新提交') : t('提交任务')}</>)}
    </button>
  );
}
