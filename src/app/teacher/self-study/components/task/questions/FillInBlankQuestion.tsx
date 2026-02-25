'use client';

import { Check, X } from 'lucide-react';
import RichContent from '../RichContent';
import { QuestionProps } from '../taskTypes';

export default function FillInBlankQuestion({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  showResult,
  isCorrect,
  correctAnswer,
}: QuestionProps) {
  const currentValue = (selectedAnswer as string) || '';

  // 检查题干中是否有多个 ___ 标记
  const blankCount = question.blanks || (question.content.match(/___/g) || []).length || 1;
  const hasInlineBlanks = question.content.includes('___');

  // 多空时，答案用 | 分隔存储
  const answers = currentValue.split('|');
  const correctAnswers = typeof correctAnswer === 'string'
    ? correctAnswer.split('|')
    : Array.isArray(correctAnswer) ? correctAnswer : [];

  const handleBlankChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    // 确保数组长度足够
    while (newAnswers.length <= index) newAnswers.push('');
    newAnswers[index] = value;
    onAnswer(question.id, newAnswers.join('|'), false);
  };

  if (showResult) {
    return (
      <div className="space-y-6">
        {/* 你的答案 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500">你的答案：</p>
          {Array.from({ length: blankCount }).map((_, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-2 ${
              isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <Check size={18} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={18} className="text-red-600 flex-shrink-0" />
                )}
                <span className="text-lg">{answers[idx] || '（未作答）'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 正确答案 */}
        {!isCorrect && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">正确答案：</p>
            {correctAnswers.map((ans, idx) => (
              <div key={idx} className="p-4 rounded-xl border-2 border-green-500 bg-green-50">
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-lg text-green-800">{ans}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blankCount === 1 ? (
        <textarea
          value={currentValue}
          onChange={(e) => onAnswer(question.id, e.target.value, false)}
          placeholder="请在此输入你的答案..."
          disabled={disabled}
          className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-lg disabled:bg-gray-50 disabled:text-gray-400"
        />
      ) : (
        Array.from({ length: blankCount }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">空 {idx + 1}：</span>
            <input
              type="text"
              value={answers[idx] || ''}
              onChange={(e) => handleBlankChange(idx, e.target.value)}
              placeholder={`请输入第 ${idx + 1} 个空的答案`}
              disabled={disabled}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-lg disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        ))
      )}
    </div>
  );
}
