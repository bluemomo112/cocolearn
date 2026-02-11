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
      description: '让AI引导你创建个性化学习空间',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      id: 'upload' as const,
      icon: Upload,
      title: '上传我的文件',
      description: '上传文档、PPT等资料开始学习',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      id: 'library' as const,
      icon: Library,
      title: '从资源库导入',
      description: '从已有资源库中选择学习材料',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      id: 'blank' as const,
      icon: FileText,
      title: '创建空白',
      description: '创建空白空间，稍后添加内容',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
    },
  ];

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-2xl">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">选择创建方式</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-3">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => onSelectMethod(method.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 ${method.hoverColor} transition-all hover:border-gray-300 hover:shadow-md text-left`}
              >
                <div className={`p-3 rounded-lg ${method.bgColor}`}>
                  <Icon className={`w-6 h-6 ${method.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{method.title}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
