'use client';

import { GripVertical, Trash2, ChevronDown, Plus, X } from 'lucide-react';

interface QuestionEditCardProps {
  question: any;
  index: number;
  onEdit: (field: string, value: any, optionIndex?: number) => void;
  onDelete: () => void;
  onToggleRequired: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  t: (key: string) => string;
  typeLabels: Record<string, string>;
}

export default function QuestionEditCard({
  question,
  index,
  onEdit,
  onDelete,
  onToggleRequired,
  onDragStart,
  onDragOver,
  onDragEnd,
  t,
  typeLabels,
}: QuestionEditCardProps) {
  const typeOptions = Object.entries(typeLabels);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
        <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />
        <span className="text-sm font-medium text-gray-500 flex-shrink-0">{index + 1}.</span>

        {/* Type selector */}
        <div className="relative">
          <select
            value={question.type}
            onChange={(e) => onEdit('type', e.target.value)}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-6 cursor-pointer"
          >
            {typeOptions.map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex-1" />

        {/* Required toggle */}
        <button
          onClick={onToggleRequired}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            question.required
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          {question.required ? t('必修') : t('选修')}
        </button>

        {/* Points */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={100}
            value={question.points || 1}
            onChange={(e) => onEdit('points', parseInt(e.target.value) || 1)}
            className="w-12 text-xs text-center px-1 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <span className="text-xs text-gray-400">{t('分')}</span>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 space-y-3">
        {/* Question content */}
        <textarea
          value={question.content || ''}
          onChange={(e) => onEdit('content', e.target.value)}
          placeholder={t('请输入题目内容...')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Type-specific editing area */}
        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <ChoiceEditor question={question} onEdit={onEdit} t={t} />
        )}

        {question.type === 'true_false' && (
          <TrueFalseEditor question={question} onEdit={onEdit} t={t} />
        )}

        {question.type === 'fill_blank' && (
          <FillBlankEditor question={question} onEdit={onEdit} t={t} />
        )}

        {question.type === 'short_answer' && (
          <div className="px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 italic">{t('简答题将由 AI 自动评分')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Choice Editor (single / multiple) ── */
function ChoiceEditor({ question, onEdit, t }: { question: any; onEdit: (field: string, value: any, optionIndex?: number) => void; t: (key: string) => string }) {
  const isMultiple = question.type === 'multiple_choice';
  const options: string[] = question.options || [];
  const answer = question.answer;

  const isSelected = (opt: string) => {
    if (isMultiple) return Array.isArray(answer) && answer.includes(opt);
    return answer === opt;
  };

  const handleSelect = (opt: string) => {
    if (isMultiple) {
      onEdit('answerToggle', opt);
    } else {
      onEdit('answer', opt);
    }
  };

  const letterLabel = (i: number) => String.fromCharCode(65 + i); // A, B, C, D...

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">{t('选项')}</label>
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          {/* Radio / Checkbox indicator */}
          <button
            type="button"
            onClick={() => handleSelect(opt)}
            className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
              isMultiple ? 'rounded' : 'rounded-full'
            } ${
              isSelected(opt)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {isSelected(opt) && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Letter label */}
          <span className="text-xs text-gray-400 w-4 flex-shrink-0">{letterLabel(idx)}.</span>

          {/* Option text input */}
          <input
            type="text"
            value={opt}
            onChange={(e) => onEdit('optionText', e.target.value, idx)}
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />

          {/* Delete option (only if > 2 options) */}
          {options.length > 2 && (
            <button
              onClick={() => onEdit('deleteOption', null, idx)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {/* Add option */}
      <button
        onClick={() => onEdit('addOption', `${t('选项')}${letterLabel(options.length)}`)}
        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 px-2 py-1.5 hover:bg-primary-50 rounded-md transition-colors"
      >
        <Plus size={12} />
        {t('添加选项')}
      </button>
    </div>
  );
}

/* ── True/False Editor ── */
function TrueFalseEditor({ question, onEdit, t }: { question: any; onEdit: (field: string, value: any) => void; t: (key: string) => string }) {
  const options = [t('正确'), t('错误')];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">{t('正确答案')}</label>
      <div className="flex items-center gap-4">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => onEdit('answer', opt)}
              className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 rounded-full transition-colors ${
                question.answer === opt
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {question.answer === opt && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── Fill Blank Editor ── */
function FillBlankEditor({ question, onEdit, t }: { question: any; onEdit: (field: string, value: any) => void; t: (key: string) => string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">{t('参考答案')}</label>
      <input
        type="text"
        value={question.answer || ''}
        onChange={(e) => onEdit('answer', e.target.value)}
        placeholder={t('请输入参考答案...')}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}
