import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { PublishSuccessContent } from './PublishSuccessContent';

interface PublishSuccessModalProps {
  courseTitle: string;
  courseLink: string;
  accessCode: string;
  onClose: () => void;
}

export function PublishSuccessModal({ courseTitle, courseLink, accessCode, onClose }: PublishSuccessModalProps) {
  const openStudentPage = () => {
    window.open(courseLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn" onClick={(e) => e.stopPropagation()}>
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
        <div className="p-6">
          <PublishSuccessContent
            courseTitle={courseTitle}
            courseLink={courseLink}
            accessCode={accessCode}
          />
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
