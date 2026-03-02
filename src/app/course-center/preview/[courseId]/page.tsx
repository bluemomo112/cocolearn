'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

// 从课程中心获取课程数据
const courses = [
  {
    id: '1',
    title: '水循环与气候变化探究',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=1200&h=600&fit=crop',
    subjects: ['地理', '物理', '化学', '生物'],
    source: 'official' as const,
    concepts: ['系统与平衡', '生态系统', '成长', '生命周期'],
    studentCount: 1240,
    teachingMode: 'both' as const,
    description: '通过跨学科视角探索水循环系统与全球气候变化的关系，理解地球系统的复杂性和相互作用。',
  },
  {
    id: '2',
    title: '诗词中的天文地理',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    subjects: ['语文', '地理', '历史'],
    source: 'organization' as const,
    concepts: ['诗词鉴赏', '天文现象', '地理特征', '文化传承'],
    studentCount: 890,
    teachingMode: 'teaching' as const,
    description: '从古诗词中学习天文地理知识，感受中华文化的博大精深。',
  },
  {
    id: '3',
    title: '数据可视化与统计分析',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    subjects: ['数学', '信息科技'],
    source: 'official' as const,
    concepts: ['统计推断', '数据表示', '算法思维', '可视化设计'],
    studentCount: 2100,
    teachingMode: 'self-study' as const,
    description: '学习数据分析的基本方法，培养数据思维和可视化表达能力。',
  },
]

export default function CoursePreview() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const mode = searchParams.get('mode') as 'teaching' | 'self-study'

  const [showConfigModal, setShowConfigModal] = useState(true)
  const [showCopyModal, setShowCopyModal] = useState(false)

  const course = courses.find(c => c.id === courseId)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">课程不存在</h1>
          <button
            onClick={() => router.push('/course-center')}
            className="text-primary-600 hover:underline"
          >
            返回课程中心
          </button>
        </div>
      </div>
    )
  }

  const handleGoToTeach = () => {
    setShowConfigModal(false)
    setShowCopyModal(true)
    // 模拟复制课程
    setTimeout(() => {
      router.push(`/teacher/workbench?courseId=${courseId}`)
    }, 1500)
  }

  const handleStartPreview = () => {
    setShowConfigModal(false)
    // 跳转到学生工作台
    router.push(`/student/workbench?courseId=${courseId}&mode=${mode}`)
  }

  const modeLabel = mode === 'teaching' ? '授课模式' : '自学模式'
  const modeDescription = mode === 'teaching'
    ? '教师引导的课堂教学，适合系统性讲解和互动讨论'
    : '学生自主探索学习，适合个性化学习路径和自我节奏'

  return (
    <>
      {/* 课程配置信息弹窗 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 头部 */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">课程配置信息</h2>
              <p className="text-gray-500">以学生视角预览课程内容</p>
            </div>

            {/* 内容 */}
            <div className="px-8 py-6 space-y-6">
              {/* 课程封面 */}
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <img
                  src={course.cover}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="space-y-4">
                {/* 课程来源 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">课程来源</label>
                  <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-lg ${
                    course.source === 'official'
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'bg-accent-50 text-accent-700 border border-accent-200'
                  }`}>
                    {course.source === 'official' ? '官方课程' : '组织课程'}
                  </span>
                </div>

                {/* 教学模式 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">教学模式</label>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      mode === 'teaching' ? 'bg-accent-100' : 'bg-fresh-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        mode === 'teaching' ? 'text-accent-600' : 'text-fresh-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{modeLabel}</h4>
                      <p className="text-sm text-gray-600">{modeDescription}</p>
                    </div>
                  </div>
                </div>

                {/* 涉及学科 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">涉及学科</label>
                  <div className="flex flex-wrap gap-2">
                    {course.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 跨学科大概念 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">跨学科大概念</label>
                  <div className="flex flex-wrap gap-2">
                    {course.concepts.map((concept) => (
                      <span
                        key={concept}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-200"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 课程描述 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">课程描述</label>
                  <p className="text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl">
                    {course.description}
                  </p>
                </div>

                {/* 学习人数 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">学习人数</label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium">{course.studentCount} 人正在学习</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="px-8 py-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleStartPreview}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                开始预览
              </button>
              <button
                onClick={handleGoToTeach}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                去授课
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 复制课程加载弹窗 */}
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

      {/* 学生工作台页面将在这里加载 */}
      <div className="min-h-screen bg-gray-50">
        {/* 这里会被重定向到 /student/workbench */}
      </div>
    </>
  )
}

