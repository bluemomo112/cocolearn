'use client';

import { useState } from 'react';
import { ArrowLeft, Maximize2, Loader2, Sparkles, FileText } from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  animation: { label: '动画', color: 'bg-purple-100 text-purple-700' },
  visualization: { label: '可视化', color: 'bg-blue-100 text-blue-700' },
  simulation: { label: '模拟', color: 'bg-green-100 text-green-700' },
  test: { label: '测试', color: 'bg-amber-100 text-amber-700' },
};

export interface InlineViewResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  interactiveCategory?: 'animation' | 'visualization' | 'simulation' | 'test';
  description?: string;
  textContent?: string;
  icon?: string;
  toolId?: string;
}

interface ResourceInlineViewerProps {
  resource: InlineViewResource;
  onBack: () => void;
  onFullscreen: () => void;
}

export default function ResourceInlineViewer({ resource, onBack, onFullscreen }: ResourceInlineViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const hasIframeContent = !!resource.url;
  const category = resource.interactiveCategory
    ? CATEGORY_CONFIG[resource.interactiveCategory]
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 flex-shrink-0 bg-white">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="返回"
        >
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {resource.icon && <span className="text-sm flex-shrink-0">{resource.icon}</span>}
          <span className="text-sm font-medium text-gray-700 truncate">{resource.title}</span>
          {category && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${category.color}`}>
              {category.label}
            </span>
          )}
        </div>
        {hasIframeContent && (
          <button
            onClick={onFullscreen}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="全屏查看"
          >
            <Maximize2 size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {hasIframeContent ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-gray-400 animate-spin" />
                  <p className="text-xs text-gray-400">加载中...</p>
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
          </>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-500">
              {resource.icon ? (
                <span className="text-2xl">{resource.icon}</span>
              ) : (
                <FileText size={20} />
              )}
              <span className="text-sm font-medium">{resource.title}</span>
            </div>
            {resource.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
            )}
            {resource.textContent && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{resource.textContent}</p>
              </div>
            )}
            {!resource.description && !resource.textContent && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles size={24} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">此资源内容将在此处展示</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
