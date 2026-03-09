'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Share2, Copy, Check, BarChart3, Download } from 'lucide-react';
import { PublishScope, PublishMetadata } from '@/types/self-study';
import { useLanguage } from '@/contexts/LanguageContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (metadata: PublishMetadata, scope: PublishScope) => void;
  isPublished: boolean;
  shareLink?: string;
  currentSpaceName?: string;
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
  currentSpaceName,
}: PublishModalProps) {
  const [metadata, setMetadata] = useState<PublishMetadata>({
    spaceName: currentSpaceName || '',
    isAnonymous: false,
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
  const [showSuccess, setShowSuccess] = useState(isPublished);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);
  const { t } = useLanguage();

  if (!isOpen) return null;

  // 生成6位随机访问码
  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const publishData = {
        ...metadata,
        accessCode: metadata.isAnonymous ? generateAccessCode() : undefined,
      };
      await onPublish(publishData, scope);
      setMetadata(publishData);
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

  const copyCodeToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadQRCode = useCallback(() => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `qrcode-${metadata.spaceName || 'space'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [metadata.spaceName]);

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
              {/* 学习空间名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学习空间名称
                </label>
                <input
                  type="text"
                  value={metadata.spaceName || ''}
                  onChange={(e) => setMetadata({ ...metadata, spaceName: e.target.value })}
                  placeholder="请输入学习空间名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

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

                  {/* 匿名模式开关 */}
                  <div className="border-t border-gray-200 pt-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-sm font-medium text-gray-700">匿名模式</div>
                        <div className="text-xs text-gray-500 mt-1">
                          开启后，学生无需绑定班级，使用访问码即可进入
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={metadata.isAnonymous || false}
                          onChange={(e) => {
                            setMetadata({
                              ...metadata,
                              isAnonymous: e.target.checked,
                              bindClasses: e.target.checked ? [] : metadata.bindClasses
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </label>
                  </div>

                  {/* 班级多选 */}
                  {!metadata.isAnonymous && (
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
                  )}
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
                  {t('发布成功！')}
                </h3>
                <p className="text-gray-600">
                  {t('学习空间已成功发布，你可以分享给学生了')}
                </p>
              </div>

              {/* 二维码 */}
              <div className="flex flex-col items-center">
                <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                  <svg
                    ref={qrRef}
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="160" height="160" fill="white" />
                    {/* QR 定位角 - 左上 */}
                    <rect x="8" y="8" width="40" height="40" rx="4" fill="none" stroke="#16a34a" strokeWidth="4" />
                    <rect x="16" y="16" width="24" height="24" rx="2" fill="#16a34a" />
                    {/* QR 定位角 - 右上 */}
                    <rect x="112" y="8" width="40" height="40" rx="4" fill="none" stroke="#16a34a" strokeWidth="4" />
                    <rect x="120" y="16" width="24" height="24" rx="2" fill="#16a34a" />
                    {/* QR 定位角 - 左下 */}
                    <rect x="8" y="112" width="40" height="40" rx="4" fill="none" stroke="#16a34a" strokeWidth="4" />
                    <rect x="16" y="120" width="24" height="24" rx="2" fill="#16a34a" />
                    {/* 中间数据区域模拟 */}
                    {[56, 64, 72, 80, 88, 96, 104].map((x) =>
                      [56, 64, 72, 80, 88, 96, 104].map((y) => (
                        <rect
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          width="6"
                          height="6"
                          fill={(x + y) % 16 === 0 || (x * y) % 13 < 5 ? '#16a34a' : 'transparent'}
                        />
                      ))
                    )}
                    {/* 散布的数据点 */}
                    {[
                      [56, 16], [64, 24], [72, 16], [80, 32], [88, 24], [96, 16],
                      [56, 32], [72, 40], [88, 40], [96, 32],
                      [16, 56], [24, 64], [32, 72], [16, 80], [24, 88], [32, 96],
                      [40, 64], [40, 80], [40, 96],
                      [112, 56], [120, 64], [128, 72], [136, 80], [120, 88], [128, 96],
                      [16, 104], [24, 104], [56, 112], [64, 120], [72, 128],
                      [80, 112], [88, 120], [96, 128], [104, 112],
                      [112, 112], [120, 120], [128, 128], [136, 136], [144, 120],
                    ].map(([x, y]) => (
                      <rect key={`d-${x}-${y}`} x={x} y={y} width="6" height="6" fill="#16a34a" />
                    ))}
                  </svg>
                </div>
                <button
                  onClick={downloadQRCode}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  {t('下载二维码')}
                </button>
              </div>

              {/* 分享信息 */}
              <div className="space-y-4">
                {/* 测验链接 + 复制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('分享链接')}
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
                      {copiedLink ? t('已复制') : t('复制')}
                    </button>
                  </div>
                </div>

                {/* 课程码 + 复制（仅匿名模式） */}
                {metadata.isAnonymous && metadata.accessCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('课程码')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={metadata.accessCode}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-lg tracking-wider text-center"
                      />
                      <button
                        onClick={() => metadata.accessCode && copyCodeToClipboard(metadata.accessCode)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        {copiedCode ? t('已复制') : t('复制')}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('学生需要输入此课程码才能进入学习空间')}
                    </p>
                  </div>
                )}
              </div>

              {/* 提示 */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <BarChart3 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">
                      {metadata.isAnonymous ? t('学生可以匿名访问学习空间') : t('学生可以访问学习空间')}
                    </p>
                    <p className="text-blue-700">
                      {metadata.isAnonymous
                        ? t('学生打开链接并输入访问码后，需要输入姓名即可进入学习空间')
                        : t('学生打开链接后可以从班级名录中选择自己的姓名登录')}
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
                {t('取消')}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? t('发布中...') : isPublished ? t('重新发布') : t('发布')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('继续发布到其他班级')}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('完成')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
