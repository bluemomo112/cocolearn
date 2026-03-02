'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock课程数据（实际应该从API获取）
const mockCourses = {
  '1': {
    id: '1',
    title: '水循环与气候变化探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=1200&h=600&fit=crop',
    subjects: ['地理', '物理'],
    description: '通过跨学科视角探索水循环系统与全球气候变化的关系，理解地球系统的复杂性和相互作用。',
    objectives: [
      '理解水循环的基本过程和驱动力',
      '分析气候变化对水循环的影响',
      '探索人类活动与水资源的关系',
    ],
    content: [
      { type: 'video', title: '水循环基础', duration: '15分钟' },
      { type: 'reading', title: '气候变化报告', duration: '20分钟' },
      { type: 'quiz', title: '知识检测', duration: '10分钟' },
    ],
  },
  '2': {
    id: '2',
    title: '数学建模与环境保护',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=600&fit=crop',
    subjects: ['数学', '生物'],
    description: '运用数学建模方法分析环境问题，培养用数学思维解决实际问题的能力。',
    objectives: [
      '掌握基本的数学建模方法',
      '分析生态系统的数学模型',
      '应用模型解决环境保护问题',
    ],
    content: [
      { type: 'video', title: '数学建模入门', duration: '18分钟' },
      { type: 'reading', title: '生态系统案例', duration: '15分钟' },
      { type: 'quiz', title: '建模练习', duration: '12分钟' },
    ],
  },
}

export default function CoursePreview() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const mode = searchParams.get('mode') as 'teaching' | 'self-study'

  const [showCopyModal, setShowCopyModal] = useState(false)
  const course = mockCourses[courseId as keyof typeof mockCourses]

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">课程不存在</h1>
          <Link href="/teacher/course-center" className="text-primary-600 hover:underline">
            返回课程中心
          </Link>
        </div>
      </div>
    )
  }

  const handleGoToTeach = () => {
    setShowCopyModal(true)
    // 模拟复制课程
    setTimeout(() => {
      router.push(`/teacher/workbench?courseId=${courseId}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/teacher/course-center"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                    mode === 'teaching' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {mode === 'teaching' ? '授课模式' : '自学模式'}
                  </span>
                  <span className="text-sm text-gray-500">学生视角预览</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGoToTeach}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              去授课
            </button>
          </div>
        </div>
      </header>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">正在复制课程...</h3>
            <p className="text-gray-600">课程将被复制到您的工作台</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={course.cover}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {course.subjects.map((subject) => (
                <span key={subject} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                  {subject}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{course.title}</h2>
            <p className="text-white/90 text-lg max-w-3xl">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Objectives */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学习目标</h3>
              <ul className="space-y-3">
                {course.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">课程内容</h3>
              <div className="space-y-3">
                {course.content.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.type === 'video' ? 'bg-red-100' :
                      item.type === 'reading' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {item.type === 'video' && (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {item.type === 'reading' && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {item.type === 'quiz' && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mode Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'teaching' ? '授课模式' : '自学模式'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {mode === 'teaching'
                  ? '教师引导的课堂教学，适合系统性讲解和互动讨论。'
                  : '学生自主探索学习，适合个性化学习路径和自我节奏。'}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'teaching' ? '支持课堂互动' : '自主学习节奏'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'teaching' ? '实时答疑解惑' : '个性化学习路径'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'teaching' ? '小组协作学习' : '智能学习推荐'}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">开始授课</h3>
              <p className="text-white/90 text-sm mb-4">
                将此课程复制到您的工作台，开始个性化编辑和授课。
              </p>
              <button
                onClick={handleGoToTeach}
                className="w-full px-4 py-2.5 bg-white text-primary-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                去授课
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

