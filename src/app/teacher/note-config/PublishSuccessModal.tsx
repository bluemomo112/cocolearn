import { X, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PublishSuccessModalProps {
  courseTitle: string;
  courseLink: string;
  accessCode: string;
  onClose: () => void;
}

export function PublishSuccessModal({ courseTitle, courseLink, accessCode, onClose }: PublishSuccessModalProps) {
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

  const openStudentPage = () => {
    window.open(courseLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">发布成功！</h2>
              <p className="text-sm text-white/90 mt-1">课程已成功发布到学生端</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            关闭
          </button>
          <button
            onClick={openStudentPage}
            className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors flex items-center gap-2"
          >
            <ExternalLink size={16} />
            前往学生端
          </button>
        </div>
      </div>
    </div>
  );
}
