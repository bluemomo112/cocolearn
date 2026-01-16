'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ClassCompetencyDistribution, CompetencyDistributionChart } from '../../../note-config/results-view'

// ============================================
// Teacher Competency Insights Type Definitions
// ============================================

// Competency dimension types (aligned with results-view.tsx)
type CompetencyType =
  | 'critical_thinking'      // 批判性思维
  | 'information_synthesis'  // 信息整合
  | 'metacognition'          // 元认知
  | 'question_quality'       // 提问质量
  | 'creativity'             // 创造性
  | 'persistence';           // 坚持性

// Distribution data for a single competency
interface CompetencyDistributionData {
  source: 'teacher_assigned' | 'ai_detected';
  level1: number;  // ★ 的学生百分比
  level2: number;  // ★★
  level3: number;  // ★★★
  level4: number;  // ★★★★
  avgRating: number;  // 班级平均分 1-4
  totalStudents: number;
  studentsDetected?: number;  // 仅AI识别维度需要
}

// Filter options for competency insights
interface CompetencyFilterOptions {
  courseIds?: string[];
  timeRange?: { start: Date; end: Date };
  studentGroup?: 'all' | 'active' | 'inactive';
}

// ============================================
// Mock Data for Competency Insights
// ============================================

// Generate mock competency distribution data
const mockCompetencyDistributions: Record<CompetencyType, CompetencyDistributionData> = {
  critical_thinking: {
    source: 'teacher_assigned',
    level1: 8,    // 8 students with ★
    level2: 22,   // 22 students with ★★
    level3: 38,   // 38 students with ★★★
    level4: 17,   // 17 students with ★★★★
    avgRating: 2.8,
    totalStudents: 85,
  },
  information_synthesis: {
    source: 'teacher_assigned',
    level1: 5,
    level2: 18,
    level3: 42,
    level4: 20,
    avgRating: 2.9,
    totalStudents: 85,
  },
  metacognition: {
    source: 'ai_detected',
    level1: 12,
    level2: 25,
    level3: 30,
    level4: 18,
    avgRating: 2.6,
    totalStudents: 85,
    studentsDetected: 52, // AI只在52名学生中检测到元认知表现
  },
  question_quality: {
    source: 'ai_detected',
    level1: 10,
    level2: 28,
    level3: 35,
    level4: 12,
    avgRating: 2.5,
    totalStudents: 85,
    studentsDetected: 65,
  },
  creativity: {
    source: 'ai_detected',
    level1: 15,
    level2: 30,
    level3: 25,
    level4: 15,
    avgRating: 2.4,
    totalStudents: 85,
    studentsDetected: 58,
  },
  persistence: {
    source: 'ai_detected',
    level1: 8,
    level2: 20,
    level3: 40,
    level4: 17,
    avgRating: 2.7,
    totalStudents: 85,
    studentsDetected: 70,
  },
};

interface CourseResultsPageProps {
  params: {
    id: string
  }
}

export default function CourseResultsPage({ params }: CourseResultsPageProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [competencyFilters, setCompetencyFilters] = useState<CompetencyFilterOptions>({
    studentGroup: 'all',
  })

  const handleFilterChange = (newFilters: Partial<CompetencyFilterOptions>) => {
    setCompetencyFilters({ ...competencyFilters, ...newFilters })
  }

  const handleResetFilters = () => {
    setCompetencyFilters({
      studentGroup: 'all',
    })
  }

  // 模拟课程数据
  const course = {
    id: params.id,
    title: '水循环与气候变化',
    subjects: ['科学', '数学', '信息技术'],
    students: 85,
    status: 'ongoing',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/teacher"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回课程列表
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {course.students} 名学生
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  已发布
                </div>
                <div className="flex gap-1">
                  {course.subjects.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/teacher/courses/${course.id}/settings`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                课程设置
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                导出报告
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">能力洞察筛选器</h3>
                <p className="text-xs text-gray-500">
                  {competencyFilters.studentGroup === 'all' ? '全部学生' :
                   competencyFilters.studentGroup === 'active' ? '活跃学生' : '不活跃学生'}
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilterPanel && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4 animate-fade-in">
              {/* Student Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学生群体
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: '全部学生' },
                    { value: 'active', label: '活跃学生' },
                    { value: 'inactive', label: '不活跃学生' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange({ studentGroup: option.value as 'all' | 'active' | 'inactive' })}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        competencyFilters.studentGroup === option.value
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  重置筛选
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                  应用筛选
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Competency Distribution Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                能力维度班级分布
              </h3>
              <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border border-primary-200">
                跨学科核心能力评估
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(Object.keys(mockCompetencyDistributions) as CompetencyType[]).map((competencyType) => {
                const data = mockCompetencyDistributions[competencyType];

                // Transform to ClassCompetencyDistribution format for the reusable component
                const distribution: ClassCompetencyDistribution = {
                  competencyType: competencyType,
                  distribution: {
                    star1: data.level1,
                    star2: data.level2,
                    star3: data.level3,
                    star4: data.level4,
                  },
                  averageStars: data.avgRating,
                  totalStudents: data.totalStudents,
                };

                return (
                  <CompetencyDistributionChart
                    key={competencyType}
                    distribution={distribution}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">参与学生</p>
                <p className="text-2xl font-bold text-gray-900">{course.students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">平均能力评级</p>
                <p className="text-2xl font-bold text-gray-900">2.7 ⭐</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">完成率</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
