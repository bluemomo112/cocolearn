'use client';

import { useState } from 'react';
import { X, Share2, Copy, Check, BarChart3 } from 'lucide-react';
import { PublishMode, PublishScope } from '@/types/self-study';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (mode: PublishMode, scope: PublishScope) => void;
  isPublished: boolean;
  shareLink?: string;
  accessCode?: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  onPublish,
  isPublished,
  shareLink,
  accessCode,
}: PublishModalProps) {
  const [mode, setMode] = useState<PublishMode>('self_study');
  const [scope, setScope] = useState<PublishScope>({
    includeResources: true,
    includeTasks: true,
    includeAISettings: true,
    includeLearningPath: true,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    await onPublish(mode, scope);
    setIsPublishing(false);
    setShowSuccess(true);
  };

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    await navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {isPublished ? '重新发布学习空间' : '发布学习空间'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!showSuccess ? (
            <>
              {/* 发布模式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  发布模式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('self_study')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'self_study'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">自学模式</div>
                    <div className="text-sm text-gray-600">
                      生成分享链接，任何人都可以访问学习
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('for_students')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'for_students'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">发布给学生</div>
                    <div className="text-sm text-gray-600">
                      生成访问码，学生输入后可以学习
                    </div>
                  </button>
                </div>
              </div>

              {/* 发布范围配置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  发布范围
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scope.includeResources}
                      onChange={(e) => setScope({ ...scope, includeResources: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">学习资源</div>
                      <div className="text-sm text-gray-600">包含所有上传的文档、视频等资源</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scope.includeTasks}
                      onChange={(e) => setScope({ ...scope, includeTasks: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">学习任务</div>
                      <div className="text-sm text-gray-600">包含所有配置的学习任务和练习</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scope.includeAISettings}
                      onChange={(e) => setScope({ ...scope, includeAISettings: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">AI 设置</div>
                      <div className="text-sm text-gray-600">包含 AI 风格、知识边界等配置</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scope.includeLearningPath}
                      onChange={(e) => setScope({ ...scope, includeLearningPath: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">学习路径</div>
                      <div className="text-sm text-gray-600">包含 AI 生成的学习路径规划</div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 发布成功 */}
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  发布成功！
                </h3>
                <p className="text-gray-600">
                  学习空间已成功发布，你可以分享给其他人了
                </p>
              </div>

              {/* 分享信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享链接
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => shareLink && copyToClipboard(shareLink, 'link')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                      {copiedLink ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    访问码
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={accessCode || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => accessCode && copyToClipboard(accessCode, 'code')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 提示 */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <BarChart3 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">查看学习数据</p>
                    <p className="text-blue-700">
                      点击右上角"查看分析"按钮，可以查看学生的学习进度和数据分析
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {!showSuccess ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? '发布中...' : isPublished ? '重新发布' : '发布'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
