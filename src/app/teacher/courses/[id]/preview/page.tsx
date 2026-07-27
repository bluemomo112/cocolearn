'use client'

import { useRouter } from 'next/navigation'

export default function TeacherCoursePreview() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-white">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">课程内容开发中</p>
      </div>
    </div>
  )
}
