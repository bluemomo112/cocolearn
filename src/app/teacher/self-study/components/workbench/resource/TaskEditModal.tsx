'use client';

import { useState } from 'react';
import { X, Plus, Sparkles, Activity, ChevronDown } from 'lucide-react';
import QuestionEditCard from './QuestionEditCard';

interface TaskEditModalProps {
  editLocalTask: any;
  setEditLocalTask: (task: any) => void;
  onSave: () => void;
  onClose: () => void;
  t: (key: string) => string;
}

export default function TaskEditModal({
  editLocalTask,
  setEditLocalTask,
  onSave,
  onClose,
  t,
}: TaskEditModalProps) {
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [showAIGenConfig, setShowAIGenConfig] = useState(false);
  const [isAIGenModalLoading, setIsAIGenModalLoading] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('single_choice');
  const [aiGenConfig, setAiGenConfig] = useState({
    questionTypes: ['single_choice'] as string[],
    questionCount: 3,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const typeLabels: Record<string, string> = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    true_false: '判断题',
    fill_blank: '填空题',
    short_answer: '简答题',
  };

  const handleQuestionEdit = (questionId: string, field: string, value: any, optionIndex?: number) => {
    const updated = {
      ...editLocalTask,
      questions: (editLocalTask.questions || []).map((q: any) => {
        if (q.id !== questionId) return q;

        // Handle option text edit — also sync answer references
        if (field === 'optionText' && optionIndex !== undefined) {
          const newOptions = [...(q.options || [])];
          const oldVal = newOptions[optionIndex];
          newOptions[optionIndex] = value;
          let newAnswer = q.answer;
          if (Array.isArray(newAnswer)) {
            newAnswer = newAnswer.map((a: string) => (a === oldVal ? value : a));
          } else if (newAnswer === oldVal) {
            newAnswer = value;
          }
          return { ...q, options: newOptions, answer: newAnswer };
        }

        // Handle answer for single_choice / true_false (string)
        if (field === 'answer') {
          return { ...q, answer: value };
        }

        // Handle answer toggle for multiple_choice (array)
        if (field === 'answerToggle') {
          const current = Array.isArray(q.answer) ? [...q.answer] : [];
          const idx = current.indexOf(value);
          if (idx >= 0) {
            current.splice(idx, 1);
          } else {
            current.push(value);
          }
          return { ...q, answer: current };
        }

        // Handle type change — reset options and answer
        if (field === 'type') {
          const typeDefaults: Record<string, any> = {
            single_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: t('选项A') },
            multiple_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: [t('选项A'), t('选项B')] },
            true_false: { options: [t('正确'), t('错误')], answer: t('正确') },
            fill_blank: { options: [], answer: '' },
            short_answer: { options: [], answer: '' },
          };
          return { ...q, type: value, ...(typeDefaults[value] || typeDefaults.single_choice) };
        }

        // Handle add option
        if (field === 'addOption') {
          const newOptions = [...(q.options || []), value];
          return { ...q, options: newOptions };
        }

        // Handle delete option
        if (field === 'deleteOption' && optionIndex !== undefined) {
          const newOptions = [...(q.options || [])];
          const removed = newOptions.splice(optionIndex, 1)[0];
          let newAnswer = q.answer;
          if (Array.isArray(newAnswer)) {
            newAnswer = newAnswer.filter((a: string) => a !== removed);
          } else if (newAnswer === removed) {
            newAnswer = newOptions[0] || '';
          }
          return { ...q, options: newOptions, answer: newAnswer };
        }

        // Generic field update (content, points, required, etc.)
        return { ...q, [field]: value };
      }),
    };
    setEditLocalTask(updated);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const questions = (editLocalTask.questions || []).filter((q: any) => q.id !== questionId);
    setEditLocalTask({ ...editLocalTask, questions, questionCount: questions.length });
  };

  const handleToggleQuestionRequired = (questionId: string) => {
    handleQuestionEdit(questionId, 'required', !(editLocalTask.questions || []).find((q: any) => q.id === questionId)?.required);
  };

  const handleAddQuestion = () => {
    const typeDefaults: Record<string, any> = {
      single_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: t('选项A') },
      multiple_choice: { options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')], answer: [t('选项A'), t('选项B')] },
      true_false: { options: [t('正确'), t('错误')], answer: t('正确') },
      fill_blank: { options: [], answer: '' },
      short_answer: { options: [], answer: '' },
    };
    const defaults = typeDefaults[selectedQuestionType] || typeDefaults.single_choice;
    const newQ = {
      id: `q_${Date.now()}`,
      type: selectedQuestionType,
      content: '',
      ...defaults,
      required: false,
      points: 1,
    };
    const updated = {
      ...editLocalTask,
      questions: [...(editLocalTask.questions || []), newQ],
      questionCount: (editLocalTask.questions || []).length + 1,
    };
    setEditLocalTask(updated);
    // Scroll to bottom after render
    setTimeout(() => {
      const container = document.getElementById('task-edit-question-list');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedQuestionId || draggedQuestionId === targetId) return;
    const questions = [...(editLocalTask.questions || [])];
    const fromIdx = questions.findIndex((q: any) => q.id === draggedQuestionId);
    const toIdx = questions.findIndex((q: any) => q.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = questions.splice(fromIdx, 1);
    questions.splice(toIdx, 0, moved);
    setEditLocalTask({ ...editLocalTask, questions });
  };

  const handleAIGenerateQuestions = async () => {
    setIsAIGenModalLoading(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newQuestions = Array.from({ length: aiGenConfig.questionCount }, (_, i) => ({
      id: `q_ai_${Date.now()}_${i}`,
      type: 'single_choice' as const,
      content: `${t('AI 生成题目')} ${(editLocalTask.questions || []).length + i + 1}`,
      options: [t('选项A'), t('选项B'), t('选项C'), t('选项D')],
      answer: t('选项A'),
      required: false,
      points: 1,
    }));
    setEditLocalTask({
      ...editLocalTask,
      questions: [...(editLocalTask.questions || []), ...newQuestions],
      questionCount: (editLocalTask.questions || []).length + newQuestions.length,
    });
    setIsAIGenModalLoading(false);
  };

  const questions = editLocalTask.questions || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{t('编辑任务')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div id="task-edit-question-list" className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Task title */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('任务标题')}</label>
            <input
              type="text"
              value={editLocalTask.title || ''}
              onChange={(e) => setEditLocalTask({ ...editLocalTask, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('请输入任务标题...')}
            />
          </div>

          {/* Question cards */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              {t('题目列表')} ({questions.length})
            </label>
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => (
                <QuestionEditCard
                  key={q.id}
                  question={q}
                  index={idx}
                  onEdit={(field, value, optionIndex) => handleQuestionEdit(q.id, field, value, optionIndex)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                  onToggleRequired={() => handleToggleQuestionRequired(q.id)}
                  onDragStart={() => setDraggedQuestionId(q.id)}
                  onDragOver={(e) => handleDragOver(e, q.id)}
                  onDragEnd={() => setDraggedQuestionId(null)}
                  t={t}
                  typeLabels={typeLabels}
                />
              ))}
            </div>
          </div>

          {/* Add question area */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(typeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedQuestionType(type)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedQuestionType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={handleAddQuestion}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium"
              >
                <Plus size={14} />
                {t('添加题目')}
              </button>
            </div>
          </div>

          {/* AI Generate section (collapsible) */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAIGenConfig(!showAIGenConfig)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-gray-700">{t('AI 智能出题')}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showAIGenConfig ? 'rotate-180' : ''}`} />
            </button>
            {showAIGenConfig && (
              <div className="px-4 py-3 space-y-3 bg-white">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('题目数量')}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={aiGenConfig.questionCount}
                    onChange={(e) => setAiGenConfig({ ...aiGenConfig, questionCount: parseInt(e.target.value) || 3 })}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('难度')}</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setAiGenConfig({ ...aiGenConfig, difficulty: d })}
                        className={`px-3 py-1 text-xs rounded-lg ${
                          aiGenConfig.difficulty === d
                            ? 'bg-purple-100 text-purple-600 font-medium'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {d === 'easy' ? t('简单') : d === 'medium' ? t('中等') : t('困难')}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleAIGenerateQuestions}
                  disabled={isAIGenModalLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {isAIGenModalLoading ? (
                    <Activity size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isAIGenModalLoading ? t('生成中...') : t('生成题目')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('取消')}
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            {t('保存')}
          </button>
        </div>
      </div>
    </div>
  );
}
