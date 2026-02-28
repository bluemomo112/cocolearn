'use client';

import { useState } from 'react';
import { X, Share2, Copy, Check, BarChart3 } from 'lucide-react';
import { PublishScope, PublishMetadata } from '@/types/self-study';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (metadata: PublishMetadata, scope: PublishScope) => void;
  isPublished: boolean;
  shareLink?: string;
}

const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级'];

const SUBJECTS = ['语文', '数学', '英语', '科学', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术'];

const MOCK_CLASSES = [
  '一年级1班', '一年级2班',
  '二年级1班', '二年级2班',
  '三年级1班', '三年级2班',
  '四年级1班', '四年级2班', '四年级3班',
  '五年级1班', '五年级2班',
  '六年级1班', '六年级2班',
];

export default function PublishModal({
  isOpen,
  onClose,
  onPublish,
  isPublished,
  shareLink,
}: PublishModalProps) {
  const [metadata, setMetadata] = useState<PublishMetadata>({
    grade: undefined,
    subjects: [],
    bindClasses: [],
  });
  const [scope, setScope] = useState<PublishScope>({
    includeResources: true,
    includeTasks: true,
    includeAISettings: true,
    includeLearningPath: true,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(metadata, scope);
      setShowSuccess(true);
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleSubject = (subject: string) => {
    setMetadata({
      ...metadata,
      subjects: metadata.subjects?.includes(subject)
        ? metadata.subjects.filter(s => s !== subject)
        : [...(metadata.subjects || []), subject],
    });
  };

  const toggleClass = (className: string) => {
    setMetadata({
      ...metadata,
      bindClasses: metadata.bindClasses?.includes(className)
        ? metadata.bindClasses.filter(c => c !== className)
        : [...(metadata.bindClasses || []), className],
    });
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
              {/* 发布信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  发布信息
                </label>
                <div className="space-y-4">
                  {/* 年级选择 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">年级</label>
                    <select
                      value={metadata.grade || ''}
                      onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">请选择年级（可选）</option>
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 学科多选 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">学科</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            metadata.subjects?.includes(subject)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 班级多选 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">绑定班级</label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {MOCK_CLASSES.map((className) => (
                          <label
                            key={className}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={metadata.bindClasses?.includes(className)}
                              onChange={() => toggleClass(className)}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{className}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  学习空间已成功发布，你可以分享给学生了
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
                      onClick={() => shareLink && copyToClipboard(shareLink)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                      {copiedLink ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 提示 */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <BarChart3 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">学生可以访问学习空间</p>
                    <p className="text-blue-700">
                      学生打开链接后可以查看你发布的内容，并在此基础上添加自己的资源和任务
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
