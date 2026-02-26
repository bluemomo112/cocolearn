'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Globe } from 'lucide-react';

type ResourceTypeOption = 'link' | 'interactive';
type InteractiveCategory = 'animation' | 'visualization' | 'simulation' | 'test';

interface LinkInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title?: string, resourceType?: ResourceTypeOption, interactiveCategory?: InteractiveCategory) => void;
}

const INTERACTIVE_CATEGORIES: { value: InteractiveCategory; label: string; icon: string }[] = [
  { value: 'animation', label: '说明动画', icon: '🎬' },
  { value: 'visualization', label: '可视化', icon: '📊' },
  { value: 'simulation', label: '互动模拟', icon: '🔬' },
  { value: 'test', label: '互动测试', icon: '🧪' },
];

export default function LinkInputModal({ isOpen, onClose, onAdd }: LinkInputModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<ResourceTypeOption>('link');
  const [interactiveCategory, setInteractiveCategory] = useState<InteractiveCategory>('animation');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (url.trim()) {
      onAdd(
        url.trim(),
        title.trim() || undefined,
        resourceType,
        resourceType === 'interactive' ? interactiveCategory : undefined
      );
      setUrl('');
      setTitle('');
      setResourceType('link');
      setInteractiveCategory('animation');
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setResourceType('link');
    setInteractiveCategory('animation');
    onClose();
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-lg">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">添加链接</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 资源类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              资源类型
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setResourceType('link')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  resourceType === 'link'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <LinkIcon size={16} />
                <span className="text-sm font-medium">普通链接</span>
              </button>
              <button
                onClick={() => setResourceType('interactive')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  resourceType === 'interactive'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Globe size={16} />
                <span className="text-sm font-medium">互动网页</span>
              </button>
            </div>
          </div>

          {/* 互动分类选择 */}
          {resourceType === 'interactive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                互动类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTERACTIVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setInteractiveCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${
                      interactiveCategory === cat.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* URL 输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              链接地址 *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* 标题输入（可选） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              资源标题（可选）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为这个链接起个名字"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              如果不填写，将自动使用网页标题
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={!url.trim()}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>
    </>
  );
}
