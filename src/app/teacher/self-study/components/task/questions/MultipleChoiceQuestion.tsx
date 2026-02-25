'use client';

import { Check, X, Square, CheckSquare } from 'lucide-react';
import RichContent from '../RichContent';
import { QuestionProps } from '../taskTypes';

export default function MultipleChoiceQuestion({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  showResult,
  isCorrect,
  correctAnswer,
}: QuestionProps) {
  if (!question.options) return null;

  const selectedArray = Array.isArray(selectedAnswer) ? selectedAnswer : [];
  const correctArray = Array.isArray(correctAnswer) ? correctAnswer : correctAnswer ? [correctAnswer] : [];

  return (
    <div className="space-y-4">
      {question.options.map((option, optIdx) => {
        const optionLabel = String.fromCharCode(65 + optIdx);
        const isSelected = selectedArray.includes(option);

        // 结果回顾模式
        let resultStyle = '';
        let resultIcon = null;
        if (showResult) {
          const isCorrectOption = correctArray.includes(option);
          const isWrongSelection = isSelected && !isCorrectOption;
          const isMissedCorrect = !isSelected && isCorrectOption;

          if (isCorrectOption && isSelected) {
            resultStyle = 'border-green-500 bg-green-50';
            resultIcon = <Check size={18} className="text-green-600" />;
          } else if (isWrongSelection) {
            resultStyle = 'border-red-500 bg-red-50';
            resultIcon = <X size={18} className="text-red-600" />;
          } else if (isMissedCorrect) {
            resultStyle = 'border-amber-500 bg-amber-50';
            resultIcon = <Check size={18} className="text-amber-600" />;
          } else {
            resultStyle = 'border-gray-200 bg-gray-50 opacity-60';
          }
        }

        return (
          <button
            key={optIdx}
            onClick={() => !disabled && !showResult && onAnswer(question.id, option, true)}
            disabled={disabled || showResult}
            className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
              showResult
                ? resultStyle
                : isSelected
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-white bg-white'
            } ${disabled || showResult ? '' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                showResult
                  ? (correctArray.includes(option)
                    ? (isSelected ? 'bg-green-500 text-white' : 'bg-amber-500 text-white')
                    : isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600')
                  : isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              <div className="flex-1 text-lg text-gray-800">
                <RichContent content={option} />
              </div>
              {showResult && resultIcon && (
                <div className="flex-shrink-0">{resultIcon}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
