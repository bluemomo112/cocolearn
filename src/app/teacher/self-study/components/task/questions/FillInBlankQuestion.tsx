'use client';

import { Check, X } from 'lucide-react';
import { QuestionProps } from '../taskTypes';

export default function FillInBlankQuestion({
  question, selectedAnswer, onAnswer, disabled, showResult, isCorrect, correctAnswer, compact,
}: QuestionProps) {
  const currentValue = (selectedAnswer as string) || '';
  const blankCount = question.blanks || (question.content.match(/___/g) || []).length || 1;
  const answers = currentValue.split('|');
  const correctAnswers = typeof correctAnswer === 'string'
    ? correctAnswer.split('|')
    : Array.isArray(correctAnswer) ? correctAnswer : [];

  const handleBlankChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    while (newAnswers.length <= index) newAnswers.push('');
    newAnswers[index] = value;
    onAnswer(question.id, newAnswers.join('|'), false);
  };

  if (showResult) {
    return (
      <div className={compact ? 'space-y-3' : 'space-y-6'}>
        <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>你的答案：</p>
          {Array.from({ length: blankCount }).map((_, idx) => (
            <div key={idx} className={`${compact ? 'p-2 rounded-lg border' : 'p-4 rounded-xl border-2'} ${
              isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {isCorrect ? <Check size={compact ? 14 : 18} className="text-green-600 flex-shrink-0" />
                : <X size={compact ? 14 : 18} className="text-red-600 flex-shrink-0" />}
                <span className={compact ? 'text-sm' : 'text-lg'}>{answers[idx] || '（未作答）'}</span>
              </div>
            </div>
          ))}
        </div>
        {!isCorrect && (
          <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>正确答案：</p>
            {correctAnswers.map((ans, idx) => (
              <div key={idx} className={`${compact ? 'p-2 rounded-lg border' : 'p-4 rounded-xl border-2'} border-green-500 bg-green-50`}>
                <div className="flex items-center gap-2">
                  <Check size={compact ? 14 : 18} className="text-green-600 flex-shrink-0" />
                  <span className={`${compact ? 'text-sm' : 'text-lg'} text-green-800`}>{ans}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {blankCount === 1 ? (
        <textarea
          value={currentValue}
          onChange={(e) => onAnswer(question.id, e.target.value, false)}
          placeholder="请在此输入你的答案..."
          disabled={disabled}
          className={`w-full ${compact ? 'h-16 p-2 text-sm rounded-lg border' : 'h-32 p-4 text-lg rounded-xl border-2'} border-gray-200 focus:border-primary-500 focus:outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400`}
        />
      ) : (
        Array.from({ length: blankCount }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`${compact ? 'text-xs w-12' : 'text-sm w-16'} font-medium text-gray-500 flex-shrink-0`}>空 {idx + 1}：</span>
            <input
              type="text"
              value={answers[idx] || ''}
              onChange={(e) => handleBlankChange(idx, e.target.value)}
              placeholder={`第 ${idx + 1} 空`}
              disabled={disabled}
              className={`flex-1 ${compact ? 'p-2 text-sm rounded-lg border' : 'p-3 text-lg rounded-xl border-2'} border-gray-200 focus:border-primary-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </div>
        ))
      )}
    </div>
  );
}
