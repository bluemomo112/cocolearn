'use client';

import { Check, X } from 'lucide-react';
import RichContent from '../RichContent';
import { QuestionProps } from '../taskTypes';

export default function SingleChoiceQuestion({
  question, selectedAnswer, onAnswer, disabled, showResult, isCorrect, correctAnswer, compact,
}: QuestionProps) {
  if (!question.options) return null;

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-4'}>
      {question.options.map((option, optIdx) => {
        const optionLabel = String.fromCharCode(65 + optIdx);
        const isSelected = selectedAnswer === option;

        let resultStyle = '';
        let resultIcon = null;
        if (showResult) {
          const isCorrectOption = correctAnswer === option;
          const isWrongSelection = isSelected && !isCorrectOption;
          if (isCorrectOption) {
            resultStyle = 'border-green-500 bg-green-50';
            resultIcon = <Check size={compact ? 14 : 18} className="text-green-600" />;
          } else if (isWrongSelection) {
            resultStyle = 'border-red-500 bg-red-50';
            resultIcon = <X size={compact ? 14 : 18} className="text-red-600" />;
          } else {
            resultStyle = 'border-gray-200 bg-gray-50 opacity-60';
          }
        }

        return (
          <button
            key={optIdx}
            onClick={() => !disabled && !showResult && onAnswer(question.id, option, false)}
            disabled={disabled || showResult}
            className={`w-full text-left ${compact ? 'px-3 py-2 rounded-lg border' : 'p-6 rounded-2xl border-2'} transition-all ${
              showResult ? resultStyle
              : isSelected ? `border-primary-500 bg-primary-50 ${compact ? '' : 'shadow-md'}`
              : `border-gray-200 ${compact ? 'hover:bg-gray-50' : 'hover:border-gray-300 hover:bg-white'} bg-white`
            } ${disabled || showResult ? '' : 'cursor-pointer'}`}
          >
            <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4'}`}>
              <div className={`${compact ? 'w-6 h-6 text-xs' : 'w-10 h-10 text-sm'} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                showResult
                  ? (correctAnswer === option ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600')
                  : isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {optionLabel}
              </div>
              <div className={`flex-1 ${compact ? 'text-sm' : 'text-lg'} text-gray-800`}>
                <RichContent content={option} compact={compact} />
              </div>
              {showResult && resultIcon && <div className="flex-shrink-0">{resultIcon}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
