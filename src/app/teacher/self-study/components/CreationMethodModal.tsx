'use client';

import { useState } from 'react';
import { Sparkles, Upload, Library, FileText, X } from 'lucide-react';

interface CreationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'ai' | 'upload' | 'library' | 'blank') => void;
}

export default function CreationMethodModal({ isOpen, onClose, onSelectMethod }: CreationMethodModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'upload' | 'library' | 'blank'>('ai');

  if (!isOpen) return null;

  const tabs = [
    {
      id: 'ai' as const,
      icon: Sparkles,
      title: '从AI创建',
      description: '让AI引导你创建个性化学习空间',
    },
    {
      id: 'upload' as const,
      icon: Upload,
      title: '上传我的文件',
      description: '上传文档、PPT等资料开始学习',
    },
    {
      id: 'library' as const,
      icon: Library,
      title: '从资源库导入',
      description: '从已有资源库中选择学习材料',
    },
    {
      id: 'blank' as const,
      icon: FileText,
      title: '创建空白',
      description: '创建空白空间，稍后添加内容',
    },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-3xl">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">创建新课程</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 选项卡导航 */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex flex-col items-center gap-2 transition-all relative ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{tab.title}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* 内容区域 */}
        <div className="p-8">
          <div className="text-center max-w-md mx-auto">
            {activeTabData && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <activeTabData.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{activeTabData.title}</h4>
                <p className="text-sm text-gray-600 mb-6">{activeTabData.description}</p>
                <button
                  onClick={() => onSelectMethod(activeTab)}
                  className="w-full px-6 py-3 bg-primary-600 text-white text-base font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                  继续
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
