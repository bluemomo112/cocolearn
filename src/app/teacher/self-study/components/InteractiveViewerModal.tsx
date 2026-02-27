'use client';

import { useState } from 'react';
import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Resource } from '@/types/shared-context';

interface InteractiveViewerModalProps {
  resource: Resource | null;
  onClose: () => void;
  onShrinkToInline?: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  animation: { label: '动画', color: 'bg-purple-100 text-purple-700' },
  visualization: { label: '可视化', color: 'bg-blue-100 text-blue-700' },
  simulation: { label: '模拟', color: 'bg-green-100 text-green-700' },
  test: { label: '测试', color: 'bg-amber-100 text-amber-700' },
};

export default function InteractiveViewerModal({ resource, onClose, onShrinkToInline }: InteractiveViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!resource) return null;

  const category = resource.interactiveCategory
    ? CATEGORY_CONFIG[resource.interactiveCategory]
    : null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* 模态框 */}
      <div
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'inset-2'
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl'
        }`}
        style={isFullscreen ? undefined : { height: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {resource.title}
            </h3>
            {category && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${category.color}`}>
                {category.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (onShrinkToInline && isFullscreen) {
                  onShrinkToInline();
                } else {
                  setIsFullscreen(!isFullscreen);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? (onShrinkToInline ? '缩小到侧栏' : '退出全屏') : '全屏'}
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-500" />
              ) : (
                <Maximize2 size={18} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body - iframe */}
        <div className="flex-1 relative bg-gray-50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-primary-500 animate-spin" />
                <p className="text-sm text-gray-500">加载中...</p>
              </div>
            </div>
          )}
          <iframe
            src={resource.url}
            title={resource.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </>
  );
}
