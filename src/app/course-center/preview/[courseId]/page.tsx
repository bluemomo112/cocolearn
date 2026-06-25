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

  const course = courses.find(c => c.id === courseId)

  // 直接重定向到学生工作台
  useEffect(() => {
    if (course && mode) {
      router.push(`/student/workbench?courseId=${courseId}&mode=${mode}&preview=true`)
    }
  }, [course, mode, courseId, router])

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">正在加载预览...</p>
      </div>
    </div>
  )
}

