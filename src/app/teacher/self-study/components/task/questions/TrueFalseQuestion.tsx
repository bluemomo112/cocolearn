'use client';

import { Check, X } from 'lucide-react';
import { QuestionProps } from '../taskTypes';

export default function TrueFalseQuestion({
  question, selectedAnswer, onAnswer, disabled, showResult, isCorrect, correctAnswer, compact,
}: QuestionProps) {
  const options = [
    { value: 'true', label: '✓ 正确', icon: Check },
    { value: 'false', label: '✗ 错误', icon: X },
  ];

  return (
    <div className={`flex ${compact ? 'gap-2' : 'gap-6'} justify-center`}>
      {options.map(({ value, label, icon: Icon }) => {
        const isSelected = selectedAnswer === value;

        let resultStyle = '';
        let showCheckmark = false;
        let showCross = false;
        if (showResult) {
          const isCorrectOption = String(correctAnswer) === value;
          const isWrongSelection = isSelected && !isCorrectOption;
          if (isCorrectOption) {
            resultStyle = 'border-green-500 bg-green-50 text-green-700';
            showCheckmark = true;
          } else if (isWrongSelection) {
            resultStyle = 'border-red-500 bg-red-50 text-red-700';
            showCross = true;
          } else {
            resultStyle = 'border-gray-200 bg-gray-50 text-gray-400';
          }
        }

        return (
          <button
            key={value}
            onClick={() => !disabled && !showResult && onAnswer(question.id, value, false)}
            disabled={disabled || showResult}
            className={`flex-1 ${compact ? 'max-w-[120px] py-3 px-3 rounded-lg border gap-1.5' : 'max-w-[240px] py-8 px-6 rounded-2xl border-2 gap-3'} transition-all flex flex-col items-center ${
              showResult ? resultStyle
              : isSelected
                ? value === 'true' ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-red-500 bg-red-50 text-red-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
            } ${disabled || showResult ? '' : 'cursor-pointer'}`}
          >
            <Icon size={compact ? 20 : 40} strokeWidth={2.5} />
            <span className={`${compact ? 'text-xs' : 'text-lg'} font-semibold`}>{label}</span>
            {showResult && showCheckmark && <span className={`${compact ? 'text-xs' : 'text-sm'} text-green-600 font-medium`}>正确答案</span>}
            {showResult && showCross && <span className={`${compact ? 'text-xs' : 'text-sm'} text-red-600 font-medium`}>你的选择</span>}
          </button>
        );
      })}
    </div>
  );
}
