'use client';

import { Check, X } from 'lucide-react';
import { QuestionProps } from '../taskTypes';

export default function TrueFalseQuestion({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  showResult,
  isCorrect,
  correctAnswer,
}: QuestionProps) {
  const options = [
    { value: 'true', label: '✓ 正确', icon: Check },
    { value: 'false', label: '✗ 错误', icon: X },
  ];

  return (
    <div className="flex gap-6 justify-center">
      {options.map(({ value, label, icon: Icon }) => {
        const isSelected = selectedAnswer === value;

        // 结果回顾模式
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
            className={`flex-1 max-w-[240px] py-8 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
              showResult
                ? resultStyle
                : isSelected
                ? value === 'true'
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                  : 'border-red-500 bg-red-50 text-red-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
            } ${disabled || showResult ? '' : 'cursor-pointer'}`}
          >
            <Icon size={40} strokeWidth={2.5} />
            <span className="text-lg font-semibold">{label}</span>
            {showResult && showCheckmark && (
              <span className="text-sm text-green-600 font-medium">正确答案</span>
            )}
            {showResult && showCross && (
              <span className="text-sm text-red-600 font-medium">你的选择</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
