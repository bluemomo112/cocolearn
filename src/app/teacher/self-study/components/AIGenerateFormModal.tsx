'use client';

import { useState } from 'react';
import { X, Sparkles, Activity } from 'lucide-react';

interface AIGenerateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    topic: string;
    question: string;
    learningStyle: string;
    level: string;
  }) => void;
}

export default function AIGenerateFormModal({ isOpen, onClose, onGenerate }: AIGenerateFormModalProps) {
  const [topic, setTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState('self');
  const [level, setLevel] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!topic.trim()) {
      alert('请输入学习主题');
      return;
    }

    setIsGenerating(true);

    // 模拟生成过程
    setTimeout(() => {
      onGenerate({
        topic,
        question: '',
        learningStyle,
        level,
      });
      setIsGenerating(false);
      // 重置表单
      setTopic('');
      setLearningStyle('self');
      setLevel('beginner');
    }, 500);
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-lg">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">AI 生成学习空间</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-5">
          {/* 学习主题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学习主题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：Python 数据分析、量子力学基础..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 选择学习方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择学习方式
            </label>
            <div className="space-y-2">
              {[
                { value: 'self', label: '我自己学', desc: '自由探索，按自己的节奏' },
                { value: 'guided', label: '你带我学', desc: 'AI 引导，系统化学习' },
                { value: 'test', label: '先测测我的水平', desc: '评估现有知识，定制学习' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    learningStyle === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="learningStyle"
                    value={option.value}
                    checked={learningStyle === option.value}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 你目前的水平 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              你目前的水平
            </label>
            <div className="space-y-2">
              {[
                { value: 'beginner', label: '完全零基础', desc: '从头开始学习' },
                { value: 'basic', label: '知道一些基本概念', desc: '有初步了解' },
                { value: 'intermediate', label: '有一定基础，想深入', desc: '进阶学习' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    level === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={option.value}
                    checked={level === option.value}
                    onChange={(e) => setLevel(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !topic.trim()}
            className="flex-1 px-6 py-3 bg-primary-600 text-white text-base font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Activity size={18} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                开始生成学习空间
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
