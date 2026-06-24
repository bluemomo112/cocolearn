'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CompetencyDistributionChart, type ClassCompetencyDistribution } from './note-config/results-view'

// 模拟数据
const recentCourses = [
  {
    id: '1',
    title: '植物工厂探究',
    subjects: ['科学', '数学', '信息技术'],
    progress: 75,
    students: 32,
    lastUpdate: '2小时前',
    status: 'ongoing',
    cover: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '数学建模与环境保护',
    subjects: ['数学', '生物'],
    progress: 100,
    students: 28,
    lastUpdate: '1天前',
    status: 'completed',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '文艺复兴的科学革命',
    subjects: ['历史', '物理'],
    progress: 30,
    students: 25,
    lastUpdate: '3天前',
    status: 'ongoing',
    cover: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
  },
]

const studentActivities = [
  { id: '1', name: '李明', action: '完成了课程测验', course: '水循环与气候变化', time: '5分钟前', avatar: '李' },
  { id: '2', name: '王芳', action: '提交了作业', course: '数学建模与环境保护', time: '15分钟前', avatar: '王' },
  { id: '3', name: '张伟', action: '发起了讨论', course: '水循环与气候变化', time: '30分钟前', avatar: '张' },
  { id: '4', name: '刘洋', action: '请求了AI辅导', course: '文艺复兴的科学革命', time: '1小时前', avatar: '刘' },
]

const quickStats = [
  { label: '学生总数', value: '108', change: '+5', icon: '👥', color: 'blue' },
  { label: '本周待批改', value: '8项', change: '-3', icon: '📋', color: 'blue' },
  { label: '跨学科参与度', value: '83%', change: '+4%', icon: '🎯', color: 'blue' },
  { label: '平均任务完成率', value: '78%', change: '+4%', icon: '📊', color: 'blue' },
]

const todayTasks = [
  { id: '1', title: '批改《水循环》单元测验', priority: 'high', time: '10:00', done: false },
  { id: '2', title: '准备明天的课程资料', priority: 'medium', time: '14:00', done: false },
  { id: '3', title: '回复学生问题 (3条)', priority: 'low', time: '16:00', done: true },
  { id: '4', title: '参加教研组会议', priority: 'medium', time: '15:00', done: false },
]

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

// API Response: Main data structure for teacher competency insights
interface TeacherCompetencyInsights {
  distribution: Record<CompetencyType, CompetencyDistributionData>;
  trends: Record<CompetencyType, CourseTrendPoint[]>;
  alerts: {
    lowPerformance: StudentAlertData[];
    highPerformance: StudentAlertData[];
  };
  insights: AIInsight[];
}

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

// Single point in cross-course trend timeline
interface CourseTrendPoint {
  courseId: string;
  courseName: string;
  date: string;
  distribution: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}

// Student alert data (low/high performance)
interface StudentAlertData {
  studentId: string;
  name: string;
  rating?: number;  // 单个能力评级
  competencyType?: CompetencyType;  // 单个能力类型
  competencyTypes?: CompetencyType[];  // 多个能力类型(高表现学生)
  avgRating?: number;  // 平均评级
}

// AI-generated insight
interface AIInsight {
  type: 'trend' | 'alert';
  competency: CompetencyType;
  message: string;
}

// Filter options for competency insights
interface CompetencyFilterOptions {
  courseIds?: string[];
  timeRange?: { start: Date; end: Date };
  studentGroup?: 'all' | 'active' | 'inactive';
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'students' | 'insights' | 'ai-apps' | 'knowledge' | 'growth'>('my-courses')
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false)

  // 获取当前日期
  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来，Mo老师 👋</h1>
          <p className="text-gray-600">今天是 {dateStr}</p>
        </div>

        {/* Tabs - 我的主页子导航 */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { id: 'my-courses', label: '我的课程', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )},
            { id: 'students', label: '学生管理', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )},
            { id: 'insights', label: '教学洞察', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )},
            { id: 'ai-apps', label: 'AI应用', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            )},
            { id: 'knowledge', label: '知识库', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            )},
            { id: 'growth', label: '成长档案', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'my-courses' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 探索更多课程资源 Banner */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">探索更多课程资源</h3>
                <p className="text-gray-600 text-sm">发现平台上的优质跨学科课程资源</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/course-center"
                  className="flex items-center gap-2 px-5 py-2.5 border border-primary-300 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  进入课程中心
                </Link>
                <button
                  onClick={() => setShowCourseTypeModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  创建新课程
                </button>
              </div>
            </div>

            {/* Course List Header */}
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <h2 className="text-xl font-semibold text-gray-900">课程列表</h2>
              <span className="text-sm text-gray-500">共 4 门课程 · 2 已发布 · 2 草稿</span>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {recentCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Course Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={course.cover}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        course.status === 'completed'
                          ? 'bg-primary-500 text-white'
                          : course.status === 'draft'
                          ? 'bg-gray-500 text-white'
                          : 'bg-accent-500 text-white'
                      }`}>
                        {course.status === 'completed' ? '已发布' : course.status === 'draft' ? '草稿' : '已发布'}
                      </span>
                    </div>

                    {/* Menu Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Subjects */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                      {course.subjects.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-white/90 text-gray-700 rounded text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.students}
                      </span>
                      <span>·</span>
                      <span>{course.lastUpdate}</span>
                    </div>

                    {/* Progress */}
                    {course.status !== 'draft' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">完成进度</span>
                          <span className="font-medium text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/courses/${course.id}/edit`}
                        className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
                      >
                        编辑
                      </Link>
                      {course.status !== 'draft' && (
                        <>
                          <button
                            onClick={() => setShowCourseTypeModal(true)}
                            className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors text-center"
                          >
                            授课
                          </button>
                          <Link
                            href={`/teacher/courses/${course.id}/results`}
                            className="flex-1 px-3 py-2 border border-accent-300 text-accent-700 text-sm font-medium rounded-xl hover:bg-accent-50 transition-colors text-center"
                          >
                            查看结果
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Draft Course Card */}
              <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-500 text-white">
                      草稿
                    </span>
                  </div>
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">能源与可持续发展</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span>化学 · 地理</span>
                    <span>·</span>
                    <span>1周前</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/teacher/courses/4/edit"
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
                    >
                      继续编辑
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-fade-in">
            <TeachingInsights />
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="animate-fade-in">
            <KnowledgeBase />
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="animate-fade-in">
            <GrowthArchive />
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-fade-in">
            <StudentManagement />
          </div>
        )}

        {activeTab === 'ai-apps' && (
          <div className="animate-fade-in">
            <AIApplications />
          </div>
        )}
      </div>

      {/* 课程类型选择弹窗 */}
      {showCourseTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCourseTypeModal(false)}
          />

          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 animate-fade-in-up">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowCourseTypeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">选择课堂模式</h2>
              <p className="text-gray-500">请根据您的教学需求选择合适的课堂模式</p>
            </div>

            {/* 课堂模式选项卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 以教师为中心课堂 */}
              <button
                onClick={() => window.open('https://beta.pbl.cocorobo.cn/pbl-teacher-table/dist/#/pptEasy?cid=ae814d33-ef5d-11f0-9b8a-005056924926&userid=e9b3eb89-2446-11ee-91d8-005056b86db5&oid=45facc0a-1211-11ec-80ad-005056b86db5&org=&role=0', '_blank')}
                className="group relative w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">以教师为中心课堂</h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-500 mb-4">
                    教师实时控制课堂节奏，学生跟随教师统一进度学习
                  </p>

                  {/* 特点标签 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">实时同步</span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">统一进度</span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-lg">课堂互动</span>
                  </div>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 以学生为中心的课堂 */}
              <button
                onClick={() => window.open('teacher/note-config', '_blank')}
                className="group relative w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">以学生为中心的课堂</h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-500 mb-4">
                    学生自主探索学习，教师提供个性化指导与资源
                  </p>

                  {/* 特点标签 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">自主学习</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">个性进度</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">AI辅导</span>
                  </div>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* 底部提示 */}
            <p className="text-center text-xs text-gray-400 mt-6">
              选择后可随时在课程设置中更改课堂模式
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// 我的课程列表组件 - 不再使用，功能已合并到主组件
// function MyCoursesList() { ... }

// ============================================
// Mock Data for Competency Insights
// (Moved before TeachingInsights component to avoid hoisting issues)
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

// Mock student alert data
const mockAlerts = {
  lowPerformance: [
    { studentId: '3', name: '王浩宇', competencyType: 'critical_thinking' as CompetencyType, rating: 1 },
    { studentId: '5', name: '陈思远', competencyType: 'metacognition' as CompetencyType, rating: 2 },
    { studentId: '12', name: '赵明远', competencyType: 'information_synthesis' as CompetencyType, rating: 1 },
    { studentId: '18', name: '孙雨晴', competencyType: 'critical_thinking' as CompetencyType, rating: 2 },
  ],
  highPerformance: [
    { studentId: '6', name: '赵梓涵', competencyTypes: ['critical_thinking', 'information_synthesis', 'metacognition'] as CompetencyType[], avgRating: 4 },
    { studentId: '2', name: '李思琪', competencyTypes: ['information_synthesis', 'metacognition'] as CompetencyType[], avgRating: 3.5 },
    { studentId: '1', name: '张晓明', competencyTypes: ['critical_thinking', 'metacognition'] as CompetencyType[], avgRating: 3.8 },
  ],
};

// Mock cross-course trend data
const mockCompetencyTrends: Record<CompetencyType, CourseTrendPoint[]> = {
  critical_thinking: [
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-11', distribution: { level1: 12, level2: 28, level3: 32, level4: 13 } },
    { courseId: 'bio_01', courseName: '生物-生态系统', date: '2023-12', distribution: { level1: 10, level2: 25, level3: 35, level4: 15 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 8, level2: 22, level3: 38, level4: 17 } },
  ],
  information_synthesis: [
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-11', distribution: { level1: 8, level2: 22, level3: 38, level4: 17 } },
    { courseId: 'phy_01', courseName: '物理-能量转换', date: '2023-12', distribution: { level1: 7, level2: 20, level3: 40, level4: 18 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 5, level2: 18, level3: 42, level4: 20 } },
  ],
  metacognition: [
    { courseId: 'math_01', courseName: '数学-函数思维', date: '2023-10', distribution: { level1: 15, level2: 30, level3: 28, level4: 12 } },
    { courseId: 'bio_01', courseName: '生物-生态系统', date: '2023-12', distribution: { level1: 13, level2: 27, level3: 30, level4: 15 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 12, level2: 25, level3: 30, level4: 18 } },
  ],
  question_quality: [
    { courseId: 'sci_01', courseName: '科学探究', date: '2023-11', distribution: { level1: 12, level2: 30, level3: 32, level4: 11 } },
    { courseId: 'geo_01', courseName: '地理-气候变化', date: '2023-12', distribution: { level1: 11, level2: 29, level3: 33, level4: 12 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 10, level2: 28, level3: 35, level4: 12 } },
  ],
  creativity: [
    { courseId: 'art_01', courseName: '艺术创作', date: '2023-10', distribution: { level1: 18, level2: 32, level3: 23, level4: 12 } },
    { courseId: 'tech_01', courseName: '技术创新', date: '2023-12', distribution: { level1: 16, level2: 31, level3: 24, level4: 14 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 15, level2: 30, level3: 25, level4: 15 } },
  ],
  persistence: [
    { courseId: 'math_01', courseName: '数学-函数思维', date: '2023-10', distribution: { level1: 10, level2: 22, level3: 38, level4: 15 } },
    { courseId: 'phy_01', courseName: '物理-能量转换', date: '2023-12', distribution: { level1: 9, level2: 21, level3: 39, level4: 16 } },
    { courseId: 'current', courseName: '水循环与气候变化', date: '2024-01', distribution: { level1: 8, level2: 20, level3: 40, level4: 17 } },
  ],
};

// 教学洞察组件
function TeachingInsights() {
  const metrics = [
    { label: '平均完成率', value: '78%', trend: '+5%', good: true },
    { label: '学生满意度', value: '4.6', trend: '+0.2', good: true },
    { label: '互动频率', value: '23次/课', trend: '+3', good: true },
    { label: '作业提交率', value: '92%', trend: '-2%', good: false },
  ]

  const coursePerformance = [
    { name: '水循环与气候变化', completion: 85, satisfaction: 4.8, engagement: 92 },
    { name: '数学建模与环境保护', completion: 78, satisfaction: 4.5, engagement: 85 },
    { name: '文艺复兴的科学革命', completion: 65, satisfaction: 4.2, engagement: 70 },
    { name: '音乐中的数学之美', completion: 72, satisfaction: 4.6, engagement: 88 },
  ]

  const aiSuggestions = [
    {
      type: 'improvement',
      title: '提升《文艺复兴》课程互动率',
      description: '该课程互动率偏低，建议增加小组讨论环节和实时问答',
      action: '查看建议',
    },
    {
      type: 'success',
      title: '《水循环》课程表现优异',
      description: '学生参与度和完成率均超过平均水平，可作为其他课程参考',
      action: '生成报告',
    },
    {
      type: 'warning',
      title: '注意作业提交率下降',
      description: '近两周作业提交率有所下降，可能需要调整作业难度或截止时间',
      action: '查看详情',
    },
  ]

  // ============================================
  // Competency Insights State & Handlers
  // ============================================
  const [competencyFilters, setCompetencyFilters] = useState<CompetencyFilterOptions>({
    courseIds: [],
    studentGroup: 'all',
  })

  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const handleFilterChange = (newFilters: Partial<CompetencyFilterOptions>) => {
    setCompetencyFilters({ ...competencyFilters, ...newFilters })
  }

  const handleResetFilters = () => {
    setCompetencyFilters({
      courseIds: [],
      studentGroup: 'all',
    })
  }

  // ============================================
  // Filtered Data Computation with useMemo
  // ============================================

  // 1. Filtered Competency Distributions
  // Note: Current mock data represents class-level aggregate without courseId,
  // so we return as-is. In production, this would filter by selected courses.
  const filteredCompetencyDistributions = useMemo(() => {
    return mockCompetencyDistributions;
  }, [competencyFilters.courseIds]);

  // 2. Filtered Student Alerts (by studentGroup)
  const filteredAlerts = useMemo(() => {
    if (competencyFilters.studentGroup === 'all') {
      return mockAlerts;
    }

    // Simulate active/inactive filtering based on studentId
    // In production, this would use actual student activity data
    const isActive = (studentId: string) => parseInt(studentId) < 10;

    return {
      lowPerformance: mockAlerts.lowPerformance.filter((alert) =>
        competencyFilters.studentGroup === 'active' ? isActive(alert.studentId) : !isActive(alert.studentId)
      ),
      highPerformance: mockAlerts.highPerformance.filter((alert) =>
        competencyFilters.studentGroup === 'active' ? isActive(alert.studentId) : !isActive(alert.studentId)
      ),
    };
  }, [competencyFilters.studentGroup]);

  // 3. Filtered Competency Trends (by courseIds and timeRange)
  const filteredCompetencyTrends = useMemo(() => {
    const result: Record<CompetencyType, CourseTrendPoint[]> = {
      critical_thinking: [],
      information_synthesis: [],
      metacognition: [],
      question_quality: [],
      creativity: [],
      persistence: [],
    };

    (Object.keys(mockCompetencyTrends) as CompetencyType[]).forEach((competencyType) => {
      let trends = mockCompetencyTrends[competencyType];

      // Filter by courseIds if specified
      if (competencyFilters.courseIds && competencyFilters.courseIds.length > 0) {
        trends = trends.filter((point) => competencyFilters.courseIds!.includes(point.courseId));
      }

      // Filter by timeRange if specified
      if (competencyFilters.timeRange) {
        const { start, end } = competencyFilters.timeRange;
        trends = trends.filter((point) => {
          const pointDate = new Date(point.date + '-01'); // Append day to YYYY-MM format
          return pointDate >= start && pointDate <= end;
        });
      }

      result[competencyType] = trends;
    });

    return result;
  }, [competencyFilters.courseIds, competencyFilters.timeRange]);

  // CompetencyFilterBar Component
  const CompetencyFilterBar = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
                {competencyFilters.courseIds && competencyFilters.courseIds.length > 0
                  ? `已选 ${competencyFilters.courseIds.length} 门课程`
                  : '全部课程'}
                {' · '}
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
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程筛选（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {recentCourses.map((course) => {
                  const isSelected = competencyFilters.courseIds?.includes(course.id) || false
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        const current = competencyFilters.courseIds || []
                        const updated = isSelected
                          ? current.filter(id => id !== course.id)
                          : [...current, course.id]
                        handleFilterChange({ courseIds: updated })
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {course.title}
                    </button>
                  )
                })}
              </div>
            </div>

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

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间范围
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={competencyFilters.timeRange?.start.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const start = new Date(e.target.value)
                      handleFilterChange({
                        timeRange: {
                          start,
                          end: competencyFilters.timeRange?.end || new Date(),
                        },
                      })
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={competencyFilters.timeRange?.end.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const end = new Date(e.target.value)
                      handleFilterChange({
                        timeRange: {
                          start: competencyFilters.timeRange?.start || new Date(),
                          end,
                        },
                      })
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <span className={`text-sm font-medium ${metric.good ? 'text-primary-600' : 'text-red-500'}`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Course Performance + AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">课程表现对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">课程名称</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">完成率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">满意度</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">互动率</th>
                </tr>
              </thead>
              <tbody>
                {coursePerformance.map((course) => (
                  <tr key={course.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{course.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${course.completion >= 80 ? 'bg-primary-500' : course.completion >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${course.completion}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{course.completion}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-gray-600">⭐ {course.satisfaction}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.engagement >= 85 ? 'bg-primary-100 text-primary-600' : course.engagement >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                        {course.engagement}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-semibold text-gray-900">AI 教学建议</h3>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className={`p-4 rounded-xl border ${suggestion.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-primary-50 border-primary-100'}`}>
                <h4 className="font-medium text-gray-900 mb-1 text-sm">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                <button className={`px-3 py-1 text-xs font-medium rounded-lg ${suggestion.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>
                  {suggestion.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competency Distribution Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
            {(Object.keys(filteredCompetencyDistributions) as CompetencyType[]).map((competencyType) => {
              const data = filteredCompetencyDistributions[competencyType];

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

      {/* Student Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Performance Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-amber-50">
            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              需要关注的学生
            </h3>
            <p className="text-xs text-red-600 mt-1">在关键能力维度表现较弱，建议重点辅导</p>
          </div>
          <div className="p-5 space-y-3">
            {filteredAlerts.lowPerformance.map((alert) => {
              const competencyDef = {
                critical_thinking: { name: '批判性思维', icon: '🧠' },
                information_synthesis: { name: '信息整合', icon: '🔗' },
                metacognition: { name: '元认知', icon: '👁️' },
                question_quality: { name: '提问质量', icon: '❓' },
                creativity: { name: '创造性', icon: '💡' },
                persistence: { name: '坚持性', icon: '🎯' },
              }[alert.competencyType!];

              return (
                <div key={alert.studentId} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors cursor-pointer border border-red-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {alert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        {competencyDef.icon} {competencyDef.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(alert.rating)].map((_, i) => (
                          <span key={i} className="text-amber-400 text-xs">★</span>
                        ))}
                        {[...Array(4 - alert.rating!)].map((_, i) => (
                          <span key={i} className="text-gray-300 text-xs">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Performance Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
          <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              表现优异的学生
            </h3>
            <p className="text-xs text-emerald-600 mt-1">在多个能力维度表现突出，值得表扬与激励</p>
          </div>
          <div className="p-5 space-y-3">
            {filteredAlerts.highPerformance.map((alert) => {
              const competencyDefs = {
                critical_thinking: { name: '批判性思维', icon: '🧠' },
                information_synthesis: { name: '信息整合', icon: '🔗' },
                metacognition: { name: '元认知', icon: '👁️' },
                question_quality: { name: '提问质量', icon: '❓' },
                creativity: { name: '创造性', icon: '💡' },
                persistence: { name: '坚持性', icon: '🎯' },
              };

              return (
                <div key={alert.studentId} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-emerald-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                    {alert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-0.5">
                        平均 {alert.avgRating?.toFixed(1)}⭐
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {alert.competencyTypes?.slice(0, 2).map((type) => (
                          <span key={type} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                            {competencyDefs[type].icon}
                          </span>
                        ))}
                        {alert.competencyTypes && alert.competencyTypes.length > 2 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                            +{alert.competencyTypes.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// 知识库组件
function KnowledgeBase() {
  const personalKnowledge = [
    { id: '1', title: '跨学科教学设计模板', type: 'document', size: '2.4 MB', date: '2024-12-20' },
    { id: '2', title: '水循环课程PPT', type: 'presentation', size: '15.8 MB', date: '2024-12-18' },
    { id: '3', title: '学生评估量表', type: 'spreadsheet', size: '156 KB', date: '2024-12-15' },
  ]

  const sharedKnowledge = [
    { id: '1', title: '跨学科教学案例集', author: '教研组', downloads: 156, type: 'document' },
    { id: '2', title: 'STEM课程资源包', author: '平台精选', downloads: 892, type: 'folder' },
    { id: '3', title: '项目式学习指南', author: '李老师', downloads: 234, type: 'document' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 个人知识库 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">个人知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              + 上传文件
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {personalKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'document' ? 'bg-primary-100' :
                    item.type === 'presentation' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'document' ? 'text-primary-600' :
                      item.type === 'presentation' ? 'text-orange-600' : 'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.size} · {item.date}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 共享知识库 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">共享知识库</h3>
            </div>
            <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              浏览更多
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {sharedKnowledge.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'folder' ? 'bg-amber-100' : 'bg-primary-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      item.type === 'folder' ? 'text-amber-600' : 'text-primary-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.type === 'folder' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.author} · {item.downloads} 次下载</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    引用
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 成长档案组件
function GrowthArchive() {
  const overviewStats = [
    { label: '跨学科课程总数', value: '12', unit: '门', icon: '📚' },
    { label: '涉及学科组合', value: '8', unit: '种', icon: '🔗' },
    { label: '专业工作坊', value: '4', unit: '次', icon: '🎓' },
    { label: '获得认证', value: '3', unit: '项', icon: '🏅' },
  ]

  const competencyProfile = [
    { name: 'C-POTE跨学科设计', level: 75, desc: '能独立设计完整C-POTE教案' },
    { name: '大概念提取与联结', level: 60, desc: '能提取1-2个跨学科大概念' },
    { name: '驱动性问题设计', level: 82, desc: '能设计真实情境驱动性问题' },
    { name: '形成性评价实施', level: 68, desc: '初步掌握嵌入式过程评价方法' },
    { name: '人机协同教学', level: 55, desc: 'AI辅助工具应用入门阶段' },
  ]

  const milestones = [
    { date: '2023年9月', event: '首次主持跨学科课程设计', detail: '《水循环与气候变化》科学+地理融合课', type: 'start' },
    { date: '2024年3月', event: '参加C-STEAM设计工作坊', detail: '完成C-POTE模型系统培训，获得结业证书', type: 'training' },
    { date: '2024年6月', event: '首次完整应用C-POTE模型', detail: '《植物工厂与生物科技》全程设计实践', type: 'milestone' },
    { date: '2025年1月', event: 'AI辅助跨学科教学认证', detail: '通过人机协同教学能力初级认证', type: 'cert' },
    { date: '2025年6月', event: '参与跨学科课例研究交流', detail: '在校内教研活动中分享跨学科教学经验', type: 'share' },
  ]

  const certifications = [
    { name: 'C-POTE跨学科课程设计', status: 'done', date: '2024-03', org: '跨学科教育发展中心' },
    { name: 'PBL项目式学习设计初级', status: 'done', date: '2024-11', org: '教师专业发展学院' },
    { name: 'AI辅助教学能力初级', status: 'done', date: '2025-01', org: '教育技术应用认证' },
    { name: '跨学科教学评价专项', status: 'progress', progress: 60, org: '校本研修课程' },
  ]

  return (
    <div className="space-y-6">
      {/* 跨学科成长概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}<span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span></p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 跨学科能力画像 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">跨学科能力画像</h3>
          <span className="text-xs text-gray-400">基于教学记录自动生成</span>
        </div>
        <div className="space-y-4">
          {competencyProfile.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.desc}</span>
                </div>
                <span className="text-sm font-semibold text-primary-600">{item.level}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${item.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 成长里程碑 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-5">跨学科成长历程</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-5">
            {milestones.map((m, index) => (
              <div key={index} className="flex gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  m.type === 'cert' ? 'bg-amber-100 text-amber-600' :
                  m.type === 'milestone' ? 'bg-primary-100 text-primary-600' :
                  m.type === 'training' ? 'bg-accent-100 text-accent-600' :
                  m.type === 'share' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400">{m.date}</span>
                    <span className="font-medium text-gray-900 text-sm">{m.event}</span>
                  </div>
                  <p className="text-xs text-gray-500">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 专业认证 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">专业发展认证</h3>
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cert.status === 'done' ? 'bg-primary-100' : 'bg-amber-100'}`}>
                {cert.status === 'done' ? (
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{cert.name}</p>
                <p className="text-xs text-gray-400">{cert.org}{cert.date && ` · ${cert.date}`}</p>
                {cert.status === 'progress' && cert.progress && (
                  <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${cert.progress}%` }} />
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${cert.status === 'done' ? 'bg-primary-100 text-primary-600' : 'bg-amber-100 text-amber-600'}`}>
                {cert.status === 'done' ? '已获得' : `进行中 ${cert.progress}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 自学空间入口组件
function SelfStudyEntry() {
  const router = useRouter()

  const handleEnterSelfStudy = () => {
    router.push('/teacher/self-study')
  }

  // 模拟最近的学习空间
  const recentSpaces = [
    {
      id: 'space_1',
      title: 'Python 数据分析入门',
      topic: 'Python数据分析',
      progress: 45,
      lastAccessed: '2小时前',
      icon: '🐍',
    },
    {
      id: 'space_2',
      title: '量子力学基础概念',
      topic: '量子力学',
      progress: 20,
      lastAccessed: '1天前',
      icon: '⚛️',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 介绍卡片 */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 border border-primary-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 增强型自学工具
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">自学空间</h2>
            <p className="text-gray-600 mb-6 max-w-xl">
              面向终身学习者的 AI 增强型自学工具。你可以自主学习任何主题，AI 会根据你的需求提供个性化的学习支持。
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleEnterSelfStudy}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                进入自学空间
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 bg-gradient-to-br from-primary-200 to-accent-200 rounded-2xl flex items-center justify-center">
              <svg className="w-24 h-24 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">对话式学习</h3>
          <p className="text-sm text-gray-500">
            通过自然对话与 AI 互动，随时切换"我自己学"和"你带我学"模式
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">智能测评</h3>
          <p className="text-sm text-gray-500">
            AI 自动生成测验题目，帮助你检验学习效果，巩固知识点
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">多空间管理</h3>
          <p className="text-sm text-gray-500">
            创建多个学习空间，分别管理不同主题的学习进度和笔记
          </p>
        </div>
      </div>

      {/* 最近的学习空间 */}
      {recentSpaces.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">最近的学习空间</h3>
            <button
              onClick={handleEnterSelfStudy}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSpaces.map((space) => (
              <button
                key={space.id}
                onClick={handleEnterSelfStudy}
                className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center text-2xl">
                  {space.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{space.title}</p>
                  <p className="text-sm text-gray-500">{space.topic}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{space.progress}%</p>
                  <p className="text-xs text-gray-400">{space.lastAccessed}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 学生管理组件
function StudentManagement() {
  const [selectedClass, setSelectedClass] = useState<string>('class_1')
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showCreateStudent, setShowCreateStudent] = useState(false)

  const classes = [
    { id: 'class_1', name: '七年级(1)班', grade: '初中', studentCount: 38, year: '2024', subject: '跨学科综合' },
    { id: 'class_2', name: '七年级(2)班', grade: '初中', studentCount: 36, year: '2024', subject: '跨学科综合' },
    { id: 'class_3', name: '八年级(3)班', grade: '初中', studentCount: 34, year: '2023', subject: 'STEAM探究' },
  ]

  const studentsByClass: Record<string, { id: string; name: string; avatar: string; joinDate: string; lastActive: string; completionRate: number; status: 'active' | 'inactive' }[]> = {
    class_1: [
      { id: 's1', name: '陈晓雯', avatar: '陈', joinDate: '2024-09-01', lastActive: '今天', completionRate: 92, status: 'active' },
      { id: 's2', name: '林俊杰', avatar: '林', joinDate: '2024-09-01', lastActive: '今天', completionRate: 85, status: 'active' },
      { id: 's3', name: '黄思远', avatar: '黄', joinDate: '2024-09-01', lastActive: '昨天', completionRate: 78, status: 'active' },
      { id: 's4', name: '吴雅琪', avatar: '吴', joinDate: '2024-09-01', lastActive: '3天前', completionRate: 60, status: 'inactive' },
      { id: 's5', name: '张浩然', avatar: '张', joinDate: '2024-09-01', lastActive: '今天', completionRate: 95, status: 'active' },
      { id: 's6', name: '刘梦婷', avatar: '刘', joinDate: '2024-09-01', lastActive: '昨天', completionRate: 88, status: 'active' },
    ],
    class_2: [
      { id: 's7', name: '王子豪', avatar: '王', joinDate: '2024-09-01', lastActive: '今天', completionRate: 90, status: 'active' },
      { id: 's8', name: '李欣怡', avatar: '李', joinDate: '2024-09-01', lastActive: '今天', completionRate: 82, status: 'active' },
      { id: 's9', name: '赵宇轩', avatar: '赵', joinDate: '2024-09-01', lastActive: '2天前', completionRate: 55, status: 'inactive' },
    ],
    class_3: [
      { id: 's10', name: '孙悦', avatar: '孙', joinDate: '2023-09-01', lastActive: '今天', completionRate: 96, status: 'active' },
      { id: 's11', name: '周浩', avatar: '周', joinDate: '2023-09-01', lastActive: '昨天', completionRate: 74, status: 'active' },
    ],
  }

  const currentClass = classes.find(c => c.id === selectedClass)
  const students = studentsByClass[selectedClass] || []
  const activeCount = students.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">班级总数</p>
          <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
          <p className="text-xs text-primary-600 mt-1">+ 创建新班级</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">学生总数</p>
          <p className="text-3xl font-bold text-gray-900">{classes.reduce((sum, c) => sum + c.studentCount, 0)}</p>
          <p className="text-xs text-gray-400 mt-1">跨 {classes.length} 个班级</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">今日活跃</p>
          <p className="text-3xl font-bold text-gray-900">47</p>
          <p className="text-xs text-green-600 mt-1">↑ 较昨日 +5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 班级列表 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">我的班级</h3>
            <button
              onClick={() => setShowCreateClass(true)}
              className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              + 新建班级
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedClass === cls.id ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    selectedClass === cls.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cls.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${selectedClass === cls.id ? 'text-primary-700' : 'text-gray-900'}`}>
                      {cls.year}级{cls.name}
                    </p>
                    <p className="text-xs text-gray-500">{cls.studentCount} 名学生 · {cls.subject}</p>
                  </div>
                  {selectedClass === cls.id && (
                    <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 学生列表 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentClass ? `${currentClass.year}级${currentClass.name}` : '学生列表'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{activeCount} 人活跃 / 共 {students.length} 人（示例）</p>
            </div>
            <button
              onClick={() => setShowCreateStudent(true)}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
            >
              + 添加学生
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((student) => (
              <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {student.status === 'active' ? '活跃' : '不活跃'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">最近活跃：{student.lastActive}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-sm font-semibold text-gray-900">{student.completionRate}%</p>
                    <p className="text-xs text-gray-400">任务完成率</p>
                  </div>
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary-500"
                      style={{ width: `${student.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 新建班级弹窗 */}
      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateClass(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in-up">
            <button onClick={() => setShowCreateClass(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">新建班级</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班级名称</label>
                <input type="text" placeholder="如：七年级(3)班" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option>初中七年级</option>
                  <option>初中八年级</option>
                  <option>初中九年级</option>
                  <option>高中一年级</option>
                  <option>高中二年级</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option>2025-2026</option>
                  <option>2024-2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">教学模块</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option>跨学科综合</option>
                  <option>STEAM探究</option>
                  <option>C-STEAM创意</option>
                  <option>项目式学习</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateClass(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={() => setShowCreateClass(false)} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors">创建班级</button>
            </div>
          </div>
        </div>
      )}

      {/* 添加学生弹窗 */}
      {showCreateStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateStudent(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in-up">
            <button onClick={() => setShowCreateStudent(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">添加学生</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学生姓名</label>
                <input type="text" placeholder="请输入学生姓名" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                <input type="text" placeholder="如：2024070101" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  {['2024级七年级(1)班', '2024级七年级(2)班', '2023级八年级(3)班'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">或批量导入</label>
                <button className="w-full px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                  上传名单 Excel / CSV
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateStudent(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={() => setShowCreateStudent(false)} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors">添加学生</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// AI应用组件
function AIApplications() {
  const [agentTab, setAgentTab] = useState<'personal' | 'shared'>('personal')
  const [h5Tab, setH5Tab] = useState<'personal' | 'shared'>('personal')

  const personalAgents = [
    {
      id: 'a1',
      name: '跨学科提问助手',
      desc: '基于布鲁姆认知目标层级，自动生成高阶思维提问，适用于C-STEAM跨学科课堂',
      icon: '🤖',
      calls: 128,
      lastUsed: '今天',
      tag: '课堂辅助',
    },
    {
      id: 'a2',
      name: '学生作品评估智能体',
      desc: '对照跨学科素养评价量表，对学生项目作品进行多维度自动评分与反馈',
      icon: '📊',
      calls: 64,
      lastUsed: '昨天',
      tag: '评估反馈',
    },
    {
      id: 'a3',
      name: '课程资源生成器',
      desc: '根据课程主题与学段，自动生成学习目标、探究任务、评价标准等结构化资源',
      icon: '✨',
      calls: 45,
      lastUsed: '3天前',
      tag: '资源生成',
    },
  ]

  const sharedAgents = [
    {
      id: 'sa1',
      name: 'STEAM概念联结智能体',
      desc: '帮助学生在科学、技术、工程、艺术、数学之间建立跨学科概念联结',
      author: '平台精选',
      uses: 1240,
      tag: 'C-STEAM',
    },
    {
      id: 'sa2',
      name: '苏格拉底式对话辅导员',
      desc: '通过苏格拉底式追问引导学生深度思考，培养元认知能力与批判性思维',
      author: '教研共创',
      uses: 892,
      tag: '深度学习',
    },
    {
      id: 'sa3',
      name: '项目式学习任务规划器',
      desc: '协助教师将真实情境问题拆解为驱动性问题与阶段性探究任务序列',
      author: '平台精选',
      uses: 675,
      tag: 'PBL',
    },
    {
      id: 'sa4',
      name: '形成性评价数据分析师',
      desc: '实时分析课堂问答与学生作答数据，生成即时教学调整建议',
      author: '教研共创',
      uses: 432,
      tag: '教学评一致',
    },
  ]

  const personalH5 = [
    {
      id: 'h1',
      title: '植物光合作用互动模拟',
      desc: '可调节光照、CO₂浓度等变量，观察光合作用速率变化',
      subject: '科学·生物',
      type: '模拟实验',
      updatedAt: '2026-06-10',
    },
    {
      id: 'h2',
      title: '古丝绸之路地理与文化地图',
      desc: '交互式历史地图，展示丝路沿线的地理环境与文明交汇',
      subject: '历史·地理',
      type: '交互地图',
      updatedAt: '2026-05-28',
    },
    {
      id: 'h3',
      title: '音乐律动与数学比例探究',
      desc: '通过音频波形与频率比探究音程背后的数学规律',
      subject: '数学·音乐',
      type: '数据探究',
      updatedAt: '2026-06-18',
    },
  ]

  const sharedH5 = [
    {
      id: 'sh1',
      title: '城市碳排放与气候变化可视化',
      desc: '多城市碳排放数据对比，探究工业化对气候的影响机制',
      subject: '地理·化学',
      type: '数据可视化',
      author: '平台精选',
      uses: 3420,
    },
    {
      id: 'sh2',
      title: 'C-STEAM创意编程艺术画布',
      desc: '结合积木式编程与数学坐标系，创作参数化艺术作品',
      subject: '信息·数学·艺术',
      type: '创意编程',
      author: '教研共创',
      uses: 2180,
    },
    {
      id: 'sh3',
      title: '桥梁结构受力仿真实验台',
      desc: '调整材料与形状参数，在虚拟环境中测试桥梁承重能力',
      subject: '物理·工程',
      type: '仿真实验',
      author: '平台精选',
      uses: 1870,
    },
  ]

  const tagColors: Record<string, string> = {
    '课堂辅助': 'bg-blue-100 text-blue-700',
    '评估反馈': 'bg-purple-100 text-purple-700',
    '资源生成': 'bg-amber-100 text-amber-700',
    'C-STEAM': 'bg-green-100 text-green-700',
    '深度学习': 'bg-indigo-100 text-indigo-700',
    'PBL': 'bg-orange-100 text-orange-700',
    '教学评一致': 'bg-teal-100 text-teal-700',
  }

  return (
    <div className="space-y-6">
      {/* AI 智能体 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">AI 智能体</h3>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAgentTab('personal')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${agentTab === 'personal' ? 'bg-white text-primary-600 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                个人
              </button>
              <button
                onClick={() => setAgentTab('shared')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${agentTab === 'shared' ? 'bg-white text-primary-600 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                共享
              </button>
            </div>
          </div>
        </div>

        {agentTab === 'personal' && (
          <div>
            <div className="divide-y divide-gray-50">
              {personalAgents.map((agent) => (
                <div key={agent.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[agent.tag] || 'bg-gray-100 text-gray-600'}`}>{agent.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{agent.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">调用 {agent.calls} 次 · 最近使用：{agent.lastUsed}</p>
                    </div>
                    <button className="shrink-0 px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                      启用
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50">
              <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                + 创建新智能体
              </button>
            </div>
          </div>
        )}

        {agentTab === 'shared' && (
          <div className="divide-y divide-gray-50">
            {sharedAgents.map((agent) => (
              <div key={agent.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[agent.tag] || 'bg-gray-100 text-gray-600'}`}>{agent.tag}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{agent.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{agent.author} · {agent.uses.toLocaleString()} 次使用</p>
                  </div>
                  <button className="shrink-0 px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    引用
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* H5 资源 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">H5 互动资源</h3>
                <p className="text-xs text-gray-400">可嵌入课堂的交互式 HTML5 学习材料</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setH5Tab('personal')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${h5Tab === 'personal' ? 'bg-white text-primary-600 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                个人
              </button>
              <button
                onClick={() => setH5Tab('shared')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${h5Tab === 'shared' ? 'bg-white text-primary-600 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                共享
              </button>
            </div>
          </div>
        </div>

        {h5Tab === 'personal' && (
          <div>
            <div className="divide-y divide-gray-50">
              {personalH5.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{item.subject}</span>
                        <span className="text-xs text-gray-400">{item.type} · {item.updatedAt}</span>
                      </div>
                    </div>
                    <button className="shrink-0 px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                      预览
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50">
              <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                + 上传 H5 资源
              </button>
            </div>
          </div>
        )}

        {h5Tab === 'shared' && (
          <div className="divide-y divide-gray-50">
            {sharedH5.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{item.subject}</span>
                      <span className="text-xs text-gray-400">{item.author} · {item.uses.toLocaleString()} 次使用</span>
                    </div>
                  </div>
                  <button className="shrink-0 px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    引用
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
