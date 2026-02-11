'use client';

import { Sparkles, Upload, Library, FileText, X } from 'lucide-react';

interface CreationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'ai' | 'upload' | 'library' | 'blank') => void;
}

export default function CreationMethodModal({ isOpen, onClose, onSelectMethod }: CreationMethodModalProps) {
  if (!isOpen) return null;

  const methods = [
    {
      id: 'ai' as const,
      icon: Sparkles,
      title: '从AI创建',
      description: 'AI自动生成教学内容',
      recommended: true,
    },
    {
      id: 'upload' as const,
      icon: Upload,
      title: '上传我的文件',
      description: '上传PPT、Word或PDF',
      recommended: false,
    },
    {
      id: 'library' as const,
      icon: Library,
      title: '从资源库导入',
      description: '选择现成的课程模板',
      recommended: false,
    },
    {
      id: 'blank' as const,
      icon: FileText,
      title: '创建空白',
      description: '从零开始自定义',
      recommended: false,
    },
  ];

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-4xl">
        {/* 头部 */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">创建新课程</h3>
            <p className="text-sm text-gray-500">选择一种方式开始创建您的互动课</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors absolute top-6 right-6"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 2x2 网格内容 */}
        <div className="px-8 pb-8 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => onSelectMethod(method.id)}
                  className={`relative p-8 rounded-2xl border-2 transition-all hover:shadow-lg text-center ${
                    method.recommended
                      ? 'border-primary-500 bg-primary-50/30 hover:bg-primary-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {method.recommended && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                      推荐
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      method.recommended ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        method.recommended ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h4>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
