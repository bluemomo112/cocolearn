'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SelfStudyWorkbench from '@/app/teacher/self-study/components/SelfStudyWorkbench';

export default function LearnPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const [isPublished, setIsPublished] = useState<boolean | null>(null);

  // 检查空间是否已发布（这里简化处理，实际应该从后端获取）
  useEffect(() => {
    // TODO: 从后端检查发布状态
    // 目前假设所有空间都已发布
    setIsPublished(true);
  }, [spaceId]);

  if (isPublished === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (isPublished === false) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">该空间尚未发布</h1>
          <p className="text-gray-600">请联系教师获取访问权限</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <SelfStudyWorkbench
        spaceId={spaceId}
        mode="student"
      />
    </div>
  );
}
