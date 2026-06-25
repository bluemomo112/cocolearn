import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PublishSuccessContentProps {
  courseTitle: string;
  courseLink: string;
  accessCode: string;
}

/**
 * 发布成功内容组件（纯 UI）
 * 用于显示课程链接和随机码，提供复制功能
 * 可被 PublishSuccessModal 和 PublishConfirmModal 复用
 */
export function PublishSuccessContent({ courseTitle, courseLink, accessCode }: PublishSuccessContentProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* 课程名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">课程名称</label>
        <div className="text-base font-semibold text-gray-900">{courseTitle}</div>
      </div>

      {/* 学生端链接 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">学生端课程链接</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={courseLink}
            readOnly
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
          />
          <button
            onClick={() => copyToClipboard(courseLink, 'link')}
            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            {copiedLink ? (
              <>
                <CheckCircle size={14} />
                已复制
              </>
            ) : (
              <>
                <Copy size={14} />
                复制
              </>
            )}
          </button>
        </div>
      </div>

      {/* 随机码 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">课程随机码</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={accessCode}
            readOnly
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono tracking-wider"
          />
          <button
            onClick={() => copyToClipboard(accessCode, 'code')}
            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            {copiedCode ? (
              <>
                <CheckCircle size={14} />
                已复制
              </>
            ) : (
              <>
                <Copy size={14} />
                复制
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">学生可使用此随机码快速访问课程</p>
      </div>
    </div>
  );
}
